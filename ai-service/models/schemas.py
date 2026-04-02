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


# ── RAG ──────────────────────────────────────────────────────────────────────

class RagDocument(BaseModel):
    """A single context chunk fed to the LLM."""
    id: str
    content: str
    source: Optional[str] = None   # e.g. CV filename, offer title…
    score: Optional[float] = None  # cosine similarity from the vector store


class RagRequest(BaseModel):
    question: str
    userId: str
    userRole: str                  # "candidate" | "recruiter" | "admin"
    documents: List[RagDocument]   # top-K context docs from the caller


class RagResponse(BaseModel):
    answer: str
    sources: List[str]             # deduplicated list of source labels
