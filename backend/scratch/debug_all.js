const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recruiters = await prisma.user.findMany({
    where: { role: 'recruiter' },
    select: { id: true, email: true }
  });

  for (const r of recruiters) {
    const count = await prisma.jobOffer.count({
      where: { recruiterId: r.id, deletedAt: null }
    });
    console.log(`Recruiter: ${r.email} (${r.id}) -> ${count} offers`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
