const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'recruteur@techcorp.com' }, include: { company: true } });
  console.log(JSON.stringify(u, null, 2));
}
main().finally(() => prisma.$disconnect());
