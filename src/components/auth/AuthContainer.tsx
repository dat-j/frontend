import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import FacebookPageConnect from './FacebookPageConnect';
import { useAuthStore } from '../../store/authStore';

type AuthView = 'login' | 'register' | 'facebook-connect';

const AuthContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const { login, register, connectFacebookPage, disconnectFacebookPage, user } = useAuthStore();

  // If user is authenticated and has connected pages, show Facebook management
  if (user && currentView !== 'facebook-connect') {
    setCurrentView('facebook-connect');
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      // User will be redirected to main app by the auth store
    } catch (error: any) {
      setError(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      await register(name, email, password);
      // After successful registration, user should be logged in automatically
    } catch (error: any) {
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookPageConnect = async (pageId: string, accessToken: string) => {
    setLoading(true);
    setError('');
    
    try {
      await connectFacebookPage(pageId, accessToken);
    } catch (error: any) {
      setError(error.message || 'Kết nối trang Facebook thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookPageDisconnect = async (pageId: string) => {
    setLoading(true);
    setError('');
    
    try {
      await disconnectFacebookPage(pageId);
    } catch (error: any) {
      setError(error.message || 'Ngắt kết nối trang Facebook thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => {
              setCurrentView('register');
              setError('');
            }}
            loading={loading}
            error={error}
          />
        );
      
      case 'register':
        return (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setCurrentView('login');
              setError('');
            }}
            loading={loading}
            error={error}
          />
        );
      
      case 'facebook-connect':
        return (
          <FacebookPageConnect
            onPageConnect={handleFacebookPageConnect}
            onPageDisconnect={handleFacebookPageDisconnect}
            connectedPages={user?.facebookPages || []}
            loading={loading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Navigation tabs for authenticated users */}
        {user && (
          <div className="mb-8">
            <nav className="flex justify-center">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCurrentView('facebook-connect')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'facebook-connect'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quản lý Fanpage
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Auth Content */}
        <div className="flex items-center justify-center">
          {renderCurrentView()}
        </div>
        
        {/* Welcome Message for New Users */}
        {!user && (
          <div className="mt-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Chatbot Workflow Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tạo chatbot thông minh cho Facebook Fanpage với giao diện kéo thả trực quan
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dễ dàng thiết kế</h3>
                <p className="text-gray-600">Giao diện kéo thả trực quan, không cần code</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tích hợp Facebook</h3>
                <p className="text-gray-600">Kết nối trực tiếp với Facebook Messenger</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân tích chi tiết</h3>
                <p className="text-gray-600">Theo dõi hiệu suất và tối ưu hóa chatbot</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthContainer; 