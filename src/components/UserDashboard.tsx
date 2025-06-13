import React, { useState, useEffect } from 'react';
import { Send, LogOut, MessageSquare, Link as LinkIcon, Paperclip } from 'lucide-react';
import { Layout } from './Layout';
import { FileUpload } from './FileUpload';
import { User, Message, UploadedFile, Reply } from '../types';
import { addMessage, getMessages, updateMessage } from '../utils/storage';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [messageContent, setMessageContent] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    const allMessages = getMessages();
    const userMessages = allMessages.filter(m => m.fromUserId === user.id);
    setMessages(userMessages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() && files.length === 0) {
      return;
    }

    const validLinks = links.filter(link => link.trim() !== '');

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      fromUserId: user.id,
      fromUsername: user.username,
      content: messageContent,
      timestamp: new Date().toISOString(),
      files,
      links: validLinks,
      replies: []
    };

    addMessage(newMessage);
    
    // Reset form
    setMessageContent('');
    setLinks(['']);
    setFiles([]);
    
    // Reload messages
    loadMessages();
  };

  const addLinkField = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Layout title="BitCarve - User Dashboard">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user.name}</h2>
            <p className="text-gray-300">Send reports, files, and messages securely</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>My Messages ({messages.length})</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Messages View */}
        {showMessages && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Messages</h3>
            {messages.length === 0 ? (
              <p className="text-gray-400">No messages sent yet.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-400">{formatDate(message.timestamp)}</p>
                    </div>
                    <p className="text-white mb-2">{message.content}</p>
                    
                    {message.files.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm mb-1">Files: {message.files.length}</p>
                        <div className="flex flex-wrap gap-2">
                          {message.files.map((file) => (
                            <span key={file.id} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.links.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm mb-1">Links:</p>
                        <div className="space-y-1">
                          {message.links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm block truncate"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.replies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-2">Admin Replies:</p>
                        <div className="space-y-2">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="bg-green-500/10 border border-green-500/20 rounded p-2">
                              <p className="text-green-300 text-sm">{reply.content}</p>
                              <p className="text-gray-400 text-xs mt-1">{formatDate(reply.timestamp)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Send Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message Content
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your message or report..."
              />
            </div>

            {/* Links */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Links (Optional)
                </label>
                <button
                  type="button"
                  onClick={addLinkField}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Add Link</span>
                </button>
              </div>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Files (Optional)
              </label>
              <FileUpload files={files} onFilesChange={setFiles} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};