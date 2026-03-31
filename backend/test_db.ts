import { prisma } from './src/shared/config/prismaClient';

async function main() {
  const offers = await prisma.jobOffer.findMany({ select: { id: true, title: true, description: true } });
  console.log("Offers:", offers);
}

main().finally(() => process.exit(0));
