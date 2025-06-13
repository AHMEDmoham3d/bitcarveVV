import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, LogOut, Plus, Edit, Trash2, Ban, UserCheck, Eye, Download, Reply } from 'lucide-react';
import { Layout } from './Layout';
import { User, Message, UploadedFile, Reply as MessageReply } from '../types';
import { getUsers, getMessages, addUser, updateUser, deleteUser, updateMessage } from '../utils/storage';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'messages'>('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  // User form state
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(getUsers());
    setMessages(getMessages());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.password || !userForm.name) {
      return;
    }

    // Check if username already exists
    if (users.find(u => u.username === userForm.username)) {
      alert('Username already exists');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userForm.username,
      password: userForm.password,
      name: userForm.name,
      createdAt: new Date().toISOString(),
      isBanned: false
    };

    addUser(newUser);
    setUserForm({ username: '', password: '', name: '' });
    setShowUserForm(false);
    loadData();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: user.password,
      name: user.name
    });
    setShowUserForm(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser || !userForm.username || !userForm.password || !userForm.name) {
      return;
    }

    // Check if username already exists (excluding current user)
    if (users.find(u => u.username === userForm.username && u.id !== editingUser.id)) {
      alert('Username already exists');
      return;
    }

    updateUser(editingUser.id, {
      username: userForm.username,
      password: userForm.password,
      name: userForm.name
    });

    setUserForm({ username: '', password: '', name: '' });
    setShowUserForm(false);
    setEditingUser(null);
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This will also delete all their messages.')) {
      deleteUser(userId);
      loadData();
    }
  };

  const handleToggleBan = (user: User) => {
    updateUser(user.id, { isBanned: !user.isBanned });
    loadData();
  };

  const handleReply = (messageId: string) => {
    if (!replyContent.trim()) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const newReply: MessageReply = {
      id: `reply-${Date.now()}`,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isFromAdmin: true
    };

    const updatedReplies = [...message.replies, newReply];
    updateMessage(messageId, { replies: updatedReplies });

    setReplyContent('');
    loadData();
  };

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewFileContent = (file: UploadedFile) => {
    setPreviewFile(file);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout title="BitCarve - Admin Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-gray-300">Manage users and monitor system activity</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-300">Total Messages</p>
                <p className="text-2xl font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Ban className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-300">Banned Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.isBanned).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Messages & Files
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Users Management</h3>
              <button
                onClick={() => {
                  setShowUserForm(true);
                  setEditingUser(null);
                  setUserForm({ username: '', password: '', name: '' });
                }}
                className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {/* User Form Modal */}
            {showUserForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 w-full max-w-md">
                  <h4 className="text-lg font-bold text-white mb-4">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h4>
                  <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                      >
                        {editingUser ? 'Update' : 'Add'} User
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                        }}
                        className="flex-1 bg-gray-500/20 border border-gray-500/30 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-500/30 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                        <td className="py-3 px-4 text-gray-300">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isBanned 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{formatDate(user.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(user)}
                              className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                              title={user.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              {user.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No users found. Add your first user to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Messages & Files</h3>
            
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-medium">From: {message.fromUsername}</p>
                      <p className="text-gray-400 text-sm">{formatDate(message.timestamp)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-white">{message.content}</p>
                  </div>

                  {message.links.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Links:</p>
                      <div className="space-y-1">
                        {message.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm block"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Files ({message.files.length}):</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {message.files.map((file) => (
                          <div key={file.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-white text-sm font-medium truncate mb-1">{file.name}</p>
                            <p className="text-gray-400 text-xs mb-2">{formatFileSize(file.size)}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => previewFileContent(file)}
                                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => downloadFile(file)}
                                className="flex items-center space-x-1 text-green-400 hover:text-green-300 text-xs"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.replies.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-2">Your Replies:</p>
                      <div className="space-y-2">
                        {message.replies.map((reply) => (
                          <div key={reply.id} className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                            <p className="text-blue-300 text-sm">{reply.content}</p>
                            <p className="text-gray-400 text-xs mt-1">{formatDate(reply.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={selectedMessage?.id === message.id ? replyContent : ''}
                        onChange={(e) => {
                          setSelectedMessage(message);
                          setReplyContent(e.target.value);
                        }}
                        placeholder="Type your reply..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleReply(message.id)}
                        className="flex items-center space-x-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages received yet.</p>
              </div>
            )}
          </div>
        )}

        {/* File Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h4 className="text-lg font-bold text-white">{previewFile.name}</h4>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-96">
                {previewFile.type.startsWith('image/') ? (
                  <img 
                    src={previewFile.content} 
                    alt={previewFile.name}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : previewFile.type.startsWith('text/') || 
                   previewFile.type.includes('javascript') || 
                   previewFile.type.includes('json') ? (
                  <pre className="text-gray-300 text-sm bg-black/20 p-4 rounded-lg overflow-x-auto">
                    {/* For text files, we'd need to decode base64 - simplified for demo */}
                    <code>File content preview not available for this demo</code>
                  </pre>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Preview not available for this file type</p>
                    <p className="text-sm mt-2">Click download to save the file</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => downloadFile(previewFile)}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};