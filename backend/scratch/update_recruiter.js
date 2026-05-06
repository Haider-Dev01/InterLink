const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRecruiter() {
  const hash = '$2b$12$XFKRqo0Gvp.0Ypvmq8/h7ualXFoQTbOjgypDnAX1SmuGYdols33u6';
  await prisma.user.update({
    where: { email: 'recruteur@test.com' },
    data: { passwordHash: hash }
  });
  console.log('Recruiter password updated');
  process.exit(0);
}

updateRecruiter();
