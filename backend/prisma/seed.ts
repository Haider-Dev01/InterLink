import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedCompany = {
  name: string;
  industry: string;
  region: 'tunisia' | 'europe';
};

const seedCompanies: SeedCompany[] = [
  { name: 'Telnet', industry: 'Telecommunications', region: 'tunisia' },
  { name: 'Vermeg', industry: 'Fintech', region: 'tunisia' },
  { name: 'Orange Tunisie', industry: 'Telecommunications', region: 'tunisia' },
  { name: 'Sofrecom', industry: 'Digital Services', region: 'tunisia' },
  { name: 'SAP', industry: 'Enterprise Software', region: 'europe' },
  { name: 'Capgemini', industry: 'IT Consulting', region: 'europe' },
  { name: 'Siemens', industry: 'Engineering', region: 'europe' },
  { name: 'Atos', industry: 'Digital Transformation', region: 'europe' },
];

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function ensureAdmin() {
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
          lastName: 'Admin',
        },
      },
    },
  });
}

async function ensureCandidate() {
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
          bio: 'Etudiante en developpement web 3eme annee',
        },
      },
    },
  });
}

async function ensureCompanyOwnersAndCompanies() {
  const createdCompanyIds: string[] = [];

  for (const [index, companyDef] of seedCompanies.entries()) {
    const ownerEmail = `recruiter.${index + 1}@${companyDef.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.seed.internlink`;

    const recruiterOwner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        isVerified: true,
      },
      create: {
        email: ownerEmail,
        passwordHash: await hashPassword('Recruteur1234!'),
        role: 'recruiter',
        isVerified: true,
        profile: {
          create: {
            firstName: 'Recruiter',
            lastName: companyDef.name,
          },
        },
      },
    });

    const company = await prisma.company.upsert({
      where: { userId: recruiterOwner.id },
      update: {
        name: companyDef.name,
        industry: companyDef.industry,
        isVerified: true,
        validatedAt: new Date(),
      },
      create: {
        userId: recruiterOwner.id,
        name: companyDef.name,
        industry: companyDef.industry,
        isVerified: true,
        validatedAt: new Date(),
      },
    });

    await prisma.profile.updateMany({
      where: { userId: recruiterOwner.id },
      data: { companyId: company.id },
    });

    createdCompanyIds.push(company.id);
  }

  return createdCompanyIds;
}

async function assignCompanyToEveryRecruiter(companyIds: string[]) {
  const recruiters = await prisma.user.findMany({
    where: {
      role: 'recruiter',
      deletedAt: null,
    },
    include: {
      profile: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  let companyCursor = 0;

  for (const recruiter of recruiters) {
    const linkedCompanyId = recruiter.profile?.companyId ?? null;
    if (linkedCompanyId) {
      if (recruiter.profile && recruiter.profile.companyId !== linkedCompanyId) {
        await prisma.profile.update({
          where: { userId: recruiter.id },
          data: { companyId: linkedCompanyId },
        });
      }
      continue;
    }

    const fallbackCompanyId = companyIds[companyCursor % companyIds.length];
    companyCursor += 1;

    await prisma.profile.updateMany({
      where: { userId: recruiter.id },
      data: { companyId: fallbackCompanyId },
    });
  }
}

async function main() {
  await ensureAdmin();
  await ensureCandidate();

  const companyIds = await ensureCompanyOwnersAndCompanies();
  await assignCompanyToEveryRecruiter(companyIds);

  console.log('Seed termine: companies catalogue cree et recruteurs assignes.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
