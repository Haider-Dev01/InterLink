from typing import List, Optional
from pydantic import BaseModel

class ParseRequest(BaseModel):
    file_url: str
    file_type: str

class ParseResponse(BaseModel):
    text: str
    skills: List[str]
    embedding: List[float]

class EmbedCandidateRequest(BaseModel):
    text: str
    skills: List[str]
    speciality: Optional[str] = None
    bio: Optional[str] = None
    school: Optional[str] = None

class EmbedOfferRequest(BaseModel):
    title: str
    description: str
    skills: List[str]
    location: Optional[str] = None
    duration_months: Optional[int] = None

class EmbedResponse(BaseModel):
    embedding: List[float]
