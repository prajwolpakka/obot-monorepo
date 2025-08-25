from typing import List, Optional
from langchain_core.documents import Document as LangchainDocument
from services.embedding import EmbeddingService
from services.store import StoreService
from models.chat_model import ChatRequest
from services.response_generator import generate_response
from utils.logger import logger

class ChatbotService:
    def __init__(self):
        pass

    async def get_response(self, chat:ChatRequest) -> str:
        """
        Generate a response based on the input query.
        
        Args:
            chat: The chat request containing question and other parameters
        
        Returns:
            str: The generated response
        """
        context = ""
        
        # If documents are provided, search for relevant context
        if chat.documents and len(chat.documents) > 0:
            # Step 1: Embed question
            query_doc = LangchainDocument(page_content=chat.question)
            embedding_service = EmbeddingService()
            query_vector = embedding_service.embed_document(query_doc)

            # Step 2: Search from Qdrant filtered by IDs in metadata
            store_service = StoreService()
            results = store_service.search_chunks_by_ids(query_vector, chat.documents)
            
            if results:
                for i, result in enumerate(results):
                    print(f"  - Chunk {i+1}: score={result.score:.4f}, doc_id={result.payload.get('id', 'unknown')}")
            else:
                print(f"  - ❌ No chunks found for any of the document IDs")

            # Step 3: Collect context
            context = "\n\n".join([r.payload.get("page_content", "") for r in results if "page_content" in r.payload])
            
            if not context:
                logger.warning(f"⚠️ [CHATBOT_SERVICE] No usable context found from {len(results)} results")
                print(f"  - ❌ No usable context extracted from results")
        else:
            logger.info(f"🔄 [CHATBOT_SERVICE] No documents provided, proceeding with direct LLM call")

        # Step 4: Call LLM with or without context
        logger.info(f"🚀 [CHATBOT_SERVICE] Calling LLM with provider: {chat.provider}, stream: {chat.stream}")
        
        if chat.stream:
            return await self.call_llm(chat.question, context, provider=chat.provider, stream=True)

        return await self.call_llm(chat.question, context, provider=chat.provider, stream=False)
    
    def generate_prompt(self, question, context):
        """
        Generate a prompt for the LLM based on the question and context.
        Args:
            question: The question to ask the LLM
            context: The context to provide to the LLM
        Returns:
            str: The formatted prompt for the LLM
        """
        if not context:
            return f"""You are a helpful AI assistant. You only answer questions based on the provided documents. Since no documents are available, respond with: "I looked far and deep but couldn't get what you are looking for."

Question: {question}

Answer:"""

        prompt = f"""You are a helpful AI assistant. You must ONLY answer questions based on the provided context from documents. Do not use any knowledge outside of the provided context.

IMPORTANT RULES:
1. If the question can be answered using the provided context, answer it accurately and completely.
2. If the question cannot be answered from the provided context, respond EXACTLY with: "I looked far and deep but couldn't get what you are looking for."
3. Do not make up information or use general knowledge not present in the context.

Context from documents:
{context}

Question: {question}

Answer:"""
        return prompt

    async def call_llm(self, question: str, context: str, provider: str = "gemini", stream: bool = False) -> str:
        prompt = self.generate_prompt(question, context)
        
        try:
            if stream:
                return await generate_response(prompt, provider, stream=True)
            
            response = await generate_response(prompt, provider, stream=False)
            return response
            
        except Exception as e:
            raise
