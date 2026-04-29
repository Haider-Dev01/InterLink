import logging

from fastapi import APIRouter, HTTPException, status

from models.schemas import AiChatRequest, AiChatResponse
from services.chat_rag_service import generate_chat_reply

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post(
    "/chat",
    response_model=AiChatResponse,
    summary="Personalized RAG-based coaching chat",
    status_code=status.HTTP_200_OK,
)
async def ai_chat(payload: AiChatRequest) -> AiChatResponse:
    if not payload.message.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="message must not be empty")

    try:
        return await generate_chat_reply(payload)
    except RuntimeError as exc:
        logger.error("AI chat runtime error: %s", exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        logger.exception("AI chat failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI chat failed: {exc}")
