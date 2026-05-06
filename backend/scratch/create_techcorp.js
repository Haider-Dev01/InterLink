const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Recruteur1234!', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'recruteur@techcorp.com' },
    update: {
      passwordHash,
      role: 'recruiter',
      isVerified: true
    },
    create: {
      email: 'recruteur@techcorp.com',
      passwordHash,
      role: 'recruiter',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Jean',
          lastName: 'Recruteur',
        }
      }
    }
  });

  const company = await prisma.company.upsert({
    where: { userId: user.id },
    update: {
      isVerified: true
    },
    create: {
      userId: user.id,
      name: 'TechCorp',
      industry: 'IT & Software',
      isVerified: true
    }
  });

  await prisma.profile.updateMany({
    where: { userId: user.id },
    data: { companyId: company.id },
  });

  console.log('User recruteur@techcorp.com created/updated successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
