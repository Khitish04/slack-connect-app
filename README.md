# Slack Connect Application

A full-stack application that lets you securely connect your Slack workspace, send messages instantly, schedule messages for later, and manage scheduled messages — all from a modern web interface.

## Features

- **Secure OAuth 2.0 Flow** – Connect your Slack workspace safely  
- **Immediate Messaging** – Send messages instantly to any channel  
- **Message Scheduling** – Schedule messages for future delivery  
- **Message Management** – View and cancel scheduled messages  
- **Automatic Token Refresh** – Handles token expiration automatically  
- **Modern UI** – Responsive, clean React frontend  

---

## Architecture

**Backend** – Node.js + Express + TypeScript  
- OAuth 2.0 Slack authentication  
- Token storage and refresh logic  
- APIs for immediate and scheduled messaging  
- Background scheduler for message delivery  
- SQLite database with Prisma ORM  

**Frontend** – React + TypeScript  
- Responsive and modern design  
- Real-time updates  
- Channel selection from connected workspace  
- Message composer with scheduling  
- Management dashboard for scheduled messages  

---

## Live Deployment

- **Frontend (Vercel):** [https://slackconnectapp.vercel.app/](https://slackconnectapp.vercel.app/)  
- **Backend (Render):** [https://slack-connect-backend-w8s7.onrender.com](https://slack-connect-backend-w8s7.onrender.com)  

In production, the frontend communicates directly with the Render backend.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v14+  
- npm or yarn  
- Slack App credentials  

### 1. Clone the Repository
```bash
git clone <repository-url>
cd slack-connect
````

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

### 4. Environment Variables

Create a `.env` file in `backend/`:

```
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://your-ngrok-url/api/auth/slack/callback
DATABASE_URL=file:./dev.db
```

---

## Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

## Running the App Locally

**Backend**

```bash
cd backend
npm start
```

**Frontend**

```bash
cd frontend
npm start
```

Local URLs:

* Frontend → `http://localhost:3000`
* Backend → `http://localhost:3001`

---

## Slack App Setup

1. **Create Slack App**

   * Go to [Slack API Apps](https://api.slack.com/apps)
   * Click **Create New App → From scratch**
   * Name your app and select workspace

2. **Configure OAuth & Permissions**

   * Redirect URL: `https://your-ngrok-url/api/auth/slack/callback`
   * Bot Token Scopes:

     ```
     chat:write
     channels:read
     groups:read
     im:read
     mpim:read
     ```

3. **Install App to Workspace**

   * Go to **Install App**
   * Click **Install to Workspace**
   * Authorize the app

4. **Get Client ID and Secret**

   * Found under **Basic Information** in Slack App settings
   * Add these to `.env` in the backend directory

---

## API Endpoints

**Authentication**

* `GET /api/auth/slack` – Start OAuth
* `GET /api/auth/slack/callback` – OAuth callback

**Messages**

* `POST /api/messages/send` – Send message immediately
* `POST /api/messages/schedule` – Schedule message
* `GET /api/messages/scheduled/:userId/:teamId` – List scheduled messages
* `DELETE /api/messages/cancel/:id` – Cancel scheduled message
* `GET /api/messages/channels/:userId/:teamId` – Get channels

---

## Database Models

**SlackToken**

* `id` | `userId` | `teamId` | `accessToken` | `refreshToken` | `expiresAt` | timestamps

**ScheduledMessage**

* `id` | `userId` | `teamId` | `channelId` | `text` | `scheduledFor` | `sent` | `cancelled` | timestamps

---

## Scheduler Service

* Runs every minute
* Checks and sends due messages
* Refreshes expired tokens
* Marks failed messages

---

## Development Commands

**Backend**

```bash
cd backend
npm run dev     # Development with nodemon
npm start       # Standard start
```

**Frontend**

```bash
cd frontend
npm start
npm build       # Build for production
```

**Database**

```bash
cd backend
npx prisma studio
npx prisma migrate dev
npx prisma generate
```

---

## Deployment Notes

### Backend (Render)

* Set `.env` variables in Render dashboard
* Run `npx prisma migrate deploy` after deploy
* Start using `npm start`

### Frontend (Vercel)

* Set API base URL in `.env` to Render backend URL
* Build with `npm run build`

---

## Security

* Encrypted token storage
* HTTPS enforced for OAuth
* Automatic token refresh
* Input validation and sanitization
* Robust error handling

---

## Troubleshooting

**Invalid `client_id`**

* Verify `SLACK_CLIENT_ID` in `.env`

**Redirect URI mismatch**

* Match Slack app redirect URI exactly to ngrok/production URL

**Bot not in channel**

* Invite the bot or use a public channel

**Database connection issues**

* Check `DATABASE_URL` and run `npx prisma migrate dev`

---

## License

Licensed under the MIT License.
