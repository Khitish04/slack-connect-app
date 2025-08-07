import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Channel {
  id: string;
  name: string;
  is_private: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Channel[];
  message?: string;
}

interface MessageComposerProps {
  userId: string;
  teamId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  userId, 
  teamId, 
  loading, 
  setLoading 
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Get backend URL from environment variable
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching channels for:', userId, teamId);
      const response = await axios.get<ApiResponse>(`${backendUrl}/api/messages/channels/${userId}/${teamId}`);
      console.log('Channels response:', response.data);
      setChannels(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedChannel(response.data.data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching channels:', error);
      console.error('Error details:', error.response?.data);
      setStatus({ type: 'error', message: 'Failed to fetch channels' });
    } finally {
      setLoading(false);
    }
  }, [userId, teamId, setLoading, backendUrl]);

  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleSendMessage = async () => {
    if (!selectedChannel || !message.trim()) {
      setStatus({ type: 'error', message: 'Please select a channel and enter a message' });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      if (isScheduled && scheduledFor) {
        // Send scheduled message
        await axios.post(`${backendUrl}/api/messages/schedule`, {
          userId,
          teamId,
          channelId: selectedChannel,
          text: message,
          scheduledFor: new Date(scheduledFor).toISOString()
        });
        setStatus({ type: 'success', message: 'Message scheduled successfully!' });
      } else {
        // Send immediate message
        await axios.post(`${backendUrl}/api/messages/send`, {
          userId,
          teamId,
          channelId: selectedChannel,
          text: message
        });
        setStatus({ type: 'success', message: 'Message sent successfully!' });
      }

      // Clear form
      setMessage('');
      setScheduledFor('');
      setIsScheduled(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorMessage = error.response?.data?.error || 'Failed to send message';
      
      // Provide helpful guidance for common errors
      if (errorMessage === 'not_in_channel') {
        errorMessage = 'Bot is not in this channel. Please invite the bot to the channel first.';
      }
      
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedChannelName = () => {
    const channel = channels.find(c => c.id === selectedChannel);
    return channel ? `#${channel.name}` : 'Select a channel';
  };

  return (
    <div className="message-composer">
      <h3>
                  <img 
            src="/message-icon.svg" 
            alt="Message" 
            style={{ 
              width: '32px', 
              height: '32px', 
              marginRight: '12px',
              verticalAlign: 'middle',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }} 
          />
        Send Message
      </h3>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="channel">Channel:</label>
        <select
          id="channel"
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          disabled={loading}
        >
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            disabled={loading}
          />
          Schedule for later
        </label>
      </div>

      {isScheduled && (
        <div className="form-group">
          <label htmlFor="scheduledFor">Schedule for:</label>
          <input
            type="datetime-local"
            id="scheduledFor"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      <button
        className="send-btn"
        onClick={handleSendMessage}
        disabled={loading || !selectedChannel || !message.trim()}
      >
        <span role="img" aria-label="send">📤</span>
        Send Message
      </button>
    </div>
  );
};

export default MessageComposer; 