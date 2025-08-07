const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function getUserInfo() {
  try {
    console.log('🔍 Retrieving user information from database...\n');
    
    const tokens = await prisma.slackToken.findMany();
    
    if (tokens.length === 0) {
      console.log('❌ No Slack tokens found in database.');
      console.log('💡 Please complete the OAuth flow first by visiting:');
      console.log('   https://25d732d441ce.ngrok-free.app/api/auth/slack');
      return;
    }
    
    console.log('✅ Found Slack tokens in database:');
    tokens.forEach((token, index) => {
      console.log(`\n${index + 1}. User ID: ${token.userId}`);
      console.log(`   Team ID: ${token.teamId}`);
      console.log(`   Token expires: ${token.expiresAt.toLocaleString()}`);
      console.log(`   Created: ${token.createdAt.toLocaleString()}`);
    });
    
    if (tokens.length === 1) {
      console.log('\n📝 Update your test-messages.js with these values:');
      console.log(`   TEST_USER_ID = '${tokens[0].userId}'`);
      console.log(`   TEST_TEAM_ID = '${tokens[0].teamId}'`);
    }
    
  } catch (error) {
    console.error('❌ Error retrieving user info:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserInfo(); 