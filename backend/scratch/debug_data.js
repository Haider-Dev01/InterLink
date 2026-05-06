const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'recruiter.1@telnet.seed.internlink' }
  });
  const recId = users[0]?.id;
  console.log('Recruiter ID:', recId);

  const offers = await prisma.jobOffer.findMany({
    where: { recruiterId: recId },
    select: { id: true, title: true, recruiterId: true }
  });
  console.log('Offers for Telnet Recruiter:', offers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
