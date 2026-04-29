import os
import tempfile
from fastapi import APIRouter, File, HTTPException, UploadFile
import logging
from models.schemas import ParseRequest, ParseResponse
from services.parser_service import parse_cv
from services.embedding_service import embed_text, build_cv_embedding_text

router = APIRouter(prefix="/parse", tags=["Parse"])
logger = logging.getLogger(__name__)

def detect_file_type(filename: str, content_type: str | None) -> str:
    ext = os.path.splitext(filename or "")[1].lower()
    if ext == ".pdf" or content_type == "application/pdf":
        return "pdf"
    if ext in [".docx", ".doc"] or content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "docx"
    return "pdf"

@router.post("", response_model=ParseResponse)
async def parse_document(file: UploadFile | None = File(default=None), request: ParseRequest | None = None):
    try:
        parsed_data = None

        if file is not None:
            file_bytes = await file.read()
            if not file_bytes:
                raise HTTPException(status_code=400, detail="Fichier vide.")

            file_type = detect_file_type(file.filename or "cv.pdf", file.content_type)
            suffix = ".pdf" if file_type == "pdf" else ".docx"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            try:
                parsed_data = parse_cv(temp_path, file_type)
            finally:
                try:
                    os.unlink(temp_path)
                except OSError:
                    logger.warning("Impossible de supprimer le fichier temporaire %s", temp_path)
        elif request is not None:
            parsed_data = parse_cv(request.file_url, request.file_type)
        else:
            raise HTTPException(status_code=400, detail="Aucune source de CV fournie.")

        if parsed_data.get("text"):
            summary = build_cv_embedding_text(parsed_data)
            parsed_data["embedding"] = embed_text(summary)
            
        return ParseResponse(
            text=parsed_data["text"],
            skills=parsed_data["skills"],
            sections=parsed_data.get("sections", {}),
            score=parsed_data.get("score", 0),
            embedding=parsed_data["embedding"]
        )
    except Exception as e:
        logger.error(f"Erreur router parse: {e}")
        return ParseResponse(text="", skills=[], sections={}, score=0, embedding=[0.0] * 384)
