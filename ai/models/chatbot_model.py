from pydantic import BaseModel
from typing import List

class Chatbot:
    question: str
    context: str = None
    documents: List[str] = []