const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'job_offers'`)
  .then(c => {
    console.log(c);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
