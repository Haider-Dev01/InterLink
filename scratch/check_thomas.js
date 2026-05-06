const { PrismaClient } = require('../backend/src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { profile: { firstName: { contains: 'Thomas', mode: 'insensitive' } } },
    include: {
      profile: true,
      applications: {
        include: { offer: { select: { title: true } } }
      }
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
