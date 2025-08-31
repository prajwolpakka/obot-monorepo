from typing import Dict, Any, Optional
import os
from models.document_model import Document
from langchain_core.documents import Document as LangchainDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.upload import UploadService
from services.preprocessor import DocumentProcessor
from services.embedding import EmbeddingService
from services.store import StoreService
from utils.logger import logger
from pathlib import Path
import hashlib


class DocumentService:
    """Handles document processing and storage operations."""
    
    def __init__(self):
        """Initialize with required services."""
        self.upload_service = UploadService()
        self.document_processor = DocumentProcessor()
        self.embedding_service = EmbeddingService()
        self.store_service = StoreService()
    
    def process_document(self, document: Document) -> dict:
        """
        Process a document through the complete pipeline.
        
        Args:
            document: The document to process
            
        Returns:
            dict: Processing results including document ID and status
            
        Raises:
            ValueError: If document processing fails
            Exception: For any other unexpected errors
        """
        # if not document or not document.content:
        #     raise ValueError("Document or document content cannot be empty")
            
        try:
            logger.info(f"Starting document processing for {document.name}")
            
            # 1. Extract document content using upload service
            logger.info("Extracting document content...")
            extracted_documents = self.upload_service.extract_document(document)
            logger.info(f"Extracted Documents : {extracted_documents[:50]}")
            
            if not extracted_documents:
                raise ValueError(f"No content extracted from document {document.name}")
            
            # Combine all extracted content
            combined_content = "\n\n".join([doc.page_content for doc in extracted_documents])
            logger.info(f"Extracted {len(combined_content)} characters of content")
            
            # Prepare document metadata from Document object
            document_metadata = {
                'id': document.id,
                'name': document.name,
                'path': document.path,
                'uploaded_by': document.uploaded_by,
                'organization_id': document.organization_id,
                'file_type': document.file_type,
                'file_size': document.file_size,
                'uploaded_timestamp': document.uploaded_timestamp.isoformat() if document.uploaded_timestamp else None
            }
            
            # 2. Create LangChain document with combined content and metadata
            langchain_doc = LangchainDocument(
                page_content=combined_content,
                metadata=document_metadata
            )
            
            # 3. Chunk the document
            logger.info("Chunking document...")
            chunks = self.document_processor.chunk_document(langchain_doc)
            
            if not chunks:
                logger.warning(f"No chunks generated for document {document.id}")
                return {
                    "document_id": document.id,
                    "status": "processed",
                    "chunks_processed": 0,
                    "warning": "No content chunks were generated"
                }
            
            logger.info(f"Generated {len(chunks)} chunks")
            
            # 4. Process each chunk
            chunk_count = 0
            for i, chunk in enumerate(chunks):
                try:
                    logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                    # Create stable chunk id and content hash
                    chunk_id = f"{document.id}_chunk_{i}"
                    content_hash = hashlib.sha256(chunk.page_content.encode('utf-8')).hexdigest()

                    # Check cache in Qdrant via payload
                    existing = self.store_service.get_document(chunk_id)
                    if (
                        existing
                        and existing.get("content_hash") == content_hash
                        and existing.get("embedding_model") == getattr(self.embedding_service, 'model_name', None)
                    ):
                        logger.info(f"Skip unchanged chunk {i+1}: cache hit")
                        continue

                    # Generate embeddings when needed
                    logger.info("Generating embeddings...")
                    embedding = self.embedding_service.embed_document(chunk)

                    # Store the chunk with document metadata
                    logger.info("Storing chunk in Qdrant...")
                    self.store_service.store_document(
                        document=chunk,
                        vector=embedding,
                        document_id=chunk_id,
                        content_hash=content_hash,
                        embedding_model=getattr(self.embedding_service, 'model_name', None),
                        **document_metadata,
                    )
                    chunk_count += 1
                    logger.info(f"[OK] Chunk {i+1} processed and stored successfully")
                    
                except Exception as chunk_error:
                    logger.error(f"[ERROR] Error processing chunk {i+1} of document {document.id}: {str(chunk_error)}")
                    # Continue with next chunk even if one fails
                    continue
            
            if chunk_count == 0:
                raise ValueError(f"Failed to process any chunks for document {document.id}")
            
            logger.info(f"Document processing completed successfully. {chunk_count}/{len(chunks)} chunks processed.")
            
            return {
                "document_id": document.id,
                "status": "processed",
                "chunks_processed": chunk_count,
                "total_chunks": len(chunks)
            }
            
        except Exception as e:
            logger.error(f"[ERROR] Error processing document {getattr(document, 'id', 'unknown')}: {str(e)}")
            # Re-raise with additional context
            raise type(e)(f"Failed to process document {getattr(document, 'id', 'unknown')}: {str(e)}") from e

    def _process_local_file_path(self, file_path: str) -> Dict[str, Any]:
        """Reads and loads content from a local file using the proper loader."""
        from services.upload import DocumentLoader  # to avoid circular import

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        if not os.path.isfile(file_path):
            raise ValueError(f"Path is not a file: {file_path}")

        loader = DocumentLoader.get_loader(file_path)
        documents = loader.load()

        content = "\n\n".join([doc.page_content for doc in documents])
        metadata = documents[0].metadata if documents else {}

        return {
            "content": content,
            "file_path": file_path,
            "metadata": {
                **metadata,
                "original_filename": os.path.basename(file_path),
                "file_type": Path(file_path).suffix,
                "file_size": os.path.getsize(file_path),
            }
        }

    def local_process_document(
        self, document: Document, split_size: int = None, split_overlap: int = None
    ) -> Dict[str, Any]:
        """
        Process a local document and store embeddings in Qdrant.

        Args:
            document: Document with `path` to local file
            split_size: Size of each text chunk
            split_overlap: Overlap between chunks

        Returns:
            dict: Summary of processing
        """
        try:
            if not document.path or len(document.path) == 0:
                raise ValueError("Document.path is missing")

            file_path = document.path
            logger.info(f"[FILE] Starting local processing for: {file_path}")

            processed_data = self._process_local_file_path(file_path)

            # Build langchain doc with merged metadata
            lang_doc = LangchainDocument(
                page_content=processed_data["content"],
                metadata={
                    **processed_data["metadata"],
                    "id": document.id,
                    "uploaded_by": document.uploaded_by,
                    "organization_id": document.organization_id,
                },
            )

            # Default to global config if not provided
            from config.constants import CHUNK_SIZE, CHUNK_OVERLAP
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=split_size or CHUNK_SIZE,
                chunk_overlap=split_overlap or CHUNK_OVERLAP,
                length_function=len,
            )
            chunks = splitter.split_documents([lang_doc])
            logger.info(f"[SPLIT] Split into {len(chunks)} chunks")

            if not chunks:
                raise ValueError(f"No content chunks generated for document {document.id}")

            chunk_count = 0
            for i, chunk in enumerate(chunks):
                try:
                    logger.info(f"[EMBED] Embedding chunk {i + 1}/{len(chunks)}")
                    # Stable chunk id and content hash
                    chunk_id = f"{document.id}_chunk_{i}"
                    content_hash = hashlib.sha256(chunk.page_content.encode('utf-8')).hexdigest()

                    existing = self.store_service.get_document(chunk_id)
                    if (
                        existing
                        and existing.get("content_hash") == content_hash
                        and existing.get("embedding_model") == getattr(self.embedding_service, 'model_name', None)
                    ):
                        logger.info(f"[SKIP] Unchanged chunk {i+1} (cache hit)")
                        continue

                    embedding = self.embedding_service.embed_document(chunk)
                    metadata = chunk.metadata
                    # Store the chunk with document metadata
                    try:
                        logger.info(f"Storing chunk {chunk_count + 1} with ID {chunk_id}")
                        self.store_service.store_document(
                            document=chunk,
                            vector=embedding,
                            document_id=chunk_id,
                            content_hash=content_hash,
                            embedding_model=getattr(self.embedding_service, 'model_name', None),
                            **metadata,
                        )
                        chunk_count += 1
                    except TypeError as te:
                        logger.exception(f"[ERROR] TypeError: {te}")
                    except Exception as e:
                        logger.exception(f"[ERROR] General error: {e}")
                except Exception as chunk_error:
                    logger.error(f"[ERROR] Error on chunk {i + 1}: {str(chunk_error)}")
                    continue

            if chunk_count == 0:
                raise RuntimeError("No chunks stored")

            logger.info(f"[DONE] Local document processing complete: {chunk_count}/{len(chunks)} stored")
            return {
                "document_id": document.id,
                "status": "processed",
                "chunks_processed": chunk_count,
                "total_chunks": len(chunks),
            }

        except Exception as e:
            logger.error(f"[ERROR] Error in local_process_document: {str(e)}")
            raise Exception(f"Failed to process local document: {str(e)}") from e
