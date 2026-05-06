const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const o = await prisma.jobOffer.findMany({ where: { recruiterId: 'e665b24f-f208-4c56-8200-3884170e0726' } });
  console.log(JSON.stringify(o, null, 2));
}
main().finally(() => prisma.$disconnect());
