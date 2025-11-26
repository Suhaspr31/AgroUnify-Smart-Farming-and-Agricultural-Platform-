# api/core.py
import logging
logging.basicConfig(level=logging.INFO)

try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    logging.info("TensorFlow and Keras loaded successfully.")
except ImportError as e:
    logging.error(f"Failed to import TensorFlow: {e}")
    tf = None
    load_model = None

from redis import Redis

# Initialize shared services here
try:
    redis_client = Redis(host='localhost', port=6379, decode_responses=True)
    logging.info("Redis client initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Redis client: {e}")
    redis_client = None

model_manager = {}   # placeholder for your ML models
services = {}        # any additional services
