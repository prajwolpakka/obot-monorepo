from fastapi import APIRouter
from utils.logger import logger
from qdrant_client import QdrantClient
import socket
import time
import os
from routes.llm_router import router as llm_routes
from routes.embed_router import router as embed_routes
from routes.chatbot_router import router as chatbot_routes
from routes.chatbot_router import router as chat_routes

main_router = APIRouter()

main_router.include_router(embed_routes, tags=["Embed"])
main_router.include_router(chatbot_routes, tags=["Chatbot"])
main_router.include_router(llm_routes, tags=["LLM"])
main_router.include_router(chat_routes, tags=["Chat"])

def check_qdrant_health() -> dict:
    """
    Check Qdrant database health and return status information.
    
    Returns:
        dict: Health status information including connection, collections, and container status
    """
    logger.info("Starting Qdrant health check...")
    
    # Get Qdrant configuration from environment
    qdrant_host = os.getenv('QDRANT_HOST', 'localhost')
    qdrant_port = int(os.getenv('QDRANT_PORT', '6333'))
    
    health_status = {
        "qdrant_host": qdrant_host,
        "qdrant_port": qdrant_port,
        "connection_status": "unknown",
        "collections": [],
        "container_status": "unknown",
        "overall_status": "unknown"
    }
    
    try:
        # Check if Qdrant is reachable
        logger.info(f"Testing connection to Qdrant at {qdrant_host}:{qdrant_port}")
        with socket.create_connection((qdrant_host, qdrant_port), timeout=5):
            health_status["connection_status"] = "connected"
            logger.info("Qdrant connection successful")
    except Exception as e:
        health_status["connection_status"] = "failed"
        logger.error(f"Qdrant connection failed: {str(e)}")
        health_status["overall_status"] = "unhealthy"
        return health_status
    
    try:
        # Initialize Qdrant client
        logger.info("Initializing Qdrant client...")
        client = QdrantClient(host=qdrant_host, port=qdrant_port)
        
        # Check collections
        logger.info("Checking Qdrant collections...")
        collections_response = client.get_collections()
        collections = [col.name for col in collections_response.collections]
        health_status["collections"] = collections
        logger.info(f"Found {len(collections)} collections: {collections}")
        
        # Check container status via Docker (if available)
        try:
            import subprocess
            result = subprocess.run(
                ["docker", "ps", "--filter", "name=qdrant", "--format", "table {{.Names}}\t{{.Status}}"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0 and "qdrant" in result.stdout:
                health_status["container_status"] = "running"
                logger.info("Qdrant Docker container is running")
            else:
                health_status["container_status"] = "not_found"
                logger.warning("Qdrant Docker container not found")
        except Exception as e:
            health_status["container_status"] = "unknown"
            logger.warning(f"Could not check Docker container status: {str(e)}")
        
        # Determine overall status
        if health_status["connection_status"] == "connected":
            health_status["overall_status"] = "healthy"
            logger.info("Qdrant health check completed successfully")
        else:
            health_status["overall_status"] = "unhealthy"
            logger.error("Qdrant health check failed")
            
    except Exception as e:
        health_status["overall_status"] = "unhealthy"
        logger.error(f"Qdrant health check failed: {str(e)}")
    
    return health_status

def check_LLM_health() -> dict:
    """
    Check LLM health and return status information.
    
    Returns:
        dict: Health status information including LLM provider status
    """
    logger.info("Starting LLM health check...")
    
    # Get LLM configuration from environment
    llm_provider = os.getenv('LLM_PROVIDER', 'openrouter')
    llm_host = os.getenv('OLLAMA_HOST', 'localhost')
    llm_port = os.getenv('OLLAMA_PORT', '11434')
    
    health_status = {
        "llm_provider": llm_provider,
        "llm_host": llm_host,
        "llm_port": llm_port,
        "connection_status": "unknown",
        "models_available": [],
        "overall_status": "unknown"
    }
    
    try:
        # Check if LLM service is reachable
        logger.info(f"Testing connection to LLM at {llm_host}:{llm_port}")
        
        if llm_provider.lower() == 'ollama':
            # Test Ollama connection
            import requests
            try:
                response = requests.get(f"http://{llm_host}:{llm_port}/api/tags", timeout=10)
                if response.status_code == 200:
                    health_status["connection_status"] = "connected"
                    logger.info("Ollama connection successful")
                    
                    # Get available models
                    models_data = response.json()
                    models = [model["name"] for model in models_data.get("models", [])]
                    health_status["models_available"] = models
                    logger.info(f"Found {len(models)} models: {models}")
                else:
                    health_status["connection_status"] = "failed"
                    logger.error(f"Ollama connection failed with status {response.status_code}")
            except Exception as e:
                health_status["connection_status"] = "failed"
                logger.error(f"Ollama connection failed: {str(e)}")
        
        elif llm_provider.lower() == 'gemini':
            # Test Gemini connection (if API key is configured)
            api_key = os.getenv('GOOGLE_API_KEY')
            if api_key:
                health_status["connection_status"] = "configured"
                logger.info("Gemini API key configured")
            else:
                health_status["connection_status"] = "not_configured"
                logger.warning("Gemini API key not configured")

        elif llm_provider.lower() == 'openrouter':
            import requests
            api_key = os.getenv('OPENROUTER_API_KEY')
            if not api_key:
                health_status["connection_status"] = "not_configured"
                logger.warning("OpenRouter API key not configured")
            else:
                headers = {"Authorization": f"Bearer {api_key}"}
                try:
                    response = requests.get("https://openrouter.ai/api/v1/models", headers=headers, timeout=10)
                    if response.status_code == 200:
                        health_status["connection_status"] = "connected"
                        models_data = response.json()
                        models = [m.get("id") for m in models_data.get("data", [])]
                        health_status["models_available"] = models
                        logger.info(f"OpenRouter connection successful with {len(models)} models")
                    else:
                        health_status["connection_status"] = "failed"
                        logger.error(f"OpenRouter connection failed with status {response.status_code}")
                except Exception as e:
                    health_status["connection_status"] = "failed"
                    logger.error(f"OpenRouter connection failed: {str(e)}")
        
        # Determine overall status
        if health_status["connection_status"] in ["connected", "configured"]:
            health_status["overall_status"] = "healthy"
            logger.info("LLM health check completed successfully")
        else:
            health_status["overall_status"] = "unhealthy"
            logger.error("LLM health check failed")
            
    except Exception as e:
        health_status["overall_status"] = "unhealthy"
        logger.error(f"LLM health check failed: {str(e)}")

    return health_status

@main_router.get("/health/qdrant")
def qdrant_health():
    return check_qdrant_health()

@main_router.get("/health/llm")
def llm_health():
    return check_LLM_health()

@main_router.get("/")
def read_root():
    return {"Hello": "World"}
