const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector')
  .then(() => {
    console.log('Vector extension ensured');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
