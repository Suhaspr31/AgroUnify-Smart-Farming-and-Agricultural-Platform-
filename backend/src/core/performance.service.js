const logger = require('./logger');

class PerformanceService {
  constructor() {
    this.metrics = {
      responseTimes: [],
      errorRates: [],
      throughput: [],
      cacheHitRates: []
    };
    this.maxMetricsHistory = 1000;
  }

  // Response time monitoring
  recordResponseTime(route, method, duration) {
    const metric = {
      route,
      method,
      duration,
      timestamp: Date.now()
    };

    this.metrics.responseTimes.push(metric);

    // Keep only recent metrics
    if (this.metrics.responseTimes.length > this.maxMetricsHistory) {
      this.metrics.responseTimes.shift();
    }

    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn(`Slow request: ${method} ${route} took ${duration}ms`);
    }
  }

  // Error rate monitoring
  recordError(route, method, error) {
    const metric = {
      route,
      method,
      error: error.message,
      timestamp: Date.now()
    };

    this.metrics.errorRates.push(metric);

    if (this.metrics.errorRates.length > this.maxMetricsHistory) {
      this.metrics.errorRates.shift();
    }
  }

  // Throughput monitoring
  recordRequest(route, method) {
    const metric = {
      route,
      method,
      timestamp: Date.now()
    };

    this.metrics.throughput.push(metric);

    if (this.metrics.throughput.length > this.maxMetricsHistory) {
      this.metrics.throughput.shift();
    }
  }

  // Cache hit rate monitoring
  recordCacheAccess(hit = true) {
    const metric = {
      hit,
      timestamp: Date.now()
    };

    this.metrics.cacheHitRates.push(metric);

    if (this.metrics.cacheHitRates.length > this.maxMetricsHistory) {
      this.metrics.cacheHitRates.shift();
    }
  }

  // Get performance metrics
  getMetrics(timeRange = 3600000) { // Last hour by default
    const now = Date.now();
    const cutoff = now - timeRange;

    const filterRecent = (metrics) => metrics.filter(m => m.timestamp > cutoff);

    const responseTimes = filterRecent(this.metrics.responseTimes);
    const errorRates = filterRecent(this.metrics.errorRates);
    const throughput = filterRecent(this.metrics.throughput);
    const cacheHits = filterRecent(this.metrics.cacheHitRates);

    return {
      responseTime: this.calculateResponseTimeStats(responseTimes),
      errorRate: this.calculateErrorRateStats(errorRates, throughput.length),
      throughput: this.calculateThroughputStats(throughput),
      cacheHitRate: this.calculateCacheHitRate(cacheHits),
      timeRange: `${timeRange / 1000 / 60} minutes`
    };
  }

  // Calculate response time statistics
  calculateResponseTimeStats(responseTimes) {
    if (responseTimes.length === 0) return { avg: 0, min: 0, max: 0, p95: 0, p99: 0 };

    const durations = responseTimes.map(rt => rt.duration).sort((a, b) => a - b);

    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const p95 = durations[p95Index] || max;
    const p99 = durations[p99Index] || max;

    return {
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      p95,
      p99,
      count: durations.length
    };
  }

  // Calculate error rate statistics
  calculateErrorRateStats(errorRates, totalRequests) {
    const errorCount = errorRates.length;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    // Error rate by route
    const errorsByRoute = {};
    errorRates.forEach(error => {
      const key = `${error.method} ${error.route}`;
      errorsByRoute[key] = (errorsByRoute[key] || 0) + 1;
    });

    return {
      overall: Math.round(errorRate * 100) / 100,
      count: errorCount,
      byRoute: errorsByRoute
    };
  }

  // Calculate throughput statistics
  calculateThroughputStats(throughput) {
    if (throughput.length === 0) return { perSecond: 0, perMinute: 0, total: 0 };

    // Group by minute
    const byMinute = {};
    throughput.forEach(req => {
      const minute = Math.floor(req.timestamp / 60000) * 60000; // Round to minute
      byMinute[minute] = (byMinute[minute] || 0) + 1;
    });

    const requestsPerMinute = Object.values(byMinute);
    const avgPerMinute = requestsPerMinute.reduce((sum, rpm) => sum + rpm, 0) / requestsPerMinute.length;

    return {
      perSecond: Math.round((avgPerMinute / 60) * 100) / 100,
      perMinute: Math.round(avgPerMinute * 100) / 100,
      total: throughput.length,
      peakMinute: Math.max(...requestsPerMinute)
    };
  }

  // Calculate cache hit rate
  calculateCacheHitRate(cacheHits) {
    if (cacheHits.length === 0) return { hitRate: 0, hits: 0, misses: 0 };

    const hits = cacheHits.filter(ch => ch.hit).length;
    const misses = cacheHits.length - hits;
    const hitRate = (hits / cacheHits.length) * 100;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      hits,
      misses,
      total: cacheHits.length
    };
  }

  // Database query optimization monitoring
  recordQueryPerformance(query, duration, collection) {
    if (duration > 100) { // Log slow queries
      logger.warn(`Slow query on ${collection}: ${query} took ${duration}ms`);
    }

    // Store for analysis
    const metric = {
      query: query.substring(0, 100), // Truncate long queries
      duration,
      collection,
      timestamp: Date.now()
    };

    // In a real implementation, you'd store this in a metrics collection
    // For now, just log significant issues
    if (duration > 500) {
      logger.error(`Very slow query detected: ${duration}ms on ${collection}`);
    }
  }

  // Memory usage monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();

    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100,
      heapUsedPercent: Math.round((usage.heapUsed / usage.heapTotal) * 100 * 100) / 100
    };
  }

  // Health check with performance metrics
  async healthCheck() {
    const metrics = this.getMetrics(300000); // Last 5 minutes
    const memory = this.getMemoryUsage();

    const isHealthy = metrics.errorRate.overall < 5 && // Less than 5% error rate
                      metrics.responseTime.avg < 2000 && // Average response time < 2s
                      memory.heapUsedPercent < 85; // Heap usage < 85%

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      metrics,
      memory,
      timestamp: new Date().toISOString()
    };
  }

  // Performance recommendations
  getPerformanceRecommendations() {
    const metrics = this.getMetrics();
    const recommendations = [];

    if (metrics.responseTime.avg > 1000) {
      recommendations.push({
        type: 'response_time',
        priority: 'high',
        issue: 'Average response time is high',
        recommendation: 'Consider implementing caching, database indexing, or code optimization',
        currentValue: `${metrics.responseTime.avg}ms`,
        target: '< 500ms'
      });
    }

    if (metrics.errorRate.overall > 2) {
      recommendations.push({
        type: 'error_rate',
        priority: 'high',
        issue: 'Error rate is above acceptable threshold',
        recommendation: 'Investigate and fix the root causes of errors',
        currentValue: `${metrics.errorRate.overall}%`,
        target: '< 2%'
      });
    }

    if (metrics.cacheHitRate.hitRate < 70) {
      recommendations.push({
        type: 'cache_efficiency',
        priority: 'medium',
        issue: 'Cache hit rate is low',
        recommendation: 'Review cache strategy and increase TTL for frequently accessed data',
        currentValue: `${metrics.cacheHitRate.hitRate}%`,
        target: '> 80%'
      });
    }

    return recommendations;
  }

  // Alert system for critical performance issues
  checkAlerts() {
    const metrics = this.getMetrics(600000); // Last 10 minutes
    const alerts = [];

    if (metrics.errorRate.overall > 10) {
      alerts.push({
        level: 'critical',
        type: 'error_rate',
        message: `Error rate is critically high: ${metrics.errorRate.overall}%`,
        threshold: '10%'
      });
    }

    if (metrics.responseTime.p99 > 5000) {
      alerts.push({
        level: 'warning',
        type: 'response_time',
        message: `P99 response time is high: ${metrics.responseTime.p99}ms`,
        threshold: '5000ms'
      });
    }

    const memory = this.getMemoryUsage();
    if (memory.heapUsedPercent > 90) {
      alerts.push({
        level: 'critical',
        type: 'memory_usage',
        message: `Memory usage is critical: ${memory.heapUsedPercent}%`,
        threshold: '90%'
      });
    }

    return alerts;
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      memory: this.getMemoryUsage(),
      recommendations: this.getPerformanceRecommendations(),
      alerts: this.checkAlerts()
    };
  }
}

module.exports = new PerformanceService();