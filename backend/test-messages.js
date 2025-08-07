const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'U0992DARSR4'; // Replace with your actual user ID from the OAuth flow
const TEST_TEAM_ID = 'T0992DARSKG'; // Replace with your actual team ID from the OAuth flow

async function testEndpoints() {
  console.log('🧪 Testing Slack Connect Message Endpoints\n');

  try {
    // Test 1: Get channels
    console.log('1. Testing GET /api/messages/channels/:userId/:teamId');
    const channelsResponse = await axios.get(`${BASE_URL}/messages/channels/${TEST_USER_ID}/${TEST_TEAM_ID}`);
    console.log('✅ Channels fetched successfully:', channelsResponse.data.data.length, 'channels found');
    
    if (channelsResponse.data.data.length > 0) {
      // Try to find a general channel or use the first available channel
      const channels = channelsResponse.data.data;
      let testChannelId = channels[0].id;
      let testChannelName = channels[0].name;
      
      // Look for a general channel or any public channel
      const generalChannel = channels.find(ch => 
        ch.name === 'general' || 
        ch.name === 'random' || 
        ch.name === 'test' ||
        !ch.is_private
      );
      
      if (generalChannel) {
        testChannelId = generalChannel.id;
        testChannelName = generalChannel.name;
      }
      
      console.log('   Using channel:', testChannelName, `(${testChannelId})`);

      // Test 2: Send immediate message
      console.log('\n2. Testing POST /api/messages/send');
      try {
        const sendResponse = await axios.post(`${BASE_URL}/messages/send`, {
          userId: TEST_USER_ID,
          teamId: TEST_TEAM_ID,
          channelId: testChannelId,
          text: '🧪 Test message from Slack Connect App!'
        });
        console.log('✅ Message sent successfully:', sendResponse.data.message);
      } catch (sendError) {
        if (sendError.response?.data?.error === 'not_in_channel') {
          console.log('⚠️  Bot not in channel. This is expected for private channels.');
          console.log('💡 To fix this, invite the bot to the channel or use a public channel.');
        } else {
          throw sendError;
        }
      }

      // Test 3: Schedule a message (5 minutes from now)
      console.log('\n3. Testing POST /api/messages/schedule');
      const scheduledTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const scheduleResponse = await axios.post(`${BASE_URL}/messages/schedule`, {
        userId: TEST_USER_ID,
        teamId: TEST_TEAM_ID,
        channelId: testChannelId,
        text: '⏰ This is a scheduled test message from Slack Connect App!',
        scheduledFor: scheduledTime.toISOString()
      });
      console.log('✅ Message scheduled successfully:', scheduleResponse.data.message);
      console.log('   Scheduled for:', scheduledTime.toLocaleString());

      // Test 4: Get scheduled messages
      console.log('\n4. Testing GET /api/messages/scheduled/:userId/:teamId');
      const scheduledResponse = await axios.get(`${BASE_URL}/messages/scheduled/${TEST_USER_ID}/${TEST_TEAM_ID}`);
      console.log('✅ Scheduled messages fetched:', scheduledResponse.data.data.length, 'messages found');

      if (scheduledResponse.data.data.length > 0) {
        const scheduledMessageId = scheduledResponse.data.data[0].id;
        
        // Test 5: Cancel scheduled message
        console.log('\n5. Testing DELETE /api/messages/cancel/:id');
        const cancelResponse = await axios.delete(`${BASE_URL}/messages/cancel/${scheduledMessageId}`);
        console.log('✅ Message cancelled successfully:', cancelResponse.data.message);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Available endpoints:');
    console.log('   POST   /api/messages/send - Send immediate message');
    console.log('   POST   /api/messages/schedule - Schedule a message');
    console.log('   GET    /api/messages/scheduled/:userId/:teamId - List scheduled messages');
    console.log('   DELETE /api/messages/cancel/:id - Cancel scheduled message');
    console.log('   GET    /api/messages/channels/:userId/:teamId - Get workspace channels');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your backend server is running on port 3000 (npm start)');
    console.log('   2. You have completed the OAuth flow');
    console.log('   3. The server is accessible at http://localhost:3000');
  }
}

// Run tests
testEndpoints(); 