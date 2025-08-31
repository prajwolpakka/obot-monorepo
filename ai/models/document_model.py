from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Document(BaseModel):
    path: str
    id: Optional[str] = None
    name: Optional[str] = None
    file_type: Optional[str] = None
    uploaded_by: Optional[str] = None
    organization_id: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_timestamp: Optional[datetime] = None
    content: Optional[bytes] = None 

class Documents(BaseModel):
    document: List[Document] = Field(default_factory=list)

class LocalDocument(BaseModel):
    file_path: List[str] = Field(
        ..., 
        example=["/home/administrator/Downloads/eng_docuements/pdf/a_brief_introduction_to_ai.pdf"]
    )
