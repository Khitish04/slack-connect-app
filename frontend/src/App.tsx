import React, { useState, useEffect } from 'react';
import './App.css';
import SlackConnect from './components/SlackConnect';
import MessageComposer from './components/MessageComposer';
import ScheduledMessages from './components/ScheduledMessages';

interface SlackWorkspace {
  userId: string;
  teamId: string;
  connected: boolean;
}

function App() {
  const [workspace, setWorkspace] = useState<SlackWorkspace | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWorkspaceConnection = () => {
      const storedUserId = localStorage.getItem('slack_user_id');
      const storedTeamId = localStorage.getItem('slack_team_id');
      if (storedUserId && storedTeamId) {
        setWorkspace({
          userId: storedUserId,
          teamId: storedTeamId,
          connected: true
        });
      }
    };
    checkWorkspaceConnection();
  }, []);

  const handleWorkspaceConnected = (userId: string, teamId: string) => {
    setWorkspace({ userId, teamId, connected: true });
    localStorage.setItem('slack_user_id', userId);
    localStorage.setItem('slack_team_id', teamId);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <h1>
            <img 
              src="/logo.svg" 
              alt="Slack Connect Logo" 
              style={{ 
                width: '64px', 
                height: '64px', 
                marginRight: '16px',
                verticalAlign: 'middle',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
            Slack Connect
          </h1>
          <p>Send and schedule messages to your Slack workspace</p>
        </div>
      </header>

      <main className="App-main">
        <div className="container">
          {!workspace?.connected ? (
            <SlackConnect onWorkspaceConnected={handleWorkspaceConnected} />
          ) : (
            <>
              <div className="dashboard">
                <div className="features">
                  <MessageComposer 
                    userId={workspace.userId} 
                    teamId={workspace.teamId}
                    loading={loading}
                    setLoading={setLoading}
                  />
                  <ScheduledMessages 
                    userId={workspace.userId} 
                    teamId={workspace.teamId}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </div>
              </div>
              <div style={{
                position: 'fixed',
                bottom: '2rem',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 2,
                fontSize: '1.1rem',
                color: '#6366f1',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.9)',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #e5e7eb'
              }}>
                Connected as <span style={{fontFamily: 'monospace'}}>{workspace.userId}</span> to <span style={{fontFamily: 'monospace'}}>{workspace.teamId}</span>
                <button 
                  className="disconnect-btn"
                  style={{marginLeft: '1.5rem', background: '#f87171', color: '#fff', borderRadius: 999, padding: '0.4rem 1.2rem', fontSize: '1rem'}}
                  onClick={() => {
                    setWorkspace(null);
                    localStorage.removeItem('slack_user_id');
                    localStorage.removeItem('slack_team_id');
                  }}
                >
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
}

export default App;
