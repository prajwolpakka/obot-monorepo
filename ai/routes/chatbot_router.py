from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.chat_model import ChatRequest
from utils.response_formatter import format_error_response
from services.chatbot_service import ChatbotService
from utils.logger import logger

router = APIRouter()

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

        async def stream_gen():
            response_gen = await chatbot_service.get_response(chat)
            async for chunk in response_gen:
                logger.debug(f"Streaming chunk: {chunk[:50]}...")
                yield chunk

        return StreamingResponse(stream_gen(), media_type="text/plain")

    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return format_error_response(str(e), status_code=500)
