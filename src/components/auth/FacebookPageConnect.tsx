import React, { useState, useEffect } from 'react';
import { Facebook, Plus, CheckCircle, AlertCircle, ExternalLink, Trash2, Settings } from 'lucide-react';

interface FacebookPage {
  id: string;
  name: string;
  picture?: string;
  access_token: string;
  category?: string;
  followers_count?: number;
  is_connected: boolean;
}

interface FacebookPageConnectProps {
  onPageConnect: (pageId: string, accessToken: string) => Promise<void>;
  onPageDisconnect: (pageId: string) => Promise<void>;
  connectedPages?: FacebookPage[];
  loading?: boolean;
}

const FacebookPageConnect: React.FC<FacebookPageConnectProps> = ({
  onPageConnect,
  onPageDisconnect,
  connectedPages = [],
  loading = false
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate OAuth URL for Facebook
  const generateFacebookOAuthUrl = () => {
    const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';
    const redirectUri = encodeURIComponent(`${process.env.REACT_APP_FRONTEND_URL || window.location.origin}/facebook/callback`);
    const state = Math.random().toString(36).substring(2, 15); // Simple state for CSRF protection
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('facebook_oauth_state', state);
    
    const scope = encodeURIComponent('pages_manage_metadata,pages_read_engagement,pages_show_list');
    
    return `https://www.facebook.com/v22.0/dialog/oauth?` +
           `client_id=${facebookAppId}&` +
           `redirect_uri=${redirectUri}&` +
           `scope=${scope}&` +
           `state=${state}&` +
           `response_type=code`;
  };

  const handleConnectFacebook = () => {
    setIsConnecting(true);
    setError('');
    
    try {
      const oauthUrl = generateFacebookOAuthUrl();
      // Redirect to Facebook OAuth
      window.location.href = oauthUrl;
    } catch (error: any) {
      setError('Không thể tạo liên kết OAuth. Vui lòng kiểm tra cấu hình.');
      setIsConnecting(false);
    }
  };

  const handleDisconnectPage = async (page: FacebookPage) => {
    try {
      await onPageDisconnect(page.id);
      setError('');
    } catch (error: any) {
      setError(error.message || 'Ngắt kết nối trang thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Facebook className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý trang Facebook</h2>
            <p className="text-gray-600">Kết nối trang Facebook của bạn để quản lý tin nhắn</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Có lỗi xảy ra</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Connect new page section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết nối trang mới</h3>
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Facebook className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Kết nối trang Facebook
            </h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Nhấp vào nút bên dưới để đăng nhập Facebook và chọn trang bạn muốn kết nối với hệ thống.
            </p>
            <button
              onClick={handleConnectFacebook}
              disabled={isConnecting || loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang chuyển hướng...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Kết nối Facebook
                </>
              )}
            </button>
          </div>
        </div>

        {/* Connected pages section */}
        {connectedPages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trang đã kết nối ({connectedPages.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedPages.map((page) => (
                <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {page.picture ? (
                        <img
                          src={page.picture}
                          alt={page.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{page.name}</h4>
                        {page.category && (
                          <p className="text-sm text-gray-500">{page.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  {page.followers_count && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        {page.followers_count.toLocaleString()} người theo dõi
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://facebook.com/${page.id}`, '_blank')}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem trang
                    </button>
                    <button
                      onClick={() => handleDisconnectPage(page)}
                      disabled={loading}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn kết nối</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Nhấp nút "Kết nối Facebook" để đăng nhập</li>
          <li>2. Chọn trang Facebook bạn muốn kết nối</li>
          <li>3. Cấp quyền truy cập cho ứng dụng</li>
          <li>4. Hệ thống sẽ tự động lưu thông tin kết nối</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookPageConnect; 