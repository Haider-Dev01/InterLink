import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';

import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { prisma } from '../../shared/config/prismaClient';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

type CoachingContextDocument = {
  id: string;
  source: string;
  content: string;
};

function chunkText(text: string, chunkSize = 900, overlap = 180) {
  if (!text.trim()) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    if (end >= text.length) {
      break;
    }
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

async function callAiService(pathname: string, init: RequestInit) {
  const response = await fetch(`${AI_SERVICE_URL}${pathname}`, init);
  const rawText = await response.text();
  let data: any = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { detail: rawText };
    }
  }

  if (!response.ok) {
    throw new Error(data?.detail || `AI service call failed: ${response.status}`);
  }

  return data;
}

async function buildCoachingContextDocuments(userId: string): Promise<CoachingContextDocument[]> {
  const [activeCv, profile, user, topMatches, applications] = await Promise.all([
    prisma.cvDocument.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true, parsedText: true,
        extractedSkills: { include: { skill: true } },
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      include: {
        school: true,
        company: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, location: true, availabilityMonths: true, role: true },
    }),
    prisma.matchScore.findMany({
      where: { candidateId: userId },
      include: {
        offer: {
          select: {
            id: true, title: true, description: true, location: true,
            company: true, offerSkills: { include: { skill: true } },
          },
        },
      },
      orderBy: { scoreFinal: 'desc' },
      take: 8,
    }),
    prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        offer: {
          select: { id: true, title: true, company: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
  ]);

  const documents: CoachingContextDocument[] = [];

  const profileSummary = [
    `Role: ${user?.role || 'candidate'}`,
    `Name: ${(profile?.firstName || '')} ${(profile?.lastName || '')}`.trim(),
    `Location: ${user?.location || 'N/A'}`,
    `Availability months: ${user?.availabilityMonths ?? 'N/A'}`,
    `Bio: ${profile?.bio || 'N/A'}`,
    `LinkedIn: ${profile?.linkedinUrl || 'N/A'}`,
    `GitHub: ${profile?.githubUsername || 'N/A'}`,
    `School: ${profile?.school?.name || 'N/A'}`,
    `Company: ${profile?.company?.name || 'N/A'}`,
  ]
    .filter(Boolean)
    .join('\n');

  documents.push({
    id: 'profile-overview',
    source: 'User Profile',
    content: profileSummary,
  });

  const cvSkills = (activeCv?.extractedSkills ?? []).map((item) => item.skill.name);
  if (cvSkills.length) {
    documents.push({
      id: 'cv-skills',
      source: 'CV Skills',
      content: `Extracted skills: ${cvSkills.join(', ')}`,
    });
  }

  if (activeCv?.parsedText) {
    const cvChunks = chunkText(activeCv.parsedText, 1000, 200);
    cvChunks.slice(0, 8).forEach((chunk, index) => {
      documents.push({
        id: `cv-chunk-${index + 1}`,
        source: `CV Chunk ${index + 1}`,
        content: chunk,
      });
    });
  }

  topMatches.forEach((match, index) => {
    const offerSkills = match.offer?.offerSkills?.map((offerSkill) => offerSkill.skill.name).join(', ') || 'N/A';
    documents.push({
      id: `top-offer-${index + 1}`,
      source: `Matched Offer ${index + 1}`,
      content: [
        `Title: ${match.offer?.title || 'N/A'}`,
        `Company: ${match.offer?.company?.name || 'N/A'}`,
        `Location: ${match.offer?.location || 'N/A'}`,
        `Description: ${match.offer?.description || ''}`,
        `Required skills: ${offerSkills}`,
        `Match score: ${Math.round((match.scoreFinal || 0) * 100)}%`,
      ].join('\n'),
    });
  });

  applications.forEach((application, index) => {
    documents.push({
      id: `application-${index + 1}`,
      source: `Application ${index + 1}`,
      content: [
        `Offer: ${application.offer?.title || 'N/A'}`,
        `Company: ${application.offer?.company?.name || 'N/A'}`,
        `Status: ${application.applicationStatus}`,
        `Applied at: ${application.appliedAt.toISOString()}`,
        `Last update: ${application.updatedAt.toISOString()}`,
      ].join('\n'),
    });
  });

  return documents;
}

router.get('/daily-advice', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [activeCv, activeApplications, recentInterviews, profile, user] = await Promise.all([
      prisma.cvDocument.findFirst({
        where: { userId, isActive: true },
        select: { id: true }
      }),
      prisma.application.count({
        where: { candidateId: userId, applicationStatus: { in: ['pending', 'interview'] } },
      }),
      prisma.application.count({
        where: { candidateId: userId, applicationStatus: 'interview' },
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { location: true } }),
    ]);

    const payload = {
      profile: {
        firstName: profile?.firstName,
        location: user?.location,
      },
      stats: {
        hasCv: Boolean(activeCv),
        activeApplications,
        upcomingInterviews: recentInterviews,
      },
    };

    try {
      const response = await fetch(`${AI_SERVICE_URL}/daily-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const data = (await response.json()) as { advice?: string; tips?: string[] };
        const tips = data.tips && data.tips.length ? data.tips : data.advice ? [data.advice] : [];

        if (tips.length) {
          return res.status(200).json({ success: true, data: { tips, source: 'ai-service' } });
        }
      }
    } catch {
      // fallback below
    }

    const fallbackTips: string[] = [];
    if (!activeCv) {
      fallbackTips.push('Ajoutez un CV a jour pour ameliorer votre visibilite aupres des recruteurs.');
    }
    if (activeApplications < 3) {
      fallbackTips.push('Postulez a 2-3 offres supplementaires pour augmenter vos chances cette semaine.');
    }
    if (recentInterviews > 0) {
      fallbackTips.push('Preparez un pitch de 45 secondes oriente resultats pour vos prochains entretiens.');
    }
    if (!fallbackTips.length) {
      fallbackTips.push('Mettez a jour votre profil avec des resultats chiffres pour augmenter la qualite du matching IA.');
    }

    return res.status(200).json({
      success: true,
      data: { tips: fallbackTips, source: 'backend-fallback' },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze-cv', authenticate, memoryUpload.single('file'), async (req, res, next) => {
  try {
    let filename = req.file?.originalname ?? 'cv.pdf';
    let fileBuffer = req.file?.buffer;

    if (!fileBuffer) {
      const activeCv = await prisma.cvDocument.findFirst({
        where: { userId: req.user!.id, isActive: true },
        select: { fileUrl: true }
      });

      if (!activeCv) {
        return res.status(404).json({ success: false, message: 'Aucun CV actif a analyser.' });
      }

      const absolutePath = path.resolve(process.cwd(), activeCv.fileUrl);
      fileBuffer = await fs.promises.readFile(absolutePath);
      filename = path.basename(activeCv.fileUrl);
    }

    const formData = new FormData();
    const fileBytes = new Uint8Array(fileBuffer);
    formData.append('file', new Blob([fileBytes]), filename);

    const analysis = await callAiService('/analyze-cv', {
      method: 'POST',
      body: formData,
    });

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/optimize-cv', authenticate, async (req, res, next) => {
  try {
    const activeCv = await prisma.cvDocument.findFirst({
      where: { userId: req.user!.id, isActive: true },
      select: {
        parsedText: true,
        extractedSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const text = req.body?.text || activeCv?.parsedText;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Aucun contenu de CV disponible pour optimisation.' });
    }

    const optimized = await callAiService('/optimize-cv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        target_role: req.body?.targetRole,
        focus_skills: req.body?.focusSkills ?? activeCv?.extractedSkills.map((item) => item.skill.name) ?? [],
      }),
    });

    return res.status(200).json({
      success: true,
      data: optimized,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/chat/history', authenticate, async (req, res, next) => {
  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: { messages: history },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const prompt = String(req.body?.message ?? req.body?.prompt ?? '').trim();
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Le message est requis.' });
    }

    const userId = req.user!.id;
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 18,
    });

    const documents = await buildCoachingContextDocuments(userId);
    const aiResult = await callAiService('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userRole: req.user!.role,
        message: prompt,
        history: history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        documents,
        topK: 6,
        temperature: 0.25,
      }),
    });

    await prisma.chatMessage.createMany({
      data: [
        {
          userId,
          role: 'user',
          content: prompt,
          context: {
            type: 'coaching-rag',
          },
        },
        {
          userId,
          role: 'assistant',
          content: aiResult.reply,
          context: {
            type: 'coaching-rag',
            sources: aiResult.sources ?? [],
            retrieved: aiResult.retrieved ?? [],
          },
        },
      ],
    });

    const updatedHistory = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResult.reply,
        sources: aiResult.sources ?? [],
        messages: updatedHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/coaching/session', authenticate, async (req, res, next) => {
  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: { messages: history },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/coaching/session', authenticate, async (req, res, next) => {
  try {
    const prompt = String(req.body?.prompt ?? '').trim();
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Le prompt est requis.' });
    }

    const userId = req.user!.id;
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 18,
    });
    const documents = await buildCoachingContextDocuments(userId);

    const aiResult = await callAiService('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userRole: req.user!.role,
        message: prompt,
        history: history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        documents,
        topK: 6,
        temperature: 0.25,
      }),
    });

    await prisma.chatMessage.createMany({
      data: [
        {
          userId,
          role: 'user',
          content: prompt,
          context: { type: 'coaching-rag' },
        },
        {
          userId,
          role: 'assistant',
          content: aiResult.reply,
          context: {
            type: 'coaching-rag',
            sources: aiResult.sources ?? [],
            retrieved: aiResult.retrieved ?? [],
          },
        },
      ],
    });

    const updatedHistory = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResult.reply,
        sources: aiResult.sources ?? [],
        messages: updatedHistory,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/cv/me', authenticate, async (req, res, next) => {
  try {
    const cv = await prisma.cvDocument.findFirst({
      where: { userId: req.user!.id, isActive: true },
      select: {
        id: true, fileUrl: true, isActive: true, parseStatus: true,
        extractedSkills: {
          include: { skill: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        cv: cv
          ? {
              ...cv,
              fileUrl: toPublicAssetUrl(req, cv.fileUrl),
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/recruiter-report', authenticate, authorize(['recruiter']), async (req, res, next) => {
  try {
    const recruiterId = req.user!.id;

    const [offers, applications] = await Promise.all([
      prisma.jobOffer.findMany({
        where: { recruiterId, deletedAt: null },
        select: {
          id: true, title: true, offerStatus: true, description: true,
          company: true,
          applications: true,
          offerSkills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.application.findMany({
        where: {
          offer: {
            recruiterId,
            deletedAt: null,
          },
        },
        include: {
          offer: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 60,
      }),
    ]);

    const totalOffers = offers.length;
    const totalApplications = applications.length;
    const activeApplications = applications.filter((item) =>
      item.applicationStatus === 'pending' || item.applicationStatus === 'interview',
    ).length;
    const acceptedApplications = applications.filter((item) => item.applicationStatus === 'accepted').length;

    const defaultPrompt =
      'Generate an executive recruiter report with candidate quality, job performance, and concrete hiring recommendations.';
    const prompt = String(req.body?.prompt ?? defaultPrompt).trim() || defaultPrompt;

    const documents = [
      {
        id: 'recruiter-global-stats',
        source: 'Recruiter Stats',
        content: [
          `Total offers: ${totalOffers}`,
          `Total applications: ${totalApplications}`,
          `Active applications: ${activeApplications}`,
          `Accepted applications: ${acceptedApplications}`,
        ].join('\n'),
      },
      ...offers.slice(0, 8).map((offer, index) => ({
        id: `offer-${index + 1}`,
        source: `Offer: ${offer.title}`,
        content: [
          `Title: ${offer.title}`,
          `Company: ${offer.company?.name ?? 'N/A'}`,
          `Status: ${offer.offerStatus}`,
          `Applications: ${offer.applications.length}`,
          `Skills: ${offer.offerSkills.map((item) => item.skill.name).join(', ') || 'N/A'}`,
          `Description: ${offer.description}`,
        ].join('\n'),
      })),
      ...applications.slice(0, 14).map((application, index) => ({
        id: `application-${index + 1}`,
        source: `Application: ${application.offer?.title ?? 'Offer'}`,
        content: [
          `Offer: ${application.offer?.title ?? 'N/A'}`,
          `Status: ${application.applicationStatus}`,
          `Applied at: ${application.appliedAt.toISOString()}`,
          `Updated at: ${application.updatedAt.toISOString()}`,
        ].join('\n'),
      })),
    ];

    let reportText = '';
    let sources: string[] = [];

    try {
      const aiResult = await callAiService('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recruiterId,
          userRole: 'recruiter',
          message: prompt,
          history: [],
          documents,
          topK: 8,
          temperature: 0.2,
        }),
      });

      reportText = String(aiResult.reply ?? '').trim();
      sources = Array.isArray(aiResult.sources) ? aiResult.sources : [];
    } catch {
      reportText = [
        `Total offers: ${totalOffers}.`,
        `Total applications received: ${totalApplications}.`,
        `Active applications: ${activeApplications}.`,
        acceptedApplications > 0
          ? `Accepted applications: ${acceptedApplications}.`
          : 'No accepted applications yet; review screening and interview criteria.',
        'Recommendation: prioritize offers with high views but low applications and refine skill requirements.',
      ].join(' ');
      sources = ['backend-fallback'];
    }

    return res.status(200).json({
      success: true,
      data: {
        report: reportText,
        sources,
        stats: {
          totalOffers,
          totalApplications,
          activeApplications,
          acceptedApplications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
