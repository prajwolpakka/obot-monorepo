from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ResourceRequest(BaseModel):
    id: str = Field(..., description="The unique identifier for the resource")
    name: str = Field(..., description="The name of the resource")
    description: Optional[str] = Field(None, description="The description of the resource")
    path: str = Field(..., description="The path of the resource")

class ResourceResponse(BaseModel):
    resources: List[ResourceRequest] = Field(..., description="The list of resources")