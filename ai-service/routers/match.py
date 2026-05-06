from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np

router = APIRouter()

class MatchScoreRequest(BaseModel):
    cv_embedding: list[float]
    offer_embedding: list[float]

class MatchScoreResponse(BaseModel):
    score: float        # 0.0 à 1.0
    score_percent: int  # 0 à 100

@router.post("/match/score", response_model=MatchScoreResponse)
def calculate_match_score(request: MatchScoreRequest):
    cv = np.array(request.cv_embedding)
    offer = np.array(request.offer_embedding)
    
    # Similarité cosinus
    norm_cv = np.linalg.norm(cv)
    norm_offer = np.linalg.norm(offer)
    
    if norm_cv == 0 or norm_offer == 0:
        return MatchScoreResponse(score=0.0, score_percent=0)
    
    cosine = float(np.dot(cv, offer) / (norm_cv * norm_offer))
    cosine = max(0.0, min(1.0, cosine))  # clamp 0-1
    
    return MatchScoreResponse(
        score=round(cosine, 4),
        score_percent=round(cosine * 100)
    )
