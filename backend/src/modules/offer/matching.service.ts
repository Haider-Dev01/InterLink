import { prisma } from '../../shared/config/prismaClient'

// ── Score Formula ────────────────────────────────────────────────
function calculateFinalScore(
  cosine: number,
  cvSkills: string[],
  offerSkills: string[],
  cvLocation: string | null,
  offerLocation: string | null,
  offerRemote: boolean,
  cvAvailability: number | null,
  offerDuration: number | null
): { scoreFinal: number; breakdown: object } {
  // Skills score — intersection candidat ∩ offre
  const offerSkillsLower = offerSkills.map((o) => o.toLowerCase())
  const intersection = cvSkills.filter((s) => offerSkillsLower.includes(s.toLowerCase()))
  const skillsScore = offerSkills.length > 0 ? intersection.length / offerSkills.length : 0

  // Duration match (0–1)
  let durationMatch = 0
  if (cvAvailability && offerDuration) {
    durationMatch = 1 - Math.abs(cvAvailability - offerDuration) / Math.max(offerDuration, 1)
    durationMatch = Math.max(0, durationMatch)
  }

  // Location match (0 ou 1)
  const locationMatch =
    offerRemote ||
    (cvLocation && offerLocation && cvLocation.toLowerCase() === offerLocation.toLowerCase())
      ? 1
      : 0

  // ── Poids rééquilibrés : 50% skills + 40% cosine + 10% contexte ──
  const SKILLS_W  = 0.50
  const COSINE_W  = 0.40
  const CONTEXT_W = 0.10

  // Contexte = moyenne durée + localisation (si dispo, sinon 0)
  const contextScore = (durationMatch + locationMatch) / 2

  const scoreFinal = Math.min(
    SKILLS_W * skillsScore + COSINE_W * cosine + CONTEXT_W * contextScore,
    1.0
  )

  const breakdown = {
    score_cosinus:   Math.round(cosine      * 100) / 100,
    skills_score:    Math.round(skillsScore * 100) / 100,
    skills_matched:  intersection,
    duration_match:  Math.round(durationMatch * 100) / 100,
    location_match:  locationMatch,
    context_score:   Math.round(contextScore * 100) / 100,
    weights:         { skills: SKILLS_W, cosine: COSINE_W, context: CONTEXT_W },
    score_final:     Math.round(scoreFinal * 100) / 100,
  }

  return { scoreFinal, breakdown }
}

// ── pgvector raw queries ─────────────────────────────────────────
async function getTopOffersForCandidate(cvEmbedding: number[], limit = 50) {
  const embeddingStr = '[' + cvEmbedding.join(',') + ']'
  const results: any[] = await prisma.$queryRaw`
    SELECT
      jo.id as offer_id,
      1 - (jo.embedding <=> ${embeddingStr}::vector(384)) as cosine_score,
      jo.location,
      jo.remote,
      jo."durationMonths",
      jo."offerStatus"
    FROM job_offers jo
    WHERE jo."offerStatus" = 'published'
      AND jo."deletedAt" IS NULL
      AND jo.embedding IS NOT NULL
    ORDER BY jo.embedding <=> ${embeddingStr}::vector(384)
    LIMIT ${limit}
  `
  return results
}

async function getTopCandidatesForOffer(offerEmbedding: number[], limit = 50) {
  const embeddingStr = '[' + offerEmbedding.join(',') + ']'
  const results: any[] = await prisma.$queryRaw`
    SELECT
      cd.id as cv_document_id,
      cd."userId" as candidate_id,
      1 - (cd.embedding <=> ${embeddingStr}::vector(384)) as cosine_score
    FROM cv_documents cd
    WHERE cd."parseStatus" = 'done'
      AND cd."isActive" = true
      AND cd.embedding IS NOT NULL
    ORDER BY cd.embedding <=> ${embeddingStr}::vector(384)
    LIMIT ${limit}
  `
  return results
}

async function upsertMatchScore(
  candidateId: string,
  offerId: string,
  cvDocumentId: string,
  scoreCosinus: number,
  scoreFinal: number,
  breakdown: object
) {
  await prisma.$executeRaw`
    INSERT INTO match_scores
      (id, "candidateId", "offerId", "cvDocumentId",
       "scoreCosinus", "scoreFinal", breakdown, "computedAt")
    VALUES
      (gen_random_uuid()::text, ${candidateId}, ${offerId},
       ${cvDocumentId}, ${scoreCosinus}, ${scoreFinal},
       ${JSON.stringify(breakdown)}::jsonb, NOW())
    ON CONFLICT ("candidateId", "offerId")
    DO UPDATE SET
      "scoreCosinus" = EXCLUDED."scoreCosinus",
      "scoreFinal" = EXCLUDED."scoreFinal",
      breakdown = EXCLUDED.breakdown,
      "computedAt" = NOW()
  `
}

// ── Trigger methods ──────────────────────────────────────────────

export async function triggerMatchingForCandidate(cvDocumentId: string, userId: string) {
  try {
    // Récupérer embedding du CV (raw car vector)
    const cvRows: any[] = await prisma.$queryRaw`
      SELECT embedding::text FROM cv_documents WHERE id = ${cvDocumentId}
    `
    if (!cvRows.length || !cvRows[0].embedding) {
      console.log(`[Matching] ⚠️ Pas d'embedding pour CV ${cvDocumentId}`)
      return
    }

    const cvEmbedding: number[] = JSON.parse(cvRows[0].embedding)

    // Données candidat (User pour location/availability + Profile pour skills si besoin)
    const user = await prisma.user.findUnique({ where: { id: userId } })

    // Skills extraits du CV
    const extractedSkills = await prisma.extractedSkill.findMany({
      where: { cvDocumentId },
      include: { skill: true },
    })
    const cvSkills = extractedSkills.map((es: any) => es.skill.name)

    // Top offres par cosine
    const topOffers = await getTopOffersForCandidate(cvEmbedding, 50)

    for (const offerRow of topOffers) {
      // Récupérer skills de l'offre
      const offerSkillRows = await prisma.offerSkill.findMany({
        where: { offerId: offerRow.offer_id },
        include: { skill: true },
      })
      const offerSkills = offerSkillRows.map((os: any) => os.skill.name)

      const { scoreFinal, breakdown } = calculateFinalScore(
        Number(offerRow.cosine_score),
        cvSkills,
        offerSkills,
        user?.location ?? null,
        offerRow.location,
        offerRow.remote,
        user?.availabilityMonths ?? null,
        offerRow.durationMonths
      )

      await upsertMatchScore(
        userId,
        offerRow.offer_id,
        cvDocumentId,
        Number(offerRow.cosine_score),
        scoreFinal,
        breakdown
      )
    }

    console.log(`[Matching] ✅ Matching candidat terminé : ${topOffers.length} scores calculés`)
  } catch (error) {
    console.error(`[Matching] ❌ Matching candidat échoué pour CV ${cvDocumentId}:`, error)
  }
}

export async function triggerMatchingForOffer(offerId: string) {
  try {
    // Récupérer embedding de l'offre (raw car vector)
    const offerRows: any[] = await prisma.$queryRaw`
      SELECT embedding::text FROM job_offers WHERE id = ${offerId}
    `
    if (!offerRows.length || !offerRows[0].embedding) {
      console.log(`[Matching] ⚠️ Pas d'embedding pour offre ${offerId}`)
      return
    }

    const offerEmbedding: number[] = JSON.parse(offerRows[0].embedding)

    // Détails offre avec skills
    const offer = await prisma.jobOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true, location: true, remote: true, durationMonths: true,
        offerSkills: { include: { skill: true } }
      },
    })
    if (!offer) return

    const offerSkills = offer.offerSkills.map((os: any) => os.skill.name)

    // Top candidats par cosine
    const topCandidates = await getTopCandidatesForOffer(offerEmbedding, 50)

    for (const candRow of topCandidates) {
      // Données candidat (User)
      const user = await prisma.user.findUnique({
        where: { id: candRow.candidate_id },
      })

      // Skills du CV actif
      const extractedSkills = await prisma.extractedSkill.findMany({
        where: { cvDocumentId: candRow.cv_document_id },
        include: { skill: true },
      })
      const cvSkills = extractedSkills.map((es: any) => es.skill.name)

      const { scoreFinal, breakdown } = calculateFinalScore(
        Number(candRow.cosine_score),
        cvSkills,
        offerSkills,
        user?.location ?? null,
        offer.location,
        offer.remote,
        user?.availabilityMonths ?? null,
        offer.durationMonths
      )

      await upsertMatchScore(
        candRow.candidate_id,
        offerId,
        candRow.cv_document_id,
        Number(candRow.cosine_score),
        scoreFinal,
        breakdown
      )
    }

    console.log(`[Matching] ✅ Matching offre terminé : ${topCandidates.length} scores calculés`)
  } catch (error) {
    console.error(`[Matching] ❌ Matching offre échoué pour ${offerId}:`, error)
  }
}

/**
 * Calcule et sauvegarde le score de matching pour un couple candidat/offre spécifique.
 * Utile lors d'une candidature directe.
 */
export async function recalculateMatch(candidateId: string, offerId: string) {
  try {
    const cv = await prisma.cvDocument.findFirst({
      where: { userId: candidateId, isActive: true, parseStatus: 'done' },
      select: {
        id: true,
        extractedSkills: { include: { skill: true } }
      }
    });
    if (!cv) return;

    const cvRows: any[] = await prisma.$queryRaw`SELECT embedding::text FROM cv_documents WHERE id = ${cv.id}`;
    if (!cvRows.length || !cvRows[0].embedding) return;
    const cvEmbedding = JSON.parse(cvRows[0].embedding);

    const offer = await prisma.jobOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true, location: true, remote: true, durationMonths: true,
        offerSkills: { include: { skill: true } }
      }
    });
    if (!offer) return;

    const offerRows: any[] = await prisma.$queryRaw`SELECT embedding::text FROM job_offers WHERE id = ${offer.id}`;
    if (!offerRows.length || !offerRows[0].embedding) return;
    const offerEmbedding = JSON.parse(offerRows[0].embedding);

    const embeddingStr = '[' + cvEmbedding.join(',') + ']';
    const cosineResult: any[] = await prisma.$queryRaw`
      SELECT 1 - (embedding <=> ${embeddingStr}::vector(384)) as score 
      FROM job_offers WHERE id = ${offerId}
    `;
    const cosine = Number(cosineResult[0].score);

    const user = await prisma.user.findUnique({ where: { id: candidateId } });
    const cvSkills = cv.extractedSkills.map(es => es.skill.name);
    const offerSkills = offer.offerSkills.map(os => os.skill.name);

    const { scoreFinal, breakdown } = calculateFinalScore(
      cosine,
      cvSkills,
      offerSkills,
      user?.location ?? null,
      offer.location,
      offer.remote,
      user?.availabilityMonths ?? null,
      offer.durationMonths
    );

    await upsertMatchScore(candidateId, offerId, cv.id, cosine, scoreFinal, breakdown);
    console.log(`[Matching] ✅ Score recalculé pour ${candidateId} sur offre ${offerId} : ${Math.round(scoreFinal * 100)}%`);
  } catch (error) {
    console.error(`[Matching] ❌ Erreur recalcul match:`, error);
  }
}

// ── Read methods for endpoints ───────────────────────────────────

export async function getMatchesForOffer(offerId: string, minScore?: number) {
  const where: any = { offerId }
  if (minScore !== undefined) {
    where.scoreFinal = { gte: minScore }
  }

  const matches = await prisma.matchScore.findMany({
    where,
    orderBy: { scoreFinal: 'desc' },
    take: 50,
    include: {
      users: {
        include: {
          profile: true,
        },
      },
      cvDocument: {
        select: {
          id: true, fileUrl: true, isActive: true, parseStatus: true,
          extractedSkills: { include: { skill: true } },
        },
      },
    },
  })

  return matches.map((m: any) => ({
    candidateId: m.candidateId,
    firstName: m.users?.profile?.firstName ?? null,
    lastName: m.users?.profile?.lastName ?? null,
    scoreCosinus: m.scoreCosinus,
    scoreFinal: m.scoreFinal,
    scorePercent: Math.round(m.scoreFinal * 100),
    breakdown: m.breakdown,
    skills: m.cvDocument?.extractedSkills?.map((es: any) => es.skill.name) ?? [],
    computedAt: m.computedAt,
  }))
}

export async function getMatchesForCandidate(userId: string) {
  const matches = await prisma.matchScore.findMany({
    where: { candidateId: userId },
    orderBy: { scoreFinal: 'desc' },
    include: {
      offer: {
        select: {
          id: true, title: true, location: true, remote: true,
          offerStatus: true, company: { select: { id: true, name: true } }
        },
      },
    },
  })

  return matches.map((m: any) => ({
    offerId: m.offerId,
    title: m.offer?.title ?? null,
    company: m.offer?.company?.name ?? null,
    location: m.offer?.location ?? null,
    scoreFinal: m.scoreFinal,
    scorePercent: Math.round(m.scoreFinal * 100),
    breakdown: m.breakdown,
    computedAt: m.computedAt,
  }))
}
