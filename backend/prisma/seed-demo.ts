import { PrismaClient } from '@prisma/client';
import { triggerMatchingForOffer } from '../src/modules/offer/matching.service';

const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';

async function fetchCandidateEmbedding(skills: string[], speciality: string, bio: string, school: string): Promise<number[]> {
  const res = await fetch(`${AI_SERVICE_URL}/embed/candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, speciality, bio, school })
  });
  if (!res.ok) {
    throw new Error(`AI Service error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}

async function fetchOfferEmbedding(title: string, description: string, skills: string[]): Promise<number[]> {
  const res = await fetch(`${AI_SERVICE_URL}/embed/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, skills })
  });
  if (!res.ok) {
    throw new Error(`AI Service error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}

async function main() {
  console.log("🧹 Nettoyage des données de test existantes...");

  // Suppression ciblée pour éviter les conflits
  await prisma.matchScore.deleteMany();

  await prisma.cvDocument.deleteMany({
    where: { user: { email: { contains: '@etudiant.com' } } }
  });

  await prisma.jobOffer.deleteMany({
    where: { company: { name: 'TechCorp' } }
  });

  await prisma.user.deleteMany({
    where: { email: { contains: '@etudiant.com' } }
  });

  const candidatesData = [
    {
      firstName: 'Alice',
      lastName: 'Dupont',
      email: 'alice.dupont@etudiant.com',
      bio: 'Développeuse Fullstack passionnée par le web et les interfaces modernes.',
      speciality: 'Développeur Fullstack',
      school: 'Epitech',
      skills: ['React', 'Node.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
    },
    {
      firstName: 'Bob',
      lastName: 'Martin',
      email: 'bob.martin@etudiant.com',
      bio: 'Étudiant en Data Science, fort intérêt pour le Machine Learning et la donnée.',
      speciality: 'Data Scientist',
      school: 'CentraleSupélec',
      skills: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn', 'SQL', 'PyTorch'],
    },
    {
      firstName: 'Charlie',
      lastName: 'Durand',
      email: 'charlie.durand@etudiant.com',
      bio: 'Futur DevOps / Cloud Engineer. Expérience avec AWS, Docker et Kubernetes.',
      speciality: 'DevOps & Cloud Engineer',
      school: '42',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    },
    {
      firstName: 'Diane',
      lastName: 'Lefebvre',
      email: 'diane.lefebvre@etudiant.com',
      bio: 'Conceptrice et développeuse mobile. Je crée des apps cross-platform.',
      speciality: 'Développeur Mobile',
      school: 'Polytech',
      skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'Swift'],
    },
    {
      firstName: 'Eliot',
      lastName: 'Moreau',
      email: 'eliot.moreau@etudiant.com',
      bio: 'Développeur Backend orienté microservices, passionné par la performance des systèmes.',
      speciality: 'Développeur Backend',
      school: 'INSA',
      skills: ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'PostgreSQL', 'Docker'],
    }
  ];

  console.log(`👤 Création de ${candidatesData.length} candidats avec embeddings...`);
  let createdCandidatesCount = 0;

  for (const cand of candidatesData) {
    // 1. Créer le User
    const user = await prisma.user.upsert({
      where: { email: cand.email },
      update: {},
      create: {
        email: cand.email,
        passwordHash: 'hashed_password_demo', // valeur par défaut
        role: 'candidate',
        isVerified: true,
        profile: {
          create: {
            firstName: cand.firstName,
            lastName: cand.lastName,
            bio: cand.bio,
          }
        }
      }
    });

    // 2. Assurer l'existence des skills
    const skillIds = [];
    for (const skillName of cand.skills) {
      const s = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: 'Tech' }
      });
      skillIds.push(s.id);
    }

    // 3. Obtenir l'embedding
    const embedding = await fetchCandidateEmbedding(cand.skills, cand.speciality, cand.bio, cand.school);

    // 4. Créer le CV Document
    const cv = await prisma.cvDocument.create({
      data: {
        userId: user.id,
        fileUrl: `/uploads/demo/${cand.firstName.toLowerCase()}_cv.pdf`,
        isActive: true,
        parseStatus: 'done',
        parsedText: cand.bio,
      }
    });

    // Insertion des skills extraits
    await prisma.extractedSkill.createMany({
      data: skillIds.map(skillId => ({
        cvDocumentId: cv.id,
        skillId,
        confidence: 0.95
      }))
    });

    // Update de l'embedding via raw SQL
    const embeddingStr = '[' + embedding.join(',') + ']';
    await prisma.$executeRaw`
      UPDATE cv_documents 
      SET embedding = ${embeddingStr}::vector(384) 
      WHERE id = ${cv.id}
    `;

    createdCandidatesCount++;
  }

  console.log("🏢 Création de l'entreprise TechCorp et du recruteur...");

  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruteur@techcorp.com' },
    update: {},
    create: {
      email: 'recruteur@techcorp.com',
      passwordHash: 'hashed_password_demo',
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
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      name: 'TechCorp',
      industry: 'IT & Software',
      siteWeb: 'https://techcorp.example.com',
      isVerified: true
    }
  });

  await prisma.profile.updateMany({
    where: { userId: recruiterUser.id },
    data: { companyId: company.id },
  });

  const offersData = [
    {
      title: 'Développeur Fullstack Junior',
      description: 'Rejoignez notre équipe pour développer nos nouvelles applications web B2B.',
      location: 'Paris',
      durationMonths: 6,
      remote: true,
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript']
    },
    {
      title: 'Stage Data Scientist / Machine Learning',
      description: 'Vous travaillerez sur nos modèles prédictifs et améliorerez nos algorithmes de recommandation.',
      location: 'Lyon',
      durationMonths: 6,
      remote: false,
      skills: ['Python', 'TensorFlow', 'Scikit-learn', 'SQL']
    },
    {
      title: 'DevOps / SRE (H/F)',
      description: 'Déploiement, automatisation et maintien en condition opérationnelle de notre plateforme.',
      location: 'Nantes',
      durationMonths: 6,
      remote: true,
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
    },
    {
      title: 'Développeur Mobile Cross-Platform',
      description: 'Création de bout en bout de la nouvelle application mobile grand public TechCorp.',
      location: 'Bordeaux',
      durationMonths: 4,
      remote: false,
      skills: ['Flutter', 'React Native', 'Firebase']
    },
    {
      title: 'Ingénieur Backend Java B2B',
      description: 'Refonte de nos services historiques vers une architecture microservices performante.',
      location: 'Paris',
      durationMonths: 6,
      remote: true,
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL']
    }
  ];

  console.log(`💼 Création de ${offersData.length} offres d'emploi avec embeddings et matching...`);
  let createdOffersCount = 0;

  for (const offerData of offersData) {
    // 1. Assurer l'existence des skills
    const skillIds = [];
    for (const skillName of offerData.skills) {
      const s = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName, category: 'Tech' }
      });
      skillIds.push(s.id);
    }

    // 2. Obtenir l'embedding
    const embedding = await fetchOfferEmbedding(offerData.title, offerData.description, offerData.skills);

    // 3. Créer l'offre
    const offer = await prisma.jobOffer.create({
      data: {
        companyId: company.id,
        recruiterId: recruiterUser.id,
        title: offerData.title,
        description: offerData.description,
        location: offerData.location,
        durationMonths: offerData.durationMonths,
        remote: offerData.remote,
        offerStatus: 'published',
        publishedAt: new Date(),
        offerSkills: {
          create: skillIds.map(skillId => ({
            skillId,
            isRequired: true
          }))
        }
      }
    });

    // Update de l'embedding via raw SQL
    const embeddingStr = '[' + embedding.join(',') + ']';
    await prisma.$executeRaw`
      UPDATE job_offers 
      SET embedding = ${embeddingStr}::vector(384) 
      WHERE id = ${offer.id}
    `;

    // 4. Déclencher le matching (comme demandé)
    await triggerMatchingForOffer(offer.id);
    
    createdOffersCount++;
  }

  // 5. Récupération du nombre de match scores
  const matchScoresCount = await prisma.matchScore.count();

  console.log("\n===========================================");
  console.log(`✅ Seed terminé : ${createdCandidatesCount} candidats, ${createdOffersCount} offres, ${matchScoresCount} match_scores créés.`);
  console.log("===========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
