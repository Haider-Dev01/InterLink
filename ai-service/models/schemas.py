from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class ParseRequest(BaseModel):
    file_url: str
    file_type: str

class ParseResponse(BaseModel):
    text: str
    skills: List[str]
    sections: Dict[str, str] = {}
    score: int = 0
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

class ChatContextDocument(BaseModel):
    id: str
    source: Optional[str] = None
    content: str
    embedding: Optional[List[float]] = None

class AiChatMessage(BaseModel):
    role: str
    content: str

class AiChatRequest(BaseModel):
    userId: str
    userRole: str
    message: str
    history: List[AiChatMessage] = []
    documents: List[ChatContextDocument] = []
    topK: int = 6
    temperature: float = 0.25

class AiChatResponse(BaseModel):
    reply: str
    sources: List[str]
    retrieved: List[RagDocument] = []


class CvAnalysisResponse(BaseModel):
    summary: str
    skills: List[str]
    score: int
    suggestions: List[str]


class OptimizeCvRequest(BaseModel):
    text: str
    target_role: Optional[str] = None
    focus_skills: List[str] = []


class OptimizeCvResponse(BaseModel):
    optimized_text: str
    highlights: List[str]


class CoachingSessionRequest(BaseModel):
    prompt: str
    history: List[dict[str, Any]] = []


class CoachingSessionResponse(BaseModel):
    reply: str
    next_step: str
