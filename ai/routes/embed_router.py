from fastapi import APIRouter
from utils.response_formatter import format_success_response, format_error_response
from models.document_model import Document, Documents, LocalDocument
from services.document import DocumentService
from services.store import StoreService
from utils.logger import logger
import os

router = APIRouter()

@router.post('/embedd/local')
async def embedd_local_file(request_data: dict):
    """
        Embed local files by processing each file path provided in the request.
        Args:
            request_data: Dict containing:
                - file_path: List of file paths to embed (required)
                - document_id: Document UUID to use for storage (required)
        Returns:
            JSON response indicating success or failure.
    """
    try:
        file_paths = request_data.get('file_path', [])
        document_id = request_data.get('document_id')
        
        # Validate required fields
        if not file_paths:
            return format_error_response("file_path is required", status_code=400)
        if not document_id:
            return format_error_response("document_id is required", status_code=400)
        
        print("Start embedding local files...")
        print("File Paths : \n", file_paths)
        print("Document ID : \n", document_id)
        
        document_object = DocumentService()
        response = []
        
        for path in file_paths:
            logger.info(f"Processing Local File : {path}")
            # Always use the provided document_id
            file_id = document_id
            logger.info(f"File ID : {file_id}")
            
            # Construct a synthetic Document object per file
            document = Document(
                id=file_id,
                path=path,
                name=os.path.basename(path),
                file_type=os.path.splitext(path)[-1],
                file_size=os.path.getsize(path),
            )
            result = document_object.local_process_document(document)
            response.append(result)

        return format_success_response(data=response)
        
    except Exception as e:
        logger.exception(f"Error while embedding local files: {e}")
        return format_error_response("Internal Server Error", status_code=500)

@router.get('/debug/documents/{document_id}')
async def debug_document_chunks(document_id: str):
    """
    Debug endpoint to check what chunks exist for a document in Qdrant.
    Args:
        document_id: ID of the document to check
    Returns:
        JSON response with chunk information.
    """
    try:
        store_service = StoreService()
        
        # Search all chunks with this document ID
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        from utils.qdrant_db import client
        from config.constants import QDRANT_COLLECTION_NAME
        
        # Filter by document ID
        filter_condition = Filter(
            must=[
                FieldCondition(
                    key="id",
                    match=MatchValue(value=document_id)
                )
            ]
        )
        
        # Search with no vector (scroll through all matching)
        results = client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            scroll_filter=filter_condition,
            limit=100,
            with_payload=True,
            with_vectors=False
        )
        
        chunks_info = []
        for point in results[0]:  # results[0] contains the points
            payload = point.payload
            chunks_info.append({
                "id": str(point.id),
                "document_id": payload.get("id"),
                "content_preview": payload.get("page_content", "")[:200] + "..." if payload.get("page_content", "") else "No content",
                "metadata": {k: v for k, v in payload.items() if k not in ["page_content"]}
            })
        
        return format_success_response(data={
            "document_id": document_id,
            "chunks_found": len(chunks_info),
            "chunks": chunks_info
        })
        
    except Exception as e:
        logger.exception(f"Error debugging document {document_id}: {e}")
        return format_error_response(f"Error debugging document: {str(e)}", status_code=500)

@router.get('/debug/search/{document_id}')
async def debug_search(document_id: str, query: str = "lab 5"):
    """
    Debug endpoint to test search functionality for a specific document.
    Args:
        document_id: ID of the document to search in
        query: Query to search for (default: "lab 5")
    Returns:
        JSON response with search results.
    """
    try:
        from services.embedding import EmbeddingService
        from langchain_core.documents import Document as LangchainDocument
        
        # Embed the query
        embedding_service = EmbeddingService()
        query_doc = LangchainDocument(page_content=query)
        query_vector = embedding_service.embed_document(query_doc)
        
        # Search for chunks
        store_service = StoreService()
        results = store_service.search_chunks_by_ids(query_vector, [document_id], limit=10)
        
        search_results = []
        for result in results:
            search_results.append({
                "score": result.score,
                "document_id": result.payload.get("id"),
                "content_preview": result.payload.get("page_content", "")[:300] + "..." if result.payload.get("page_content", "") else "No content",
                "metadata": {k: v for k, v in result.payload.items() if k not in ["page_content"]}
            })
        
        return format_success_response(data={
            "query": query,
            "document_id": document_id,
            "results_found": len(search_results),
            "results": search_results
        })
        
    except Exception as e:
        logger.exception(f"Error debugging search for document {document_id}: {e}")
        return format_error_response(f"Error debugging search: {str(e)}", status_code=500)
