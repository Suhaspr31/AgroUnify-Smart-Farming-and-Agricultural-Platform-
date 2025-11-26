"""
AgroUnify AI Service - Custom Middleware
Performance, security, and monitoring middleware
"""

import time
import asyncio
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from fastapi import HTTPException
from loguru import logger
import redis.asyncio as redis
from prometheus_client import Counter, Histogram
import hashlib
import json

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
RATE_LIMIT_EXCEEDED = Counter('rate_limit_exceeded_total', 'Rate limit exceeded count')

class TimingMiddleware(BaseHTTPMiddleware):
    """Middleware to track request timing and performance metrics"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Record metrics
        REQUEST_COUNT.labels(method=request.method, status=response.status_code).inc()
        REQUEST_DURATION.observe(duration)
        
        # Add timing headers
        response.headers["X-Response-Time"] = f"{duration:.4f}s"
        response.headers["X-Service"] = "AgroUnify-AI"
        
        # Log slow requests
        if duration > 2.0:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {duration:.4f}s"
            )
        
        return response

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        
        except HTTPException as e:
            logger.warning(f"HTTP Exception: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "error": {
                        "code": e.status_code,
                        "message": e.detail,
                        "type": "HTTPException"
                    },
                    "timestamp": time.time()
                }
            )
        
        except ValueError as e:
            logger.error(f"Validation Error: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": {
                        "code": 400,
                        "message": f"Validation error: {str(e)}",
                        "type": "ValidationError"
                    },
                    "timestamp": time.time()
                }
            )
        
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": 500,
                        "message": "Internal server error",
                        "type": "InternalError"
                    },
                    "timestamp": time.time()
                }
            )

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis"""
    
    def __init__(self, app, redis_client: Callable, requests_per_minute: int = 100):
        super().__init__(app)
        self.redis_client = redis_client
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # 1 minute window
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/metrics"]:
            return await call_next(request)
        
        try:
            redis_conn = self.redis_client()
            if not redis_conn:
                # If Redis is not available, allow the request
                return await call_next(request)
            
            # Create rate limit key based on client IP
            client_ip = request.client.host
            key = f"rate_limit:{client_ip}"
            
            # Get current count
            current_count = await redis_conn.get(key)
            current_count = int(current_count) if current_count else 0
            
            if current_count >= self.requests_per_minute:
                RATE_LIMIT_EXCEEDED.inc()
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": 429,
                            "message": "Rate limit exceeded. Please try again later.",
                            "type": "RateLimitError"
                        },
                        "retry_after": self.window_size
                    }
                )
            
            # Increment counter
            pipe = redis_conn.pipeline()
            pipe.incr(key)
            pipe.expire(key, self.window_size)
            await pipe.execute()
            
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # If rate limiting fails, allow the request
        
        return await call_next(request)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security headers and validation middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Security validations
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 50 * 1024 * 1024:  # 50MB limit
            return JSONResponse(
                status_code=413,
                content={
                    "success": False,
                    "error": {
                        "code": 413,
                        "message": "Request too large",
                        "type": "SecurityError"
                    }
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

class CacheMiddleware(BaseHTTPMiddleware):
    """Response caching middleware"""
    
    def __init__(self, app, redis_client: Callable, cache_ttl: int = 300):
        super().__init__(app)
        self.redis_client = redis_client
        self.cache_ttl = cache_ttl
    
    def _generate_cache_key(self, request: Request) -> str:
        """Generate cache key from request"""
        key_data = f"{request.method}:{request.url.path}:{request.url.query}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only cache GET requests
        if request.method != "GET":
            return await call_next(request)
        
        try:
            redis_conn = self.redis_client()
            if not redis_conn:
                return await call_next(request)
            
            cache_key = f"cache:{self._generate_cache_key(request)}"
            
            # Try to get from cache
            cached_response = await redis_conn.get(cache_key)
            if cached_response:
                logger.info(f"Cache hit for: {request.url.path}")
                cached_data = json.loads(cached_response)
                return JSONResponse(
                    content=cached_data["content"],
                    status_code=cached_data["status_code"],
                    headers={"X-Cache": "HIT"}
                )
            
            # Process request
            response = await call_next(request)
            
            # Cache successful responses
            if response.status_code == 200:
                try:
                    response_body = b""
                    async for chunk in response.body_iterator:
                        response_body += chunk
                    
                    content = json.loads(response_body.decode())
                    
                    cache_data = {
                        "content": content,
                        "status_code": response.status_code
                    }
                    
                    await redis_conn.setex(
                        cache_key,
                        self.cache_ttl,
                        json.dumps(cache_data)
                    )
                    
                    response.headers["X-Cache"] = "MISS"
                    return JSONResponse(
                        content=content,
                        status_code=response.status_code,
                        headers=dict(response.headers)
                    )
                except:
                    pass  # If caching fails, return original response
            
        except Exception as e:
            logger.error(f"Cache middleware error: {e}")
        
        return response

class CompressionMiddleware(BaseHTTPMiddleware):
    """Custom compression middleware for better performance"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add compression info
        if "gzip" in request.headers.get("accept-encoding", ""):
            response.headers["Vary"] = "Accept-Encoding"
        
        return response