require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Load environment variables manually
require('dotenv').config();

// Use environment variables
const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const redirectUri = process.env.SLACK_REDIRECT_URI;

// Debug logging
console.log('Environment variables loaded:');
console.log('SLACK_CLIENT_ID:', clientId);
console.log('SLACK_REDIRECT_URI:', redirectUri);
console.log('SLACK_CLIENT_SECRET:', clientSecret ? '***' : 'undefined');

// Step 1: Redirect user to Slack OAuth
router.get('/slack', (req, res) => {
  const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,channels:read,groups:read,im:read,mpim:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

// Step 2: Handle OAuth callback
router.get('/slack/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');
  try {
    const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      },
    });
    const data = response.data;
    if (!data.ok) return res.status(400).json(data);
    // Store tokens in DB
    await prisma.slackToken.upsert({
      where: { 
        userId_teamId: {
          userId: data.authed_user.id,
          teamId: data.team.id
        }
      },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : new Date(Date.now() + 3600 * 1000),
      },
      create: {
        userId: data.authed_user.id,
        teamId: data.team.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : new Date(Date.now() + 3600 * 1000),
      },
    });
    res.send('Slack workspace connected! You can close this window.');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;