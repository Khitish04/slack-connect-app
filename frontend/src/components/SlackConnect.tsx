import React from 'react';

interface SlackConnectProps {
  onWorkspaceConnected: (userId: string, teamId: string) => void;
}

const SlackConnect: React.FC<SlackConnectProps> = ({ onWorkspaceConnected }) => {
  const handleConnect = () => {
    // For demo purposes, we'll use the test values from our backend
    // In a real app, this would redirect to the OAuth flow
    const userId = 'U0992DARSR4';
    const teamId = 'T0992DARSKG';
    
    // Simulate OAuth flow
    window.open('https://23cae76c11f5.ngrok-free.app/api/auth/slack', '_blank');
    
    // For demo, we'll auto-connect after a delay
    setTimeout(() => {
      onWorkspaceConnected(userId, teamId);
    }, 2000);
  };

  return (
    <div className="slack-connect">
      <div className="connect-card">
        <div className="connect-icon">
          <span role="img" aria-label="slack">💬</span>
        </div>
        
        <h2>Connect Your Slack Workspace</h2>
        <p>
          Connect your Slack workspace to start sending and scheduling messages.
          You'll be redirected to Slack to authorize the app.
        </p>
        
        <button 
          className="connect-btn"
          onClick={handleConnect}
        >
          <span role="img" aria-label="slack">🔗</span>
          Connect to Slack
        </button>
        
        <div className="features-preview">
          <h3>What you can do:</h3>
          <ul>
            <li>📤 Send immediate messages to any channel</li>
            <li>⏰ Schedule messages for future delivery</li>
            <li>📋 Manage all your scheduled messages</li>
            <li>❌ Cancel scheduled messages anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SlackConnect; 