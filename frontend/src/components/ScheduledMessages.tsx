import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ScheduledMessage {
  id: number;
  channelId: string;
  text: string;
  scheduledFor: string;
  sent: boolean;
  cancelled: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ScheduledMessage[];
  message?: string;
}

interface ScheduledMessagesProps {
  userId: string;
  teamId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ScheduledMessages: React.FC<ScheduledMessagesProps> = ({ 
  userId, 
  teamId, 
  loading, 
  setLoading 
}) => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchScheduledMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching scheduled messages for:', userId, teamId);
      const response = await axios.get<ApiResponse>(`http://localhost:3000/api/messages/scheduled/${userId}/${teamId}`);
      console.log('Scheduled messages response:', response.data);
      setMessages(response.data.data);
    } catch (error: any) {
      console.error('Error fetching scheduled messages:', error);
      console.error('Error details:', error.response?.data);
      setStatus({ type: 'error', message: 'Failed to fetch scheduled messages' });
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, setLoading]);

  // Fetch scheduled messages on component mount
  useEffect(() => {
    fetchScheduledMessages();
  }, [fetchScheduledMessages]);

  const handleCancelMessage = async (messageId: number) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/messages/cancel/${messageId}`);
      setStatus({ type: 'success', message: 'Message cancelled successfully!' });
      // Refresh the list
      fetchScheduledMessages();
    } catch (error: any) {
      console.error('Error cancelling message:', error);
      const errorMessage = error.response?.data?.error || 'Failed to cancel message';
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (message: ScheduledMessage) => {
    if (message.cancelled) return <span className="badge cancelled">❌ Cancelled</span>;
    if (message.sent) return <span className="badge sent">✅ Sent</span>;
    return <span className="badge pending">⏰ Pending</span>;
  };

  return (
    <div className="scheduled-messages">
      <div className="header">
        <h3>
          <img 
            src="/scheduled-icon.svg" 
            alt="Scheduled Messages" 
            style={{ 
              width: '32px', 
              height: '32px', 
              marginRight: '12px',
              verticalAlign: 'middle',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }} 
          />
          Scheduled Messages
        </h3>
        <button 
          className="refresh-btn"
          onClick={fetchScheduledMessages}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No scheduled messages found.</p>
          <p>Schedule a message to see it here!</p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div key={message.id} className="message-card">
              <div className="message-header">
                <div className="message-info">
                  <strong>Channel: #{message.channelId}</strong>
                  <span className="scheduled-time">
                    Scheduled for: {formatDate(message.scheduledFor)}
                  </span>
                </div>
                {getStatusBadge(message)}
              </div>
              
              <div className="message-content">
                <p>{message.text}</p>
              </div>
              
              <div className="message-footer">
                <span className="created-time">
                  Created: {formatDate(message.createdAt)}
                </span>
                
                {!message.sent && !message.cancelled && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelMessage(message.id)}
                    disabled={loading}
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledMessages; 