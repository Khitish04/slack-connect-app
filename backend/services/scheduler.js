const { PrismaClient } = require('../generated/prisma');
const axios = require('axios');

const prisma = new PrismaClient();

class MessageScheduler {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting message scheduler...');
    this.isRunning = true;
    
    // Check for scheduled messages every minute
    this.interval = setInterval(() => {
      this.processScheduledMessages();
    }, 60000); // 60 seconds

    // Also process immediately on start
    this.processScheduledMessages();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('Message scheduler stopped');
  }

  async processScheduledMessages() {
    try {
      const now = new Date();
      
      // Find messages that are due to be sent
      const dueMessages = await prisma.scheduledMessage.findMany({
        where: {
          scheduledFor: {
            lte: now
          },
          sent: false,
          cancelled: false
        }
      });

      console.log(`Found ${dueMessages.length} messages due for sending`);

      for (const message of dueMessages) {
        await this.sendScheduledMessage(message);
      }
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
    }
  }

  async sendScheduledMessage(message) {
    try {
      console.log(`Attempting to send scheduled message: ${message.id}`);

      // Fetch the token for this message's user and team
      const tokenRecord = await prisma.slackToken.findUnique({
        where: {
          userId_teamId: {
            userId: message.userId,
            teamId: message.teamId
          }
        }
      });

      // Check if token is still valid
      if (!tokenRecord || !tokenRecord.accessToken) {
        await this.markMessageAsFailed(message.id, 'No valid token found');
        return;
      }

      // Check if token is expired
      if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
        await this.markMessageAsFailed(message.id, 'Token expired');
        return;
      }

      // Send message via Slack API
      const response = await axios.post('https://slack.com/api/chat.postMessage', {
        channel: message.channelId,
        text: message.text
      }, {
        headers: {
          'Authorization': `Bearer ${tokenRecord.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.ok) {
        // Mark message as sent
        await prisma.scheduledMessage.update({
          where: { id: message.id },
          data: { sent: true }
        });
        console.log(`Successfully sent scheduled message: ${message.id}`);
      } else {
        await this.markMessageAsFailed(message.id, response.data.error || 'Slack API error');
      }
    } catch (error) {
      console.error(`Error sending scheduled message ${message.id}:`, error.message);
      await this.markMessageAsFailed(message.id, error.message);
    }
  }

  async markMessageAsFailed(messageId, error) {
    try {
      await prisma.scheduledMessage.update({
        where: { id: messageId },
        data: { 
          sent: false,
          // You could add an error field to the schema if needed
        }
      });
      console.log(`Marked message ${messageId} as failed: ${error}`);
    } catch (updateError) {
      console.error(`Error marking message ${messageId} as failed:`, updateError);
    }
  }
}

module.exports = MessageScheduler; 