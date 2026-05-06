const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  const recruiter = await prisma.user.findUnique({
    where: { email: 'recruteur@techcorp.com' },
    include: { company: true }
  });

  if (!recruiter || !recruiter.company) {
    console.error('Recruiter or company not found');
    return;
  }

  const offers = [
    {
      id: uuidv4(),
      title: 'Développeur Fullstack Junior',
      description: 'Rejoignez notre équipe pour développer nos nouvelles applications web B2B.',
      location: 'Paris',
      durationMonths: 6,
      remote: true,
      offerStatus: 'published',
    },
    {
      id: uuidv4(),
      title: 'Stage Data Scientist / Machine Learning',
      description: 'Vous travaillerez sur nos modèles prédictifs et améliorerez nos algorithmes de recommandation.',
      location: 'Lyon',
      durationMonths: 6,
      remote: false,
      offerStatus: 'published',
    }
  ];

  for (const o of offers) {
    await prisma.$executeRaw`
      INSERT INTO job_offers (id, "companyId", "recruiterId", title, description, location, "durationMonths", remote, "offerStatus", "publishedAt", "createdAt", "updatedAt")
      VALUES (${o.id}, ${recruiter.company.id}, ${recruiter.id}, ${o.title}, ${o.description}, ${o.location}, ${o.durationMonths}, ${o.remote}, 'published', NOW(), NOW(), NOW())
    `;
  }

  console.log('2 job offers created for TechCorp via Raw SQL');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
