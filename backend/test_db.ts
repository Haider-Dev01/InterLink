import { prisma } from './src/shared/config/prismaClient';

async function main() {
  const result = await prisma.cvDocument.updateMany({
    where: {
      parsedText: '',
      parseStatus: 'done'
    },
    data: {
      parseStatus: 'pending',
      retryCount: 0
    }
  });
  console.log(`Reset ${result.count} cv_documents`);
  
  // also need to set embedding to null, using raw query
  const resraw = await prisma.$executeRaw`
    UPDATE cv_documents
    SET embedding = NULL
    WHERE "parsedText" = '' AND "parseStatus" = 'pending'
  `;
  console.log(`Nullified embeddings`);
}

main().finally(() => process.exit(0));
