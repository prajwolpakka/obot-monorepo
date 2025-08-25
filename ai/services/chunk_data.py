from models.document_model import Document

def prepare_chunks_for_storage(chunks, document):
    for chunk_data in chunks:
        # Create document for the chunk
        chunk_doc = Document(
            id=chunk_data['id'],
            name=chunk_data['name'],
            content=chunk_data['content'],
            path=document.path,
            uploaded_by=document.uploaded_by,
            organization_id=document.organization_id,
            file_type=document.file_type,
            uploaded_timestamp=document.uploaded_timestamp,
            metadata=chunk_data['metadata']
        )
        return chunk_doc