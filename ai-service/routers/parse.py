from fastapi import APIRouter
import logging
from models.schemas import ParseRequest, ParseResponse
from services.parser_service import parse_cv
from services.embedding_service import embed_text, build_cv_embedding_text

router = APIRouter(prefix="/parse", tags=["Parse"])
logger = logging.getLogger(__name__)

@router.post("", response_model=ParseResponse)
async def parse_document(request: ParseRequest):
    try:
        parsed_data = parse_cv(request.file_url, request.file_type)
        if parsed_data.get("text"):
            summary = build_cv_embedding_text(parsed_data)
            parsed_data["embedding"] = embed_text(summary)
            
        return ParseResponse(
            text=parsed_data["text"],
            skills=parsed_data["skills"],
            embedding=parsed_data["embedding"]
        )
    except Exception as e:
        logger.error(f"Erreur router parse: {e}")
        return ParseResponse(text="", skills=[], embedding=[0.0] * 384)
