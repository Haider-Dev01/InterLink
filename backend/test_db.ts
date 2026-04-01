import { prisma } from './src/shared/config/prismaClient';

async function main() {
  const result = await prisma.cvDocument.updateMany({
    data: {
      parseStatus: 'pending',
      retryCount: 0
    }
  });
  console.log(`Reset ${result.count} cv_documents`);
  
  const resraw = await prisma.$executeRaw`
    UPDATE cv_documents
    SET embedding = NULL
  `;
  console.log(`Nullified embeddings`);
}

main().finally(() => process.exit(0));
