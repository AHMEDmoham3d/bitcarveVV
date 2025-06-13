import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Layout } from './components/Layout';
import { User } from './types';
import { authenticateUser, authenticateAdmin } from './utils/storage';

type AppState = 'login' | 'admin-login' | 'user-dashboard' | 'admin-dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check for admin route
    const path = window.location.pathname;
    if (path === '/admin-panel-secure-access-2024') {
      setAppState('admin-login');
    }
  }, []);

  const handleUserLogin = (username: string, password: string) => {
    const user = authenticateUser(username, password);
    if (user) {
      setCurrentUser(user);
      setAppState('user-dashboard');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password, or your account has been banned.');
    }
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (authenticateAdmin(password)) {
      setAppState('admin-dashboard');
      setLoginError('');
    } else {
      setLoginError('Invalid admin password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('login');
    setLoginError('');
    // Reset URL if coming from admin
    if (window.location.pathname === '/admin-panel-secure-access-2024') {
      window.history.pushState(null, '', '/');
    }
  };

  if (appState === 'user-dashboard' && currentUser) {
    return <UserDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (appState === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (appState === 'admin-login') {
    return (
      <Layout title="BitCarve - Admin Access">
        <div className="max-w-md mx-auto mt-16">
          <LoginForm
            onLogin={handleAdminLogin}
            error={loginError}
            title="Admin Login"
            isAdmin={true}
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAppState('login');
                window.history.pushState(null, '', '/');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              ← Back to User Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16">
        <LoginForm
          onLogin={handleUserLogin}
          error={loginError}
          title="User Login"
        />
        
        {/* Information Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-3">Welcome to BitCarve</h3>
          <p className="text-gray-300 text-sm mb-4">
            A secure platform for file sharing and reporting. Only registered users can access this system.
          </p>
          
          <div className="space-y-2 text-xs text-gray-400">
            <p>• Secure file upload and sharing</p>
            <p>• Message and report system</p>
            <p>• Admin-controlled user access</p>
            <p>• File preview and download capabilities</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Contact your administrator for account access.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;