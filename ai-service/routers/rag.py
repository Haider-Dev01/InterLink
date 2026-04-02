"""
routers/rag.py
~~~~~~~~~~~~~~
POST /rag/query  →  RagResponse
"""

import logging

from fastapi import APIRouter, HTTPException, status
from models.schemas import RagRequest, RagResponse
from services.rag_service import answer_question

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post(
    "/query",
    response_model=RagResponse,
    summary="Answer a question using Retrieval-Augmented Generation",
    status_code=status.HTTP_200_OK,
)
async def rag_query(payload: RagRequest) -> RagResponse:
    """
    Receives a question + pre-retrieved context documents and returns an
    LLM-generated answer via Groq (llama3-8b-8192).

    **Body**
    - `question`  : The user's question.
    - `userId`    : ID of the requesting user (for audit / logging).
    - `userRole`  : Role context – `"candidate"`, `"recruiter"`, `"admin"`.
    - `documents` : Top-K context chunks already fetched from the vector store.
    """
    if not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="question must not be empty",
        )

    try:
        result = await answer_question(
            question=payload.question,
            user_role=payload.userRole,
            documents=payload.documents,
        )
    except RuntimeError as exc:
        # Missing API key or mis-configuration
        logger.error("RAG configuration error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Unexpected RAG error")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API error: {exc}",
        )

    return result
