import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 12);
  };

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@internlink.com' },
    update: {},
    create: {
      email: 'admin@internlink.com',
      passwordHash: await hashPassword('Admin1234!'),
      role: 'admin',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Super',
          lastName: 'Admin'
        }
      }
    }
  });

  // 2. Recruteur + Company
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruteur@techcorp.com' },
    update: {},
    create: {
      email: 'recruteur@techcorp.com',
      passwordHash: await hashPassword('Recruteur1234!'),
      role: 'recruiter',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Marc',
          lastName: 'Dupont'
        }
      }
    }
  });

  // Ensure recruiter has a company
  const existingCompany = await prisma.company.findUnique({
    where: { userId: recruiter.id }
  });

  if (!existingCompany) {
    const company = await prisma.company.create({
      data: {
        userId: recruiter.id,
        name: 'TechCorp',
        industry: 'Informatique',
        isVerified: true,
        validatedAt: new Date(),
      }
    });

    await prisma.profile.update({
      where: { userId: recruiter.id },
      data: { companyId: company.id }
    });
  }

  // 3. Candidat
  await prisma.user.upsert({
    where: { email: 'candidat@etudiant.com' },
    update: {},
    create: {
      email: 'candidat@etudiant.com',
      passwordHash: await hashPassword('Candidat1234!'),
      role: 'candidate',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Martin',
          bio: 'Étudiante en développement web 3ème année'
        }
      }
    }
  });

  console.log('Seed terminé : 3 users créés');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
