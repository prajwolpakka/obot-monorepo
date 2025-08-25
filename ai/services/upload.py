import os
import tempfile
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
from dotenv import load_dotenv

from utils.logger import setup_logger

from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
    # UnstructuredPowerPointLoader,
    # UnstructuredExcelLoader,
    # UnstructuredWordDocumentLoader,
    # UnstructuredMarkdownLoader,
    # UnstructuredEmailLoader,
    CSVLoader,
)
from langchain_core.documents import Document as LangchainDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_text_splitters import RecursiveCharacterTextSplitter
from models.document_model import Document
from utils.logger import logger

# Load environment variables
load_dotenv()

# Get configuration from environment variables
UPLOAD_DIR = os.getenv('UPLOAD_DIR', './uploads')
# Parse MAX_UPLOAD_SIZE and strip any comments
max_upload_size_str = os.getenv('MAX_UPLOAD_SIZE', '10485760')
MAX_UPLOAD_SIZE = int(max_upload_size_str.split('#')[0].strip())  # Default 10MB
ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS', '.pdf,.txt,.docx,.doc,.pptx,.xlsx,.xls,.md,.csv,.eml,.msg').split(',')

class DocumentLoader:
    """Factory class to get appropriate document loader based on file type"""
    
    def __init__(self):
        self.logger = logger.getChild('DocumentLoader')
    
    LOADER_MAPPING = {
        ".pdf": (PyPDFLoader, {}),
        ".txt": (TextLoader, {"encoding": "utf-8"}),
        ".docx": (Docx2txtLoader, {}),
        # ".doc": (UnstructuredWordDocumentLoader, {}),
        # ".pptx": (UnstructuredPowerPointLoader, {}),
        # ".xlsx": (UnstructuredExcelLoader, {}),
        # ".xls": (UnstructuredExcelLoader, {}),
        # ".md": (UnstructuredMarkdownLoader, {}),
        ".csv": (CSVLoader, {}),
        # ".eml": (UnstructuredEmailLoader, {}),
        # ".msg": (UnstructuredEmailLoader, {}),
    }
    
    @classmethod
    def get_loader(cls, file_path: str):
        """Get appropriate loader for the given file"""
        ext = Path(file_path).suffix.lower()
        if ext not in cls.LOADER_MAPPING:
            error_msg = f"Unsupported file type: {ext}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        logger.debug(f"Using loader for file extension: {ext}")
        loader_class, loader_args = cls.LOADER_MAPPING[ext]
        return loader_class(file_path, **loader_args)

class UploadService:
    """Service for handling document uploads and processing"""
    
    def __init__(self, upload_dir: str = UPLOAD_DIR):
        """Initialize upload service with upload directory"""
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    def _get_save_path(self, document: Document) -> str:
        """Generate save path for the document"""
        return os.path.join(self.upload_dir, f"{document.id}_{document.name}")
    
    def save_document(self, document: Document) -> str:
        """
        Save document content to disk
        
        Args:
            document: Document object containing content to save
            
        Returns:
            str: Path where the document was saved
        """
        save_path = self._get_save_path(document)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, "wb") as buffer:
            buffer.write(document.content)
            
        return save_path
    
    def extract_document(self, document: Document) -> List[LangchainDocument]:
        """
        Extract and process document content using appropriate loader
        
        Args:
            document: Document to process
            
        Returns:
            List of Langchain Document objects with extracted content
        """
        try:
            # Save the document temporarily
            temp_dir = tempfile.mkdtemp()
            # filename = document.name or os.path.basename(document.path[0]) if document.path else "unnamed.pdf"
            # temp_path = os.path.join(temp_dir, filename)

            temp_path = os.path.join(temp_dir, document.name)
            
            with open(temp_path, "wb") as f:
                f.write(document.content)
            
            # Load and process the document
            loader = DocumentLoader.get_loader(temp_path)
            documents = loader.load()
            
            # Clean up temporary file
            try:
                os.remove(temp_path)
                os.rmdir(temp_dir)
            except Exception as e:
                pass
                
            return documents
            
        except Exception as e:
            raise Exception(f"Error processing document: {str(e)}")
    
    def process_document(self, document: Document) -> dict:
        """
        Process a document and return its content with metadata
        
        Args:
            document: Document to process
            
        Returns:
            dict: Processed document data with content and metadata
        """
        try:
            # Save the document
            file_path = self.save_document(document)
            
            # Extract content
            documents = self.extract_document(document)
            
            # Combine all pages/sections
            content = "\n\n".join([doc.page_content for doc in documents])
            metadata = documents[0].metadata if documents else {}
            
            return {
                "content": content,
                "file_path": file_path,
                "metadata": {
                    **metadata,
                    "original_filename": document.name,
                    "file_type": document.file_type,
                    "file_size": len(document.content),
                }
            }
            
        except Exception as e:
            # Clean up if there was an error
            file_path = self._get_save_path(document)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass
            raise
