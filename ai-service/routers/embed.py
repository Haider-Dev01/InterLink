from fastapi import APIRouter
import logging
from models.schemas import EmbedCandidateRequest, EmbedOfferRequest, EmbedResponse
from services.embedding_service import embed_text, build_candidate_text, build_offer_text

router = APIRouter(prefix="/embed", tags=["Embeddings"])
logger = logging.getLogger(__name__)

@router.post("/candidate", response_model=EmbedResponse)
async def generate_candidate_embedding(request: EmbedCandidateRequest):
    try:
        text_to_embed = build_candidate_text(request.skills, request.speciality, request.bio, request.school)
        embedding = embed_text(text_to_embed)
        return EmbedResponse(embedding=embedding)
    except Exception as e:
        logger.error(f"Erreur génration embedding candidat: {e}")
        return EmbedResponse(embedding=[0.0] * 384)

@router.post("/offer", response_model=EmbedResponse)
async def generate_offer_embedding(request: EmbedOfferRequest):
    try:
        text_to_embed = build_offer_text(request.title, request.description, request.skills)
        embedding = embed_text(text_to_embed)
        return EmbedResponse(embedding=embedding)
    except Exception as e:
        logger.error(f"Erreur génration embedding offre: {e}")
        return EmbedResponse(embedding=[0.0] * 384)
