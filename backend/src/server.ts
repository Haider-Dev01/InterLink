import 'dotenv/config';
import { app } from './app';
import { prisma } from './shared/config/prismaClient';
import { redis } from './shared/config/redisClient';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap() {
  try {
    // Connexion Prisma
    await prisma.$connect();
    console.log('[Prisma] ✅ Connected to PostgreSQL');

    // Connexion Redis
    await redis.connect();
    console.log('[Redis]  ✅ Connected');

    app.listen(PORT, () => {
      console.log(`[Server] 🚀 Backend running on http://localhost:${PORT}`);
      console.log(`[Health] 👉 http://localhost:${PORT}/health`);
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
