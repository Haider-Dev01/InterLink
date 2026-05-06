from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["RAG"])

class RAGDocument(BaseModel):
    id: str
    title: str
    content: str

class RagQueryRequest(BaseModel):
    question: str
    userId: str
    userRole: str
    documents: list[RAGDocument]

@router.post("/query")
async def rag_query(payload: RagQueryRequest):
    documents_dict = [{"id": d.id, "title": d.title, "content": d.content} for d in payload.documents]
    return rag_service.query(payload.question, documents_dict, payload.userRole)
