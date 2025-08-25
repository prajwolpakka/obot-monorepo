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
    Endpoint to handle chat requests and return responses.
    Args:
        chat (ChatRequest): The chat request containing question and documents.
    Returns:
        StreamingResponse: A streaming response if chat.stream is True, else a success response.    
    """
    try:
        chatbot_service = ChatbotService()
        print(f"streaming: {chat.stream}")
        if chat.stream:
            async def stream_gen():
                async for chunk in await chatbot_service.get_response(chat):
                    print(f"Yielding chunk on chatbot route: {chunk}")
                    yield chunk
                    await asyncio.sleep(0.02)

            return StreamingResponse(stream_gen(), media_type="text/plain")
        
        answer = await chatbot_service.get_response(chat)
        
        response_data = {"answer": answer}
        return format_success_response(data=response_data)
    except Exception as e:
        return format_error_response(str(e), status_code=500)