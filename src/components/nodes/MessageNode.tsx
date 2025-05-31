import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  MessageCircle, 
  Settings, 
  Type,
  MousePointer,
  Image,
  Video,
  FileText,
  List,
  Receipt,
  Grid3X3,
  Play,
  Square
} from 'lucide-react';
import { WorkflowNodeData } from '../../store/workflowStore';
import { useWorkflowStore } from '../../store/workflowStore';

const MessageNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, id, selected }) => {
  const { setSelectedNode, nodes } = useWorkflowStore();
  
  const handleNodeClick = () => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setSelectedNode(node);
    }
  };

  // Get icon based on message type
  const getMessageTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ElementType } = {
      text: Type,
      quick_replies: MousePointer,
      button_template: Grid3X3,
      image: Image,
      video: Video,
      file: FileText,
      generic_template: Grid3X3,
      list_template: List,
      receipt_template: Receipt
    };
    return icons[type] || MessageCircle;
  };

  // Get color based on message type
  const getMessageTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      text: 'blue',
      quick_replies: 'purple',
      button_template: 'indigo',
      image: 'pink',
      video: 'red',
      file: 'gray',
      generic_template: 'yellow',
      list_template: 'teal',
      receipt_template: 'orange',
      flexible: 'emerald'
    };
    return colors[type] || 'blue';
  };

  // Special styling for start and end nodes
  const isStartNode = data.label === 'Start' || data.messageType === 'start';
  const isEndNode = data.label === 'End' || data.messageType === 'end';
  
  const messageType = data.messageType || 'text';
  const IconComponent = getMessageTypeIcon(messageType);
  const color = getMessageTypeColor(messageType);

  // Color classes
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', icon: 'text-purple-500' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700', icon: 'text-indigo-500' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700', icon: 'text-pink-500' },
    red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: 'text-red-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-700', icon: 'text-gray-500' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', icon: 'text-yellow-500' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-500', text: 'text-teal-700', icon: 'text-teal-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-500' },
    green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: 'text-green-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', icon: 'text-emerald-500' },
  };

  const nodeColor = isStartNode ? 'green' : isEndNode ? 'red' : color;
  const classes = colorClasses[nodeColor as keyof typeof colorClasses];

  return (
    <div 
      className={`bg-white rounded-lg border-2 p-4 min-w-[200px] max-w-[250px] cursor-pointer transition-all shadow-sm ${
        selected ? `${classes.border} shadow-lg` : 'border-gray-300 hover:border-gray-400'
      }`}
      onClick={handleNodeClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 ${classes.icon.replace('text-', 'bg-').replace('-500', '-400')}`}
      />

      {/* Node Header */}
      <div className={`flex items-center gap-2 mb-3 p-2 rounded-md ${classes.bg}`}>
        {isStartNode ? (
          <Play className={`w-4 h-4 ${classes.icon}`} />
        ) : isEndNode ? (
          <Square className={`w-4 h-4 ${classes.icon}`} />
        ) : (
          <IconComponent className={`w-4 h-4 ${classes.icon}`} />
        )}
        <span className={`font-medium text-sm ${classes.text}`}>{data.label}</span>
        <Settings className="w-3 h-3 text-gray-400 ml-auto" />
      </div>

      {/* Message Type Label */}
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
        {messageType.replace('_', ' ')}
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        {/* Text Message Preview */}
        {data.message && (
          <div className="text-xs text-gray-700 line-clamp-2 bg-gray-50 p-2 rounded">
            {data.message}
          </div>
        )}

        {/* Quick Replies Preview */}
        {data.quickReplies && data.quickReplies.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">Quick Replies:</div>
            {data.quickReplies.slice(0, 2).map((reply: any, index: number) => (
              <div
                key={index}
                className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200"
              >
                {reply.title}
              </div>
            ))}
            {data.quickReplies.length > 2 && (
              <div className="text-xs text-gray-500">
                +{data.quickReplies.length - 2} more
              </div>
            )}
          </div>
        )}

        {/* Buttons Preview */}
        {data.buttons && data.buttons.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">Buttons:</div>
            {data.buttons.slice(0, 2).map((button: any, index: number) => (
              <div
                key={index}
                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200"
              >
                {button.title}
              </div>
            ))}
            {data.buttons.length > 2 && (
              <div className="text-xs text-gray-500">
                +{data.buttons.length - 2} more
              </div>
            )}
          </div>
        )}

        {/* Attachment Preview */}
        {data.attachmentUrl && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">
              {messageType === 'image' ? 'Image:' : 
               messageType === 'video' ? 'Video:' : 'File:'}
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded border truncate">
              {data.attachmentUrl}
            </div>
          </div>
        )}

        {/* Generic Template Preview */}
        {data.elements && data.elements.length > 0 && messageType === 'generic_template' && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">Generic Template:</div>
            <div className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-200">
              {data.elements[0].title}
              {data.elements.length > 1 && ` (+${data.elements.length - 1} more)`}
            </div>
          </div>
        )}

        {/* List Template Preview */}
        {data.elements && data.elements.length > 0 && messageType === 'list_template' && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">List Template:</div>
            <div className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-200">
              {data.elements.length} items
            </div>
          </div>
        )}

        {/* New Flexible Elements Preview */}
        {data.elements && data.elements.length > 0 && !['generic_template', 'list_template'].includes(messageType) && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">Elements ({data.elements.length}):</div>
            <div className="space-y-1">
              {data.elements.slice(0, 3).map((element: any, index: number) => {
                const getElementPreview = (el: any) => {
                  switch (el.type) {
                    case 'text':
                      return el.content?.substring(0, 20) + (el.content?.length > 20 ? '...' : '') || 'Text';
                    case 'button':
                      return `🔘 ${el.title || 'Button'}`;
                    case 'quick_reply':
                      return `⚡ ${el.title || 'Quick Reply'}`;
                    case 'image':
                      return `🖼️ ${el.title || 'Image'}`;
                    case 'video':
                      return `🎥 ${el.title || 'Video'}`;
                    case 'file':
                      return `📎 ${el.title || 'File'}`;
                    case 'generic_card':
                      return `📋 ${el.title || 'Card'}`;
                    case 'list_item':
                      return `📝 ${el.title || 'List Item'}`;
                    default:
                      return el.title || el.type;
                  }
                };

                return (
                  <div
                    key={element.id || index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 truncate"
                  >
                    {getElementPreview(element)}
                  </div>
                );
              })}
              {data.elements.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{data.elements.length - 3} more elements
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receipt Template Preview */}
        {messageType === 'receipt_template' && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-medium">Receipt:</div>
            <div className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">
              Order #{data.orderNumber || 'N/A'}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-3 h-3 ${classes.icon.replace('text-', 'bg-').replace('-500', '-400')}`}
      />
    </div>
  );
};

export default MessageNode; 