from typing import List, Optional
from collections.abc import AsyncGenerator
from langchain_core.documents import Document as LangchainDocument
from services.embedding import EmbeddingService
from services.store import StoreService
from models.chat_model import ChatRequest
from services.response_generator import generate_response
from utils.logger import logger

class ChatbotService:
    def __init__(self):
        pass

    async def get_response(self, chat: ChatRequest) -> AsyncGenerator[str, None]:
        """
        Generate a response based on the input query.
        
        Args:
            chat: The chat request containing question and other parameters
        
        Returns:
            AsyncGenerator[str, None]: The streaming response generator
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
                logger.info(f"📄 Found {len(results)} relevant chunks:")
                for i, result in enumerate(results[:3]):  # Show top 3 chunks
                    chunk_id = result.payload.get('id', 'unknown')[:8]
                    score = result.score
                    content_preview = result.payload.get("page_content", "")[:100].replace('\n', ' ')
                    logger.info(f"   • Chunk {i+1}: {chunk_id}... (score: {score:.3f}) - '{content_preview}...'")
                if len(results) > 3:
                    logger.info(f"   • ... and {len(results) - 3} more chunks")
            else:
                logger.warning(f"❌ No chunks found for document IDs: {chat.documents}")

            # Step 3: Collect context
            context_chunks = [r.payload.get("page_content", "") for r in results if "page_content" in r.payload]
            context = "\n\n".join(context_chunks)

            if context:
                logger.info(f"📝 Context compiled from {len(context_chunks)} chunks ({len(context)} chars)")
            else:
                logger.warning(f"⚠️ No usable context extracted from {len(results)} results")
        else:
            logger.info(f"🔄 [CHATBOT_SERVICE] No documents provided, proceeding with direct LLM call")

        # Step 4: Call LLM with streaming (always enabled for better UX)
        logger.info(f"🚀 Calling {chat.provider} LLM (stream: always enabled)")
        if context:
            logger.info(f"📋 Using context from {len(chat.documents)} documents ({len(context)} chars)")
        else:
            logger.info(f"🔄 No documents provided - direct LLM call")

        # Always use streaming for better user experience
        return await self.call_llm(chat.question, context, provider=chat.provider, stream=True)
    
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
1. Provide SHORT, CONCISE answers (maximum 2-3 sentences)
2. Be direct and to the point
3. If the question can be answered using the provided context, answer it accurately.
4. If the question cannot be answered from the provided context, respond EXACTLY with: "I looked far and deep but couldn't get what you are looking for."
5. Do not make up information or use general knowledge not present in the context.
6. ALWAYS include source references at the end in this exact format:
   ---
   Sources: [List the specific files/pages/chapters where this information comes from]

Context from documents:
{context}

Question: {question}

Answer:"""
        return prompt

    async def call_llm(self, question: str, context: str, provider: str = "gemini", stream: bool = False):
        prompt = self.generate_prompt(question, context)

        logger.info(f"🤖 Sending to {provider}: '{question[:50]}{'...' if len(question) > 50 else ''}'")

        try:
            # Always use streaming for better UX
            if stream:
                # Return async generator directly
                return await generate_response(prompt, provider, stream=True)
            else:
                # For non-streaming, accumulate the response
                full_response = ""
                async for chunk in await generate_response(prompt, provider, stream=True):
                    full_response += chunk
                logger.info(f"✅ {provider} responded ({len(full_response)} chars)")
                return full_response

        except Exception as e:
            logger.error(f"❌ {provider} failed: {str(e)}")
            raise
