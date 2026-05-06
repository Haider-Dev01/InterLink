import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { prisma } from './shared/config/prismaClient';
import { redis } from './shared/config/redisClient';
import { startRetryJob } from './modules/cv/cv.service';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL || 'http://localhost:5174'
    ],
    credentials: true
  }
});

// Map userId → socketId pour ciblage précis
const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
  socket.on('join', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    connectedUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
      }
    });
  });
});

export { connectedUsers };

async function bootstrap() {
  try {
    // Connexion Prisma
    await prisma.$connect();
    console.log('[Prisma] ✅ Connected to PostgreSQL');

    // Connexion Redis
    await redis.connect();
    console.log('[Redis]  ✅ Connected');

    httpServer.listen(PORT, () => {
      console.log(`[Server] 🚀 Backend running on http://localhost:${PORT}`);
      console.log(`[Health] 👉 http://localhost:${PORT}/health`);
      startRetryJob();
    });
  } catch (err) {
    console.error('[Bootstrap] ❌ Failed to start:', err);
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

bootstrap();
