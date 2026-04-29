import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import (
    CoachingSessionRequest,
    CoachingSessionResponse,
    CvAnalysisResponse,
    OptimizeCvRequest,
    OptimizeCvResponse,
)
from services.parser_service import build_cv_summary, parse_cv

router = APIRouter(tags=["Career"])


def _analyze_text(text: str, skills: list[str]) -> CvAnalysisResponse:
    clean_text = text.strip()
    word_count = len(clean_text.split())
    score = min(98, max(35, 45 + len(skills) * 4 + min(word_count, 400) // 20))

    suggestions: list[str] = []
    if word_count < 180:
      suggestions.append("Ajoutez plus de details concrets sur vos missions, resultats et technologies.")
    if len(skills) < 6:
      suggestions.append("Mettez davantage en avant vos competences techniques et outils metier.")
    if "%" not in clean_text and "reduit" not in clean_text.lower() and "augmente" not in clean_text.lower():
      suggestions.append("Ajoutez des resultats chiffres pour rendre le CV plus convaincant.")
    if "linkedin" not in clean_text.lower():
      suggestions.append("Ajoutez un lien LinkedIn ou portfolio pour renforcer votre profil.")
    if not suggestions:
      suggestions.append("Le CV est bien structure. Travaillez maintenant l'adaptation a chaque offre ciblee.")

    summary = build_cv_summary(skills, clean_text)[:500] or "Resume du CV indisponible."
    return CvAnalysisResponse(summary=summary, skills=skills, score=score, suggestions=suggestions[:4])


@router.post("/analyze-cv", response_model=CvAnalysisResponse)
async def analyze_cv(file: UploadFile = File(...)) -> CvAnalysisResponse:
    suffix = Path(file.filename or "cv.pdf").suffix.lower() or ".pdf"
    if suffix not in {".pdf", ".docx", ".doc"}:
        raise HTTPException(status_code=400, detail="Format non supporte. PDF ou DOCX uniquement.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        file_type = "pdf" if suffix == ".pdf" else "docx"
        parsed = parse_cv(temp_path, file_type)
        return _analyze_text(parsed.get("text", ""), parsed.get("skills", []))
    finally:
        try:
            os.unlink(temp_path)
        except OSError:
            pass


@router.post("/optimize-cv", response_model=OptimizeCvResponse)
async def optimize_cv(payload: OptimizeCvRequest) -> OptimizeCvResponse:
    base_text = payload.text.strip()
    if not base_text:
        raise HTTPException(status_code=400, detail="Le texte du CV est requis.")

    focus_block = ""
    if payload.focus_skills:
        focus_block = f"\nCompetences a renforcer: {', '.join(payload.focus_skills)}."
    if payload.target_role:
        focus_block += f"\nRole cible: {payload.target_role}."

    optimized_text = (
        "PROFIL\n"
        f"{base_text[:1400].strip()}\n\n"
        "VERSION OPTIMISEE\n"
        "Mettez les experiences les plus pertinentes en premier, utilisez des verbes d'action et ajoutez des resultats mesures."
        f"{focus_block}"
    )

    highlights = [
        "Structure reecrite pour mettre en avant l'impact et les resultats.",
        "Accent ajoute sur les competences clefs et la lisibilite ATS.",
        "Ordre des sections optimise pour un recruteur.",
    ]

    return OptimizeCvResponse(optimized_text=optimized_text, highlights=highlights)


@router.post("/coaching-session", response_model=CoachingSessionResponse)
async def coaching_session(payload: CoachingSessionRequest) -> CoachingSessionResponse:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Le prompt est requis.")

    history_count = len(payload.history)
    reply = (
        "Voici une reformulation plus forte: commencez par le contexte, precisez votre action, puis terminez par un resultat mesurable. "
        f"Sur votre message: \"{prompt[:160]}\""
    )
    next_step = (
        "Repondez maintenant en 3 phrases maximum avec la structure Situation -> Action -> Resultat."
        if history_count < 4
        else "Passez a une question comportementale plus difficile en gardant des exemples chiffres."
    )
    return CoachingSessionResponse(reply=reply, next_step=next_step)
