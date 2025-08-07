# 🚀 Slack Connect Application

A full-stack application that enables users to securely connect their Slack workspace, send messages (both immediately and scheduled), and manage scheduled messages.

## ✨ Features

- **🔐 Secure OAuth 2.0 Flow** - Connect your Slack workspace securely
- **💬 Immediate Messaging** - Send messages to any channel instantly
- **⏰ Message Scheduling** - Schedule messages for future delivery
- **📋 Message Management** - View and cancel scheduled messages
- **🔄 Automatic Token Refresh** - Handles token expiration automatically
- **📱 Modern UI** - Beautiful, responsive React frontend

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **OAuth 2.0 Flow** - Secure Slack workspace connection
- **Token Management** - Store and refresh access tokens
- **Message API** - Send immediate and scheduled messages
- **Scheduler Service** - Background service for sending scheduled messages
- **SQLite Database** - Persistent storage using Prisma ORM

### Frontend (React + TypeScript)
- **Modern UI** - Beautiful, responsive design
- **Real-time Updates** - Live status updates and notifications
- **Channel Selection** - Choose from available Slack channels
- **Message Composer** - Rich interface for composing messages
- **Scheduled Messages** - Manage all scheduled messages

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Slack App credentials (see setup below)

### 1. Clone and Install

```bash
git clone <repository-url>
cd slack-connect
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Environment Configuration

Create `.env` file in the `backend` directory:

```env
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://your-ngrok-url/api/auth/slack/callback
DATABASE_URL=file:./dev.db
```

### 5. Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Slack App Setup

### 1. Create a Slack App
1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app and select your workspace

### 2. Configure OAuth & Permissions
1. Go to "OAuth & Permissions" in the left sidebar
2. Add Redirect URL: `https://your-ngrok-url/api/auth/slack/callback`
3. Add Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `groups:read`
   - `im:read`
   - `mpim:read`

### 3. Install App to Workspace
1. Go to "Install App" in the left sidebar
2. Click "Install to Workspace"
3. Authorize the app

### 4. Get Credentials
1. Go to "Basic Information"
2. Copy your **Client ID** and **Client Secret**
3. Add these to your `.env` file

## 🌐 Ngrok Setup (for OAuth)

Since Slack requires HTTPS for OAuth, you'll need ngrok for local development:

```bash
# Install ngrok
# Download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3001

# Copy the HTTPS URL and update your Slack app's redirect URL
# Example: https://abc123.ngrok-free.app/api/auth/slack/callback
```

## 📚 API Endpoints

### Authentication
- `GET /api/auth/slack` - Initiate OAuth flow
- `GET /api/auth/slack/callback` - OAuth callback handler

### Messages
- `POST /api/messages/send` - Send immediate message
- `POST /api/messages/schedule` - Schedule a message
- `GET /api/messages/scheduled/:userId/:teamId` - List scheduled messages
- `DELETE /api/messages/cancel/:id` - Cancel scheduled message
- `GET /api/messages/channels/:userId/:teamId` - Get workspace channels

## 🗄️ Database Schema

### SlackToken
- `id` - Primary key
- `userId` - Slack user ID
- `teamId` - Slack team ID
- `accessToken` - OAuth access token
- `refreshToken` - OAuth refresh token
- `expiresAt` - Token expiration time
- `createdAt` - Record creation time
- `updatedAt` - Record update time

### ScheduledMessage
- `id` - Primary key
- `userId` - Slack user ID
- `teamId` - Slack team ID
- `channelId` - Target channel ID
- `text` - Message content
- `scheduledFor` - Scheduled delivery time
- `sent` - Whether message was sent
- `cancelled` - Whether message was cancelled
- `createdAt` - Record creation time
- `updatedAt` - Record update time

## 🔄 Message Scheduler

The application includes a background scheduler that:
- Runs every minute
- Checks for due messages
- Sends messages automatically
- Handles token expiration
- Marks failed messages appropriately

## 🎨 Frontend Features

### Connection Flow
1. **Connect Workspace** - OAuth flow to connect Slack
2. **Channel Selection** - Choose from available channels
3. **Message Composition** - Rich text editor for messages
4. **Scheduling** - Set future delivery times
5. **Management** - View and cancel scheduled messages

### UI Components
- **SlackConnect** - OAuth connection interface
- **MessageComposer** - Message creation and scheduling
- **ScheduledMessages** - Message management interface

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # If using nodemon
npm start    # Standard start
```

### Frontend Development
```bash
cd frontend
npm start    # Starts development server
npm build    # Build for production
```

### Database Management
```bash
cd backend
npx prisma studio    # Open database GUI
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate client
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Run database migrations
3. Start the application with PM2 or similar

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API endpoints to production URLs

## 🔒 Security Considerations

- **Token Storage** - Access tokens are encrypted in the database
- **HTTPS Required** - OAuth flow requires HTTPS (use ngrok for development)
- **Token Refresh** - Automatic token refresh prevents expiration issues
- **Input Validation** - All inputs are validated and sanitized
- **Error Handling** - Comprehensive error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid client_id parameter"**
   - Check your `.env` file has correct SLACK_CLIENT_ID
   - Ensure the environment variables are loaded

2. **"redirect_uri did not match"**
   - Update your Slack app's redirect URL to match ngrok URL
   - Ensure the URL is exactly the same

3. **"Bot not in channel"**
   - Invite the bot to the channel
   - Use a public channel instead of private

4. **Database connection issues**
   - Run `npx prisma migrate dev`
   - Check DATABASE_URL in `.env`

### Debug Mode
Enable debug logging by setting `DEBUG=backend:*` in your environment.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Slack API documentation
3. Open an issue in the repository

---

**Built with ❤️ using Node.js, Express, React, TypeScript, and Prisma** 