from pydantic import BaseModel
from typing import List

# Define the ChatRequest using Pydantic
class ChatRequest(BaseModel):
    question: str
    context: str = ''
    documents: List[str] = []
    stream: bool = False
    provider: str = 'openrouter'
