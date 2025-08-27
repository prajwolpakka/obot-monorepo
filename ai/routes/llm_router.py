from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.response_generator import generate_response
from utils.response_formatter import format_success_response, format_error_response
from models.chat_model import ChatRequest
import asyncio

router = APIRouter(prefix='/chat')

@router.post("/llm")
async def call_llm(chat: ChatRequest):
    try:
        # Extract question and stream flag from the incoming request
        prompt = chat.question
        stream = chat.stream
        provider = chat.provider

        if stream:
            # Ensure async generator is being correctly iterated
            async def stream_gen():
                async for chunk in generate_response(prompt, provider=provider, stream=True):
                    print(f"Yielding chunk on route: {chunk}")
                    yield chunk
                    await asyncio.sleep(0.02)

            return StreamingResponse(stream_gen(), media_type="text/plain")

        response = await generate_response(prompt, provider)
        return format_success_response(response)

    except Exception as e:
        print(f"Error: {e}")  # Optionally log the error for debugging
        return format_error_response("Internal Server Error", status_code=500)
