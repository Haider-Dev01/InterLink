import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/config/prismaClient';
import { authenticate } from '../../shared/middleware/authenticate';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

const router = Router();

const connectionRequestSchema = z.object({
  receiverId: z.string().min(1, 'receiverId est requis'),
});

const connectionDecisionSchema = z
  .object({
    connectionId: z.string().min(1).optional(),
    requesterId: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.connectionId || value.requesterId), {
    message: 'connectionId ou requesterId est requis',
  });

function toSafeConnectionUser(req: any, user: any) {
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

router.post('/request', async (req, res, next) => {
  try {
    const requesterId = req.user!.id;
    const { receiverId } = connectionRequestSchema.parse(req.body);

    if (requesterId === receiverId) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous connecter a vous-meme.' });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Utilisateur cible introuvable.' });
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(409).json({ success: false, message: 'Vous etes deja connectes.' });
      }

      if (existing.status === 'pending') {
        if (existing.requesterId === requesterId) {
          return res.status(409).json({ success: false, message: 'Invitation deja envoyee.' });
        }

        const accepted = await prisma.connection.update({
          where: { id: existing.id },
          data: {
            status: 'accepted',
            respondedAt: new Date(),
          },
          include: {
            requester: { include: { profile: true } },
            receiver: { include: { profile: true } },
          },
        });

        const peer = accepted.requesterId === requesterId ? accepted.receiver : accepted.requester;
        return res.status(200).json({
          success: true,
          message: 'Connexion acceptee automatiquement.',
          data: {
            connection: {
              id: accepted.id,
              status: accepted.status,
              createdAt: accepted.createdAt,
              updatedAt: accepted.updatedAt,
              user: toSafeConnectionUser(req, peer),
            },
          },
        });
      }

      const reopened = await prisma.connection.update({
        where: { id: existing.id },
        data: {
          requesterId,
          receiverId,
          status: 'pending',
          respondedAt: null,
        },
        include: {
          requester: { include: { profile: true } },
          receiver: { include: { profile: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Invitation renvoyee.',
        data: {
          connection: {
            id: reopened.id,
            status: reopened.status,
            createdAt: reopened.createdAt,
            updatedAt: reopened.updatedAt,
            user: toSafeConnectionUser(req, reopened.receiver),
          },
        },
      });
    }

    const created = await prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        status: 'pending',
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Invitation envoyee.',
      data: {
        connection: {
          id: created.id,
          status: created.status,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          user: toSafeConnectionUser(req, created.receiver),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/accept', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { connectionId, requesterId } = connectionDecisionSchema.parse(req.body);

    const pending = await prisma.connection.findFirst({
      where: {
        status: 'pending',
        receiverId: userId,
        ...(connectionId ? { id: connectionId } : { requesterId }),
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    if (!pending) {
      return res.status(404).json({ success: false, message: 'Invitation introuvable.' });
    }

    const accepted = await prisma.connection.update({
      where: { id: pending.id },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    const peer = accepted.requesterId === userId ? accepted.receiver : accepted.requester;

    return res.status(200).json({
      success: true,
      message: 'Invitation acceptee.',
      data: {
        connection: {
          id: accepted.id,
          status: accepted.status,
          createdAt: accepted.createdAt,
          updatedAt: accepted.updatedAt,
          user: toSafeConnectionUser(req, peer),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reject', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { connectionId, requesterId } = connectionDecisionSchema.parse(req.body);

    const pending = await prisma.connection.findFirst({
      where: {
        status: 'pending',
        receiverId: userId,
        ...(connectionId ? { id: connectionId } : { requesterId }),
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    if (!pending) {
      return res.status(404).json({ success: false, message: 'Invitation introuvable.' });
    }

    const rejected = await prisma.connection.update({
      where: { id: pending.id },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    const peer = rejected.requesterId === userId ? rejected.receiver : rejected.requester;

    return res.status(200).json({
      success: true,
      message: 'Invitation refusee.',
      data: {
        connection: {
          id: rejected.id,
          status: rejected.status,
          createdAt: rejected.createdAt,
          updatedAt: rejected.updatedAt,
          user: toSafeConnectionUser(req, peer),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const targetUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;

    const rows = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const connections = rows
      .filter((row) => row.status === 'accepted')
      .map((row) => {
        const peer = row.requesterId === userId ? row.receiver : row.requester;
        return {
          id: row.id,
          status: row.status,
          connectedAt: row.respondedAt ?? row.updatedAt,
          createdAt: row.createdAt,
          user: toSafeConnectionUser(req, peer),
        };
      });

    const pendingReceived = rows
      .filter((row) => row.status === 'pending' && row.receiverId === userId)
      .map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt,
        user: toSafeConnectionUser(req, row.requester),
      }));

    const pendingSent = rows
      .filter((row) => row.status === 'pending' && row.requesterId === userId)
      .map((row) => ({
        id: row.id,
        status: row.status,
        createdAt: row.createdAt,
        user: toSafeConnectionUser(req, row.receiver),
      }));

    let target: {
      userId: string;
      status: 'none' | 'pending' | 'accepted' | 'rejected';
      direction: 'incoming' | 'outgoing' | null;
      canMessage: boolean;
      connectionId?: string;
    } | null = null;

    if (targetUserId) {
      const relation = rows.find(
        (row) =>
          (row.requesterId === userId && row.receiverId === targetUserId) ||
          (row.requesterId === targetUserId && row.receiverId === userId),
      );

      if (!relation) {
        target = {
          userId: targetUserId,
          status: 'none',
          direction: null,
          canMessage: false,
        };
      } else {
        target = {
          userId: targetUserId,
          status: relation.status,
          direction:
            relation.status === 'pending'
              ? relation.receiverId === userId
                ? 'incoming'
                : 'outgoing'
              : null,
          canMessage: relation.status === 'accepted',
          connectionId: relation.id,
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        connections,
        pendingReceived,
        pendingSent,
        target,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
