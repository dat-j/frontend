import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

// Navigation helper
const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Try to import from react-router-dom, fallback to manual URL handling
let useNavigate: any, useSearchParams: any;
try {
  const routerDom = require('react-router-dom');
  useNavigate = routerDom.useNavigate;
  useSearchParams = routerDom.useSearchParams;
} catch {
  // Fallback functions if react-router-dom not available
  useNavigate = () => (path: string) => { navigateTo(path); };
  useSearchParams = () => [new URLSearchParams(window.location.search)];
}

const FacebookOAuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      
      if (errorParam) {
        setError('User đã từ chối quyền truy cập Facebook');
        setStatus('error');
        return;
      }

      if (!code) {
        setError('Không nhận được authorization code từ Facebook');
        setStatus('error');
        return;
      }

      // Verify state if stored in sessionStorage
      const storedState = sessionStorage.getItem('facebook_oauth_state');
      if (storedState && state !== storedState) {
        setError('State không hợp lệ - có thể bị tấn công CSRF');
        setStatus('error');
        return;
      }

      try {
        const redirectUri = `${process.env.REACT_APP_FRONTEND_URL || window.location.origin}/facebook/callback`;
        
        // Process callback using authService
        const userData = await authService.processFacebookCallback(code, state || '', redirectUri);
        
        // Update user store with new data
        setUser(userData);
        
        setStatus('success');
        
        // Clean up state
        sessionStorage.removeItem('facebook_oauth_state');
        
        // Redirect về trang quản lý Facebook sau 2 giây
        setTimeout(() => {
          navigate('/dashboard/facebook');
        }, 2000);

      } catch (error: any) {
        setError(error.message || 'Có lỗi xảy ra khi kết nối Facebook');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  const handleGoBack = () => {
    navigate('/dashboard/facebook');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang xử lý kết nối Facebook...
            </h2>
            <p className="text-gray-600">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Kết nối Facebook thành công!
            </h2>
            <p className="text-gray-600">
              Đang chuyển hướng về trang quản lý...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Kết nối thất bại
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={handleGoBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookOAuthRedirect; 