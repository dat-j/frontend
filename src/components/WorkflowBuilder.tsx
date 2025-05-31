import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
} from 'reactflow';
import { useWorkflowStore } from '../store/workflowStore';
import MessageEditor from './MessageEditor';
import NodeToolbox from './NodeToolbox';
import MessageNode from './nodes/MessageNode';

const nodeTypes = {
  messageNode: MessageNode,
};

const WorkflowBuilder: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    currentWorkflow,
    error,
    clearError,
  } = useWorkflowStore();

  if (!currentWorkflow) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No workflow selected
          </h3>
          <p className="text-gray-600 mb-4">
            Select a workflow from the list or create a new one to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Canvas kéo thả - Bên trái */}
      <div className="flex-1 relative bg-white">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas title */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-sm border px-4 py-2">
            <h2 className="text-lg font-semibold text-gray-900">Canvas</h2>
            <p className="text-sm text-gray-500">Kéo thả để tạo flow bot</p>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e5e7eb" variant={BackgroundVariant.Dots} />
          <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'messageNode':
                  return '#3b82f6';
                default:
                  return '#64748b';
              }
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          />
        </ReactFlow>

        {/* Canvas Stats */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border px-4 py-2">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{nodes.length}</span> nodes
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{edges.length}</span> connections
            </div>
          </div>
        </div>
      </div>

      {/* Node Toolbox - Cột giữa */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Thêm Elements</h3>
          <p className="text-sm text-gray-600">Chọn và thêm các node vào workflow</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NodeToolbox />
        </div>
      </div>

      {/* Message Editor - Cột phải */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        {selectedNode ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Chỉnh sửa Message</h3>
              <p className="text-sm text-gray-600">Cấu hình thông tin chi tiết cho node đã chọn</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <MessageEditor />
            </div>
          </>
        ) : (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-1.004L3 21l1.996-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn một node để chỉnh sửa
              </h3>
              <p className="text-gray-600 text-sm">
                Click vào bất kỳ node nào trên canvas để bắt đầu cấu hình message
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder; 