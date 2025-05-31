import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

const NodeEditor: React.FC = () => {
  const { selectedNode, updateNode, deleteNode, setSelectedNode } = useWorkflowStore();
  
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<Array<{ title: string; payload: string }>>([]);

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setMessage(selectedNode.data.message || '');
      setButtons(selectedNode.data.buttons || []);
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        label,
        message,
        buttons,
      });
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
      setSelectedNode(null);
    }
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { title: '', payload: '' }]);
    }
  };

  const updateButton = (index: number, field: 'title' | 'payload', value: string) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Node</h3>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Node label"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter bot message..."
          />
        </div>

        {/* Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Buttons (max 3)
            </label>
            {buttons.length < 3 && (
              <button
                onClick={addButton}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {buttons.map((button, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    Button {index + 1}
                  </span>
                  <button
                    onClick={() => removeButton(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={button.title}
                    onChange={(e) => updateButton(index, 'title', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Button title"
                  />
                  <input
                    type="text"
                    value={button.payload}
                    onChange={(e) => updateButton(index, 'payload', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Button payload"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NodeEditor; 