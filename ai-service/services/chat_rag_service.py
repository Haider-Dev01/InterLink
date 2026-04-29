import hashlib
import logging
import math
import os
from typing import Dict, List

from groq import Groq

from models.schemas import AiChatRequest, AiChatResponse, RagDocument
from services.embedding_service import embed_text

logger = logging.getLogger(__name__)

_client: Groq | None = None
_doc_embedding_cache: Dict[str, List[float]] = {}

SYSTEM_PROMPT = (
    "You are InterLink Career Coach, a personalized AI coaching assistant.\n"
    "Your job is to coach the user for internships/career growth using ONLY retrieved context from their CV, "
    "profile, application history, and relevant opportunities.\n"
    "Rules:\n"
    "- Never fabricate user facts.\n"
    "- If context is insufficient, say what is missing and ask for it.\n"
    "- Give actionable, concrete advice (steps, examples, wording).\n"
    "- Keep a supportive and professional tone.\n"
    "- Respond in the same language as the user."
)


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set in environment")
        _client = Groq(api_key=api_key)
    return _client


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _get_or_create_doc_embedding(content: str) -> List[float]:
    cache_key = hashlib.sha1(content.encode("utf-8")).hexdigest()
    if cache_key in _doc_embedding_cache:
        return _doc_embedding_cache[cache_key]

    embedding = embed_text(content)
    _doc_embedding_cache[cache_key] = embedding
    return embedding


def _rank_documents(payload: AiChatRequest) -> List[RagDocument]:
    if not payload.documents:
        return []

    query_embedding = embed_text(payload.message)
    ranked: List[RagDocument] = []

    for document in payload.documents:
        doc_embedding = document.embedding or _get_or_create_doc_embedding(document.content)
        score = _cosine_similarity(query_embedding, doc_embedding)
        ranked.append(
            RagDocument(
                id=document.id,
                source=document.source,
                content=document.content,
                score=score,
            )
        )

    ranked.sort(key=lambda doc: doc.score or 0.0, reverse=True)
    return ranked[: max(1, min(payload.topK, 10))]


def _build_context_block(documents: List[RagDocument]) -> str:
    if not documents:
        return "(no personalized context found)"

    chunks: List[str] = []
    for index, document in enumerate(documents, start=1):
        source = document.source or document.id
        score = f"{(document.score or 0):.3f}"
        chunks.append(f"[{index}] {source} (score={score})\n{document.content}")
    return "\n\n".join(chunks)


def _build_messages(payload: AiChatRequest, retrieved: List[RagDocument]) -> List[dict]:
    history = [
        {"role": message.role, "content": message.content}
        for message in payload.history[-12:]
        if message.role in {"user", "assistant"} and message.content.strip()
    ]

    context_block = _build_context_block(retrieved)
    question_block = (
        f"User role: {payload.userRole}\n"
        f"User id: {payload.userId}\n\n"
        f"### Retrieved Context\n{context_block}\n\n"
        f"### User Question\n{payload.message}"
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history,
        {"role": "user", "content": question_block},
    ]


def _extract_sources(retrieved: List[RagDocument]) -> List[str]:
    seen: set[str] = set()
    sources: List[str] = []
    for document in retrieved:
        label = document.source or document.id
        if label not in seen:
            seen.add(label)
            sources.append(label)
    return sources


async def generate_chat_reply(payload: AiChatRequest) -> AiChatResponse:
    if not payload.message.strip():
        return AiChatResponse(reply="Votre message est vide.", sources=[], retrieved=[])

    client = _get_client()
    retrieved = _rank_documents(payload)
    chat_messages = _build_messages(payload, retrieved)

    model_name = os.getenv("GROQ_CHAT_MODEL", "llama-3.1-8b-instant")
    completion = client.chat.completions.create(
        model=model_name,
        messages=chat_messages,
        temperature=max(0.0, min(payload.temperature, 1.0)),
        max_tokens=900,
        timeout=30,
    )

    reply = completion.choices[0].message.content or ""
    logger.info(
        "AI chat generated | user=%s | role=%s | docs=%d",
        payload.userId,
        payload.userRole,
        len(retrieved),
    )

    return AiChatResponse(
        reply=reply.strip(),
        sources=_extract_sources(retrieved),
        retrieved=retrieved,
    )
