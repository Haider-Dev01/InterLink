const { PrismaClient } = require('@prisma/client');

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
      title: 'Développeur Fullstack Junior',
      description: 'Rejoignez notre équipe pour développer nos nouvelles applications web B2B.',
      location: 'Paris',
      durationMonths: 6,
      remote: true,
      offerStatus: 'published',
    },
    {
      title: 'Stage Data Scientist / Machine Learning',
      description: 'Vous travaillerez sur nos modèles prédictifs et améliorerez nos algorithmes de recommandation.',
      location: 'Lyon',
      durationMonths: 6,
      remote: false,
      offerStatus: 'published',
    }
  ];

  for (const o of offers) {
    await prisma.jobOffer.create({
      data: {
        ...o,
        companyId: recruiter.company.id,
        recruiterId: recruiter.id,
        publishedAt: new Date()
      }
    });
  }

  console.log('2 job offers created for TechCorp');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
