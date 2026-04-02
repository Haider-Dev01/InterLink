"""
rag_service.py
~~~~~~~~~~~~~~
Retrieval-Augmented Generation via Groq (llama3-8b-8192).

Flow
----
1. Receive the top-K documents already retrieved by the caller (vector search
   is performed outside this service by the Node.js backend).
2. Build a context block limited to the 10 most relevant chunks.
3. Call Groq's chat completions API with a 30s timeout.
4. Return { answer, sources }.
"""

import logging
import os
from typing import List

from groq import Groq
from models.schemas import RagDocument, RagResponse

logger = logging.getLogger(__name__)

# ── Groq client (singleton) ───────────────────────────────────────────────────
_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set in environment")
        _client = Groq(api_key=api_key)
        logger.info("Groq client initialised")
    return _client


# ── Prompt builder ────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = (
    "You are InternLink AI, an intelligent assistant specialized in internship "
    "recruiting. You help candidates find the right internship and recruiters "
    "find the best talent.\n"
    "Answer ONLY using the context provided. If the answer is not in the context, "
    "say so honestly. Be concise, professional, and helpful. "
    "Respond in the same language as the question."
)


def _build_user_message(
    question: str,
    user_role: str,
    documents: List[RagDocument],
) -> str:
    """Builds the user turn with injected context (max 10 chunks)."""
    top_docs = documents[:10]  # hard-cap at 10 context chunks

    context_lines: List[str] = []
    for i, doc in enumerate(top_docs, start=1):
        label = doc.source or doc.id
        score_str = f" (score: {doc.score:.3f})" if doc.score is not None else ""
        context_lines.append(f"[{i}] {label}{score_str}\n{doc.content}")

    context_block = "\n\n".join(context_lines) if context_lines else "(no context available)"

    return (
        f"User role: {user_role}\n\n"
        f"### Context\n{context_block}\n\n"
        f"### Question\n{question}"
    )


def _extract_sources(documents: List[RagDocument]) -> List[str]:
    """Returns a deduplicated, ordered list of source labels."""
    seen: set[str] = set()
    sources: List[str] = []
    for doc in documents[:10]:
        label = doc.source or doc.id
        if label not in seen:
            seen.add(label)
            sources.append(label)
    return sources


# ── Public API ────────────────────────────────────────────────────────────────
async def answer_question(
    question: str,
    user_role: str,
    documents: List[RagDocument],
) -> RagResponse:
    """
    Call Groq and return a RagResponse.

    Parameters
    ----------
    question  : The user's question.
    user_role : Role context ("candidate" / "recruiter" / "admin").
    documents : Context docs ranked by relevance (top-K from vector store).
    """
    client = _get_client()
    user_message = _build_user_message(question, user_role, documents)

    logger.info(
        "RAG query | role=%s | docs=%d | question=%s",
        user_role,
        min(len(documents), 10),
        question[:80],
    )

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=1024,
            timeout=30,          # seconds
        )
        answer = completion.choices[0].message.content or ""
        logger.info("RAG response received (%d chars)", len(answer))
    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        raise

    return RagResponse(
        answer=answer.strip(),
        sources=_extract_sources(documents),
    )
