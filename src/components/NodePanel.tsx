import React from 'react';
import { Plus, MessageCircle, Play, Square } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { v4 as uuidv4 } from 'uuid';

const NodePanel: React.FC = () => {
  const { addNode, nodes } = useWorkflowStore();

  const addMessageNode = () => {
    const newNode = {
      id: uuidv4(),
      type: 'messageNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        label: `Message ${nodes.length + 1}`,
        message: 'Enter your message here...',
        buttons: [],
      },
    };
    addNode(newNode);
  };

  const addStartNode = () => {
    const newNode = {
      id: uuidv4(),
      type: 'messageNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        label: 'Start',
        message: 'Welcome! How can I help you?',
        buttons: [],
      },
    };
    addNode(newNode);
  };

  const addEndNode = () => {
    const newNode = {
      id: uuidv4(),
      type: 'messageNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        label: 'End',
        message: 'Thank you for using our service!',
        buttons: [],
      },
    };
    addNode(newNode);
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Add Nodes</h3>
      
      <div className="space-y-2">
        <button
          onClick={addStartNode}
          className="w-full flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Start Node</span>
        </button>

        <button
          onClick={addMessageNode}
          className="w-full flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Message Node</span>
        </button>

        <button
          onClick={addEndNode}
          className="w-full flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
        >
          <Square className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">End Node</span>
        </button>
      </div>
    </div>
  );
};

export default NodePanel; 