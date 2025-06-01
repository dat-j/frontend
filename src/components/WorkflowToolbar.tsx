import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  Settings,
  List,
  MessageCircle,
  User,
  LogOut,
  ChevronDown,
  Facebook
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { useAuthStore } from '../store/authStore';
import ChatPreview from './ChatPreview';

interface WorkflowToolbarProps {
  onShowWorkflowList: () => void;
}

// Navigation helper function
const navigateToFacebook = () => {
  window.history.pushState({}, '', '/dashboard/facebook');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({ onShowWorkflowList }) => {
  const {
    currentWorkflow,
    nodes,
    edges,
    isLoading,
    error,
    saveCurrentWorkflow,
    loadActiveWorkflow,
    activateWorkflow,
  } = useWorkflowStore();

  const { user, logout } = useAuthStore();

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showChatPreview, setShowChatPreview] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSave = async () => {
    if (currentWorkflow) {
      await saveCurrentWorkflow();
      setLastSaved(new Date());
    }
  };

  const handleActivate = async () => {
    if (currentWorkflow) {
      await activateWorkflow(currentWorkflow.id);
    }
  };

  const handleLoadActive = async () => {
    await loadActiveWorkflow();
  };

  const handleTestChat = () => {
    setShowChatPreview(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleFacebookManagement = () => {
    navigateToFacebook();
    setShowUserMenu(false);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Workflow Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Chatbot Workflow Platform
              </h1>
              {currentWorkflow && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-700">
                    {currentWorkflow.name}
                  </span>
                  {currentWorkflow.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{nodes.length} nodes</span>
              <span>•</span>
              <span>{edges.length} connections</span>
              {lastSaved && (
                <>
                  <span>•</span>
                  <span className="text-green-600">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Error Indicator */}
            {error && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Saving...</span>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={onShowWorkflowList}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Workflow List"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Workflows</span>
            </button>

            <button
              onClick={handleFacebookManagement}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Facebook Management"
            >
              <Facebook className="w-4 h-4" />
              <span className="hidden sm:inline">Facebook</span>
            </button>

            <button
              onClick={handleLoadActive}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Load Active Workflow"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Load Active</span>
            </button>

            {currentWorkflow && (
              <>
                <button
                  onClick={handleTestChat}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="Test Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Test Chat</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Save Workflow"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                {!currentWorkflow.isActive && (
                  <button
                    onClick={handleActivate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Activate Workflow"
                  >
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Activate</span>
                  </button>
                )}
              </>
            )}

            {!currentWorkflow && (
              <div className="text-sm text-gray-500 px-3 py-2">
                No workflow selected
              </div>
            )}

            {/* User Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="hidden md:inline font-medium">{user?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Tham gia: {user ? new Date(user.created_at).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>

                  {/* Connected Pages */}
                  {user?.facebookPages && user.facebookPages.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2">Facebook Pages</div>
                      {user.facebookPages.slice(0, 2).map((page) => (
                        <div key={page.id} className="flex items-center gap-2 py-1">
                          <Facebook className="w-3 h-3 text-blue-600" />
                          <span className="text-sm text-gray-700 truncate">{page.name}</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
                        </div>
                      ))}
                      {user.facebookPages.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{user.facebookPages.length - 2} trang khác
                        </div>
                      )}
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        // Navigate to settings/profile (implement later)
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Cài đặt tài khoản
                    </button>
                    
                    <button
                      onClick={handleFacebookManagement}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                      Quản lý Fanpage
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {currentWorkflow && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>ID: {currentWorkflow.id.slice(0, 8)}...</span>
              <span>
                Created: {new Date(currentWorkflow.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(currentWorkflow.updatedAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {currentWorkflow.isActive ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>This workflow is currently active</span>
                </div>
              ) : (
                <span className="text-amber-600">
                  Workflow is not active
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Preview Modal */}
      <ChatPreview
        workflowId={currentWorkflow?.id}
        isOpen={showChatPreview}
        onClose={() => setShowChatPreview(false)}
      />

      {/* Overlay for closing user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default WorkflowToolbar; 