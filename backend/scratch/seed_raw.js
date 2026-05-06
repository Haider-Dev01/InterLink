const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('--- RAW SEED START ---');

  try {
    // 1. Get or create a recruiter
    let recruiter = await prisma.user.findUnique({ where: { email: 'recruteur@test.com' } });
    if (!recruiter) {
      recruiter = await prisma.user.create({
        data: {
          email: 'recruteur@test.com',
          passwordHash: '$2a$12$R9h/lIPzHZluv5p1VpB1ueT.B.D.D.D.D.D.D.D.D.D.D.D.D.D.D.', // Dummy
          role: 'recruiter',
          isVerified: true,
          profile: {
            create: { firstName: 'Jean', lastName: 'Recruteur' }
          }
        }
      });
    }

    // 2. Get or create a company
    let company = await prisma.company.findUnique({ where: { userId: recruiter.id } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: recruiter.id,
          name: 'TechCorp Test',
          industry: 'IT',
          isVerified: true
        }
      });
    }

    // 3. Insert published offers via Raw SQL with QUOTED camelCase columns
    const offers = [
      { title: 'Developpeur Fullstack React', loc: 'Paris', dur: 6 },
      { title: 'Stage Data Science', loc: 'Lyon', dur: 4 },
      { title: 'DevOps Cloud', loc: 'Tunis', dur: 6 }
    ];

    for (const o of offers) {
      const id = Math.random().toString(36).substr(2, 9);
      await prisma.$executeRawUnsafe(`
        INSERT INTO job_offers (id, "companyId", "recruiterId", title, description, location, "durationMonths", remote, "offerStatus", "publishedAt", "createdAt", "updatedAt")
        VALUES (
          '${id}',
          '${company.id}',
          '${recruiter.id}',
          '${o.title}',
          'Description de test',
          '${o.loc}',
          ${o.dur},
          true,
          'published',
          NOW(),
          NOW(),
          NOW()
        )
      `);
    }

    console.log('--- RAW SEED SUCCESS: 3 offers created ---');
    process.exit(0);
  } catch (err) {
    console.error('--- RAW SEED FAILED ---', err);
    process.exit(1);
  }
}

seed();
