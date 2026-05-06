const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

async function check() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  console.log('--- USERS ---');
  for (const u of users) {
    console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.passwordHash.substring(0, 10)}...`);
  }
  
  const testEmail = 'admin@internlink.com';
  const testPass = 'Admin1234!';
  const admin = users.find(u => u.email === testEmail);
  if (admin) {
    const match = await bcrypt.compare(testPass, admin.passwordHash);
    console.log(`\nTesting Admin Login: ${testEmail} / ${testPass} -> Match: ${match}`);
  } else {
    console.log(`\nAdmin ${testEmail} not found!`);
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
