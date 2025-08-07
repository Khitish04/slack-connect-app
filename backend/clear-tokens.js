const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function clearTokens() {
  try {
    await prisma.slackToken.deleteMany();
    console.log('✅ All expired tokens cleared from database');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTokens(); 