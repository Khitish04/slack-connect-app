require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Send immediate message
router.post('/send', async (req, res) => {
  try {
    const { userId, teamId, channelId, text } = req.body;
    
    if (!userId || !teamId || !channelId || !text) {
      return res.status(400).json({ error: 'Missing required fields: userId, teamId, channelId, text' });
    }

    // Get access token from database
    const tokenRecord = await prisma.slackToken.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    });

    if (!tokenRecord) {
      return res.status(404).json({ error: 'Slack workspace not connected. Please connect your workspace first.' });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      return res.status(401).json({ error: 'Access token expired. Please reconnect your workspace.' });
    }

    // Send message to Slack
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
      text: text
    }, {
      headers: {
        'Authorization': `Bearer ${tokenRecord.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.ok) {
      return res.status(400).json({ error: response.data.error });
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: response.data
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule a message
router.post('/schedule', async (req, res) => {
  try {
    const { userId, teamId, channelId, text, scheduledFor } = req.body;
    
    if (!userId || !teamId || !channelId || !text || !scheduledFor) {
      return res.status(400).json({ error: 'Missing required fields: userId, teamId, channelId, text, scheduledFor' });
    }

    // Validate scheduledFor is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    // Verify workspace is connected
    const tokenRecord = await prisma.slackToken.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    });

    if (!tokenRecord) {
      return res.status(404).json({ error: 'Slack workspace not connected. Please connect your workspace first.' });
    }

    // Create scheduled message
    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        userId,
        teamId,
        channelId,
        text,
        scheduledFor: scheduledDate,
        sent: false,
        cancelled: false
      }
    });

    res.json({ 
      success: true, 
      message: 'Message scheduled successfully',
      data: scheduledMessage
    });

  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scheduled messages for a user
router.get('/scheduled/:userId/:teamId', async (req, res) => {
  try {
    const { userId, teamId } = req.params;

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        userId,
        teamId,
        sent: false,
        cancelled: false
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });

    res.json({ 
      success: true, 
      data: scheduledMessages
    });

  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel a scheduled message
router.delete('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const scheduledMessage = await prisma.scheduledMessage.findUnique({
      where: { id: parseInt(id) }
    });

    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    if (scheduledMessage.sent) {
      return res.status(400).json({ error: 'Cannot cancel a message that has already been sent' });
    }

    if (scheduledMessage.cancelled) {
      return res.status(400).json({ error: 'Message is already cancelled' });
    }

    // Mark as cancelled
    await prisma.scheduledMessage.update({
      where: { id: parseInt(id) },
      data: { cancelled: true }
    });

    res.json({ 
      success: true, 
      message: 'Message cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get channels for a workspace
router.get('/channels/:userId/:teamId', async (req, res) => {
  try {
    const { userId, teamId } = req.params;

    // Get access token
    const tokenRecord = await prisma.slackToken.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    });

    if (!tokenRecord) {
      return res.status(404).json({ error: 'Slack workspace not connected' });
    }

    // Get channels from Slack
    const response = await axios.get('https://slack.com/api/conversations.list', {
      headers: {
        'Authorization': `Bearer ${tokenRecord.accessToken}`
      },
      params: {
        types: 'public_channel,private_channel'
      }
    });

    if (!response.data.ok) {
      return res.status(400).json({ error: response.data.error });
    }

    const channels = response.data.channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      is_private: channel.is_private
    }));

    res.json({ 
      success: true, 
      data: channels
    });

  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 