import React, { useState, useEffect } from 'react';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowList from './components/WorkflowList';
import WorkflowToolbar from './components/WorkflowToolbar';
import { useWorkflowStore } from './store/workflowStore';
import './App.css';

type ViewMode = 'list' | 'builder';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const { currentWorkflow, loadActiveWorkflow } = useWorkflowStore();

  // Load active workflow on app start
  useEffect(() => {
    loadActiveWorkflow();
  }, [loadActiveWorkflow]);

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
}

export default App;
