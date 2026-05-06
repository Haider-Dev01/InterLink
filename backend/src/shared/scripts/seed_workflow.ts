import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🚀 Démarrage du seed workflow...');

  // 1. Admin unique
  const admin = await prisma.user.upsert({
    where: { email: 'admin@internlink.com' },
    update: {},
    create: {
      email: 'admin@internlink.com',
      passwordHash: await hashPassword('Admin1234!'),
      role: 'admin',
      isVerified: true,
      profile: {
        create: { firstName: 'Super', lastName: 'Admin' }
      }
    }
  });
  console.log('✅ Admin créé/vérifié');

  // 2. Entreprises (TechGo, StartDev, RunCode)
  // Chaque entreprise a besoin d'un owner (technique ou admin)
  // Comme un user ne peut posséder qu'une seule entreprise, on crée des users techniques
  const companiesData = [
    { name: 'TechGo', domain: 'techgo.com' },
    { name: 'StartDev', domain: 'startdev.com' },
    { name: 'RunCode', domain: 'runcode.com' }
  ];

  for (const comp of companiesData) {
    const ownerEmail = `system@${comp.domain}`;
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        passwordHash: await hashPassword('System1234!'),
        role: 'admin', // Owner technique
        isVerified: true,
        profile: {
          create: { firstName: 'System', lastName: comp.name }
        }
      }
    });

    await prisma.company.upsert({
      where: { userId: owner.id },
      update: { name: comp.name, isVerified: true, validatedAt: new Date() },
      create: {
        userId: owner.id,
        name: comp.name,
        isVerified: true,
        validatedAt: new Date(),
        industry: 'Technology'
      }
    });
    console.log(`✅ Entreprise ${comp.name} créée/vérifiée`);
  }

  // 3. Candidats (Jean, James, Kevin)
  const candidates = [
    { email: 'jean@gmail.com', firstName: 'Jean', lastName: 'Dupont' },
    { email: 'james@gmail.com', firstName: 'James', lastName: 'Smith' },
    { email: 'kevin@gmail.com', firstName: 'Kevin', lastName: 'Vasseur' }
  ];

  for (const cand of candidates) {
    await prisma.user.upsert({
      where: { email: cand.email },
      update: {},
      create: {
        email: cand.email,
        passwordHash: await hashPassword('Candidat1234!'),
        role: 'candidate',
        isVerified: true,
        profile: {
          create: { firstName: cand.firstName, lastName: cand.lastName }
        }
      }
    });
    console.log(`✅ Candidat ${cand.firstName} créé/vérifié`);
  }

  console.log('✨ Seed workflow terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
