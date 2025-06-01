import React, { useState, useEffect } from 'react';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowList from './components/WorkflowList';
import WorkflowToolbar from './components/WorkflowToolbar';
import AuthContainer from './components/auth/AuthContainer';
import FacebookOAuthRedirect from './components/auth/FacebookOAuthRedirect';
import FacebookPageConnect from './components/auth/FacebookPageConnect';
import { useWorkflowStore } from './store/workflowStore';
import { useAuthStore } from './store/authStore';
import './App.css';

type ViewMode = 'list' | 'builder';

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const { currentWorkflow, loadActiveWorkflow } = useWorkflowStore();
  const { user } = useAuthStore();

  // Load active workflow on component mount
  useEffect(() => {
    if (user) {
      loadActiveWorkflow();
    }
  }, [user, loadActiveWorkflow]);

  // Switch to builder when a workflow is loaded
  useEffect(() => {
    if (currentWorkflow && currentView === 'list') {
      setCurrentView('builder');
    }
  }, [currentWorkflow, currentView]);

  const showWorkflowList = () => {
    setCurrentView('list');
  };

  const showWorkflowBuilder = () => {
    setCurrentView('builder');
  };

  return (
    <div className="App h-screen flex flex-col">
      {/* Toolbar - always visible */}
      <WorkflowToolbar onShowWorkflowList={showWorkflowList} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'list' ? (
          <WorkflowList />
        ) : (
          <WorkflowBuilder />
        )}
      </main>
    </div>
  );
};

// Facebook Management Component
const FacebookManagement: React.FC = () => {
  const { connectFacebookPage, disconnectFacebookPage, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleFacebookPageConnect = async (pageId: string, accessToken: string) => {
    setLoading(true);
    try {
      await connectFacebookPage(pageId, accessToken);
    } catch (error: any) {
      console.error('Facebook connect error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookPageDisconnect = async (pageId: string) => {
    setLoading(true);
    try {
      await disconnectFacebookPage(pageId);
    } catch (error: any) {
      console.error('Facebook disconnect error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FacebookPageConnect
        onPageConnect={handleFacebookPageConnect}
        onPageDisconnect={handleFacebookPageDisconnect}
        connectedPages={user?.facebookPages || []}
        loading={loading}
      />
    </div>
  );
};

// Get current route from URL
const getCurrentRoute = () => {
  return window.location.pathname;
};

function App() {
  const { user, isAuthenticated, refreshUser, isLoading } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute());

  // Initialize authentication
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  // Listen for URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getCurrentRoute());
    };

    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen for manual navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Route handling
  if (currentRoute === '/facebook/callback') {
    // Facebook OAuth callback - requires authentication
    if (!isAuthenticated || !user) {
      window.location.href = '/auth';
      return null;
    }
    return <FacebookOAuthRedirect />;
  }

  if (currentRoute === '/dashboard/facebook') {
    // Facebook management - requires authentication
    if (!isAuthenticated || !user) {
      window.location.href = '/auth';
      return null;
    }
    return <FacebookManagement />;
  }

  if (currentRoute === '/dashboard') {
    // Main dashboard - requires authentication
    if (!isAuthenticated || !user) {
      window.location.href = '/auth';
      return null;
    }
    return <Dashboard />;
  }

  if (currentRoute === '/auth') {
    // Auth page - redirect if already authenticated
    if (isAuthenticated && user) {
      window.location.href = '/dashboard';
      return null;
    }
    return <AuthContainer />;
  }

  // Default route handling
  if (currentRoute === '/') {
    if (isAuthenticated && user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
    return null;
  }

  // 404 fallback
  if (isAuthenticated && user) {
    window.location.href = '/dashboard';
  } else {
    window.location.href = '/auth';
  }
  return null;
}

export default App;
