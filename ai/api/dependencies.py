# dependencies.py
from api.core import redis_client, model_manager, services

def get_services():
    return services

def get_model_manager():
    return model_manager
