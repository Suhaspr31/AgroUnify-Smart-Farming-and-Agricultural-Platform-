#!/usr/bin/env python3
"""
AgroUnify AI Backend Startup Script
"""

import os
import sys
import subprocess
import time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_requirements():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        # import tensorflow  # Optional for now
        import numpy
        import pandas
        # import cv2  # Optional for now
        from PIL import Image
        print("Core required packages are available")
        return True
    except ImportError as e:
        print(f"Missing package: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def start_server():
    """Start the FastAPI server"""
    if not check_requirements():
        return False
    
    print("Starting AgroUnify AI Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Health Check: http://localhost:8000/health")
    
    try:
        # Stay in the root directory, don't change to api/
        # Set the Python path to include current directory
        env = os.environ.copy()
        env['PYTHONPATH'] = os.getcwd() + os.pathsep + env.get('PYTHONPATH', '')
        
        # Start the server pointing to the app module
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 'api.app:app',
            '--host', '0.0.0.0',
            '--port', '8000',
            '--reload',
            '--log-level', 'info'
        ], env=env)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Failed to start server: {e}")
        print("Try running directly: python -m uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload")

if __name__ == "__main__":
    start_server()
