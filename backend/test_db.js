const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.cvDocument.findMany();
  console.log("Documents:", docs.map(d => ({id: d.id, fileUrl: d.fileUrl, parsedTextLen: d.parsedText?.length || 0})));
  
  const scores = await prisma.matchScore.findMany();
  console.log("MatchScores:", scores);
}

main().finally(() => process.exit(0));
