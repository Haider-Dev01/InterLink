import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/config/prismaClient';
import { authenticate } from '../../shared/middleware/authenticate';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const router = Router();

const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'receiverId est requis'),
  content: z
    .string()
    .trim()
    .min(1, 'Le message ne peut pas etre vide')
    .max(5000, 'Le message est trop long'),
});

async function hasAcceptedConnection(userAId: string, userBId: string) {
  const connection = await prisma.connection.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: userAId, receiverId: userBId },
        { requesterId: userBId, receiverId: userAId },
      ],
    },
    select: { id: true },
  });

  return Boolean(connection);
}

function toSafePeer(req: any, user: any) {
  const avatarUrl = toPublicAssetUrl(req, user.profile?.avatarUrl);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    avatarUrl,
    avatar: avatarUrl ?? null,
  };
}

router.use(authenticate);

router.post('/send', async (req, res, next) => {
  try {
    const senderId = req.user!.id;
    const { receiverId, content } = sendMessageSchema.parse(req.body);

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous envoyer un message.' });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { profile: true },
    });

    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Destinataire introuvable.' });
    }

    const connected = await hasAcceptedConnection(senderId, receiverId);
    if (!connected) {
      return res.status(403).json({ success: false, message: 'Vous devez etre connectes pour discuter.' });
    }

    const created = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        applicationId: null,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: created,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', async (req, res, next) => {
  try {
    const currentUserId = req.user!.id;
    const peerUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!peerUserId) {
      return res.status(400).json({ success: false, message: 'userId est requis.' });
    }

    if (currentUserId === peerUserId) {
      return res.status(400).json({ success: false, message: 'Conversation invalide.' });
    }

    const peer = await prisma.user.findUnique({
      where: { id: peerUserId },
      include: { profile: true },
    });

    if (!peer) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    const connected = await hasAcceptedConnection(currentUserId, peerUserId);
    if (!connected) {
      return res.status(403).json({ success: false, message: 'Vous devez etre connectes pour discuter.' });
    }

    const messages = await prisma.message.findMany({
      where: {
        applicationId: null,
        OR: [
          { senderId: currentUserId, receiverId: peerUserId },
          { senderId: peerUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });

    await prisma.message.updateMany({
      where: {
        applicationId: null,
        senderId: peerUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        peer: toSafePeer(req, peer),
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
