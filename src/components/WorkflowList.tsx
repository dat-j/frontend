import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Copy, 
  FileText,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { Workflow } from '../services/workflowService';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Workflow</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workflow name"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workflow description"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkflowList: React.FC = () => {
  const {
    workflows,
    currentWorkflow,
    isLoading,
    error,
    loadWorkflows,
    loadWorkflow,
    createWorkflow,
    deleteWorkflow,
    activateWorkflow,
    clearError,
  } = useWorkflowStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleCreateWorkflow = async (data: { name: string; description: string }) => {
    await createWorkflow(data);
  };

  const handleLoadWorkflow = async (workflow: Workflow) => {
    await loadWorkflow(workflow.id);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(id);
    }
  };

  const handleActivateWorkflow = async (id: string) => {
    await activateWorkflow(id);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-red-800">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
          <p className="text-gray-600 mt-1">
            Manage your chatbot workflows
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Current Workflow Info */}
      {currentWorkflow && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Currently editing: {currentWorkflow.name}
            </span>
            {currentWorkflow.isActive && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
              currentWorkflow?.id === workflow.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200'
            }`}
            onClick={() => handleLoadWorkflow(workflow)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 truncate">
                    {workflow.name}
                  </h3>
                  {workflow.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                {workflow.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {workflow.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{workflow.nodes.length} nodes</span>
              <span>{workflow.edges.length} connections</span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
              <Calendar className="w-3 h-3" />
              <span>
                Updated {new Date(workflow.updatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!workflow.isActive ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivateWorkflow(workflow.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-sm rounded hover:bg-green-100 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Activate
                </button>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                  <Pause className="w-3 h-3" />
                  Active
                </span>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement duplicate
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkflow(workflow.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {workflows.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first workflow to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWorkflow}
      />
    </div>
  );
};

export default WorkflowList; 