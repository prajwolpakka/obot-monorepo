from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.chat_model import ChatRequest
from utils.response_formatter import format_success_response, format_error_response
from services.store import StoreService
from services.chatbot_service import ChatbotService
from utils.logger import logger
import asyncio

router = APIRouter()
store = StoreService()

@router.post('/chat')
async def chatbot(chat: ChatRequest):
    """
    Endpoint to handle chat requests and return streaming responses.
    Args:
        chat (ChatRequest): The chat request containing question and documents.
    Returns:
        StreamingResponse: Always returns a streaming response for better UX.
    """
    try:
        chatbot_service = ChatbotService()

        # Always use streaming for better user experience
        async def stream_gen():
            async for chunk in await chatbot_service.get_response(chat):
                logger.debug(f"Streaming chunk: {chunk[:50]}...")
                yield chunk

        return StreamingResponse(stream_gen(), media_type="text/plain")

    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return format_error_response(str(e), status_code=500)