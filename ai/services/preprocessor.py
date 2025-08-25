from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document as LangchainDocument
from models.document_model import Document as AppDocument
import logging
from config.constants import CHUNK_SIZE, CHUNK_OVERLAP
from utils.logger import logger


class DocumentProcessor:
    """
    Handles document processing tasks including chunking and preparing documents for embedding.
    """
    
    def __init__(self):
        """
        Initialize the DocumentProcessor.
        
        Args:
            chunk_size: Size of each text chunk for processing
            chunk_overlap: Overlap between chunks
        """
        self.chunk_size = CHUNK_SIZE
        self.chunk_overlap = CHUNK_OVERLAP
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
        )
    
    def create_langchain_document(self, document: AppDocument) -> LangchainDocument:
        """
        Convert application document to LangChain document format.
        
        Args:
            document: Application document model
            
        Returns:
            LangchainDocument: Document in LangChain format
        """
        return LangchainDocument(
            page_content=document.content,
            metadata={
                'source': document.name,
                'uploaded_by': document.uploaded_by,
                'organization_id': document.organization_id,
                'file_type': document.file_type
            }
        )
    
    def chunk_document(self, document: LangchainDocument) -> List[LangchainDocument]:
        """
        Split a document into chunks.
        
        Args:
            document: LangChain document to split
            
        Returns:
            List of chunked LangChain documents
        """
        try:
            return self.text_splitter.split_documents([document])
        except Exception as e:
            logger.error(f"Error chunking document: {str(e)}")
            raise
    
    def prepare_chunks_for_storage(
        self, 
        chunks: List[LangchainDocument], 
        original_doc: AppDocument
    ) -> List[Dict[str, Any]]:
        """
        Prepare document chunks for storage.
        
        Args:
            chunks: List of LangChain document chunks
            original_doc: Original application document
            
        Returns:
            List of dictionaries containing chunk data and metadata
        """
        prepared_chunks = []
        for idx, chunk in enumerate(chunks):
            prepared_chunks.append({
                'id': f"{original_doc.id}_{idx}",
                'name': f"{original_doc.name}_chunk_{idx}",
                'content': chunk.page_content,
                'metadata': {
                    **chunk.metadata,
                    'chunk_index': idx,
                    'original_doc_id': original_doc.id,
                    'total_chunks': len(chunks)
                }
            })
        return prepared_chunks
