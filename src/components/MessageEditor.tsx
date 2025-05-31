import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  X, 
  Type,
  MousePointer,
  Image,
  Video,
  FileText,
  List,
  Receipt,
  Grid3X3,
  Save,
  Eye
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import ElementEditor from './ElementEditor';

const MessageEditor: React.FC = () => {
  const { selectedNode, updateNode, deleteNode, setSelectedNode } = useWorkflowStore();
  
  const [nodeData, setNodeData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setNodeData({ ...selectedNode.data });
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode) {
      updateNode(selectedNode.id, nodeData);
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
      setSelectedNode(null);
    }
  };

  const updateData = (key: string, value: any) => {
    setNodeData({ ...nodeData, [key]: value });
  };

  const updateArrayItem = (arrayKey: string, index: number, field: string, value: any) => {
    const array = [...(nodeData[arrayKey] || [])];
    array[index] = { ...array[index], [field]: value };
    updateData(arrayKey, array);
  };

  const addArrayItem = (arrayKey: string, defaultItem: any) => {
    const array = [...(nodeData[arrayKey] || [])];
    array.push(defaultItem);
    updateData(arrayKey, array);
  };

  const removeArrayItem = (arrayKey: string, index: number) => {
    const array = [...(nodeData[arrayKey] || [])];
    array.splice(index, 1);
    updateData(arrayKey, array);
  };

  if (!selectedNode) {
    return null;
  }

  const messageType = nodeData.messageType || 'text';

  // Get icon for message type
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
    const IconComponent = icons[type] || Type;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderTextEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tin nhắn
        </label>
        <textarea
          value={nodeData.message || ''}
          onChange={(e) => updateData('message', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập nội dung tin nhắn..."
        />
      </div>
    </div>
  );

  const renderQuickRepliesEditor = () => (
    <div className="space-y-4">
      {renderTextEditor()}
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Quick Replies (tối đa 13)
          </label>
          {(nodeData.quickReplies?.length || 0) < 13 && (
            <button
              onClick={() => addArrayItem('quickReplies', { title: '', payload: '' })}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 btn-animate"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(nodeData.quickReplies || []).map((reply: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Quick Reply {index + 1}
                </span>
                <button
                  onClick={() => removeArrayItem('quickReplies', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={reply.title || ''}
                  onChange={(e) => updateArrayItem('quickReplies', index, 'title', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tiêu đề"
                />
                <input
                  type="text"
                  value={reply.payload || ''}
                  onChange={(e) => updateArrayItem('quickReplies', index, 'payload', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Payload"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderButtonTemplateEditor = () => (
    <div className="space-y-4">
      {renderTextEditor()}
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Buttons (tối đa 3)
          </label>
          {(nodeData.buttons?.length || 0) < 3 && (
            <button
              onClick={() => addArrayItem('buttons', { type: 'postback', title: '', payload: '' })}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 btn-animate"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(nodeData.buttons || []).map((button: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Button {index + 1}
                </span>
                <button
                  onClick={() => removeArrayItem('buttons', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <select
                  value={button.type || 'postback'}
                  onChange={(e) => updateArrayItem('buttons', index, 'type', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="postback">Postback</option>
                  <option value="web_url">Web URL</option>
                  <option value="phone_number">Phone Number</option>
                </select>
                <input
                  type="text"
                  value={button.title || ''}
                  onChange={(e) => updateArrayItem('buttons', index, 'title', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tiêu đề button"
                />
                {button.type === 'web_url' ? (
                  <input
                    type="url"
                    value={button.url || ''}
                    onChange={(e) => updateArrayItem('buttons', index, 'url', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="URL"
                  />
                ) : button.type === 'phone_number' ? (
                  <input
                    type="tel"
                    value={button.payload || ''}
                    onChange={(e) => updateArrayItem('buttons', index, 'payload', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Số điện thoại"
                  />
                ) : (
                  <input
                    type="text"
                    value={button.payload || ''}
                    onChange={(e) => updateArrayItem('buttons', index, 'payload', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Payload"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAttachmentEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL {messageType === 'image' ? 'Hình ảnh' : messageType === 'video' ? 'Video' : 'File'}
        </label>
        <input
          type="url"
          value={nodeData.attachmentUrl || ''}
          onChange={(e) => updateData('attachmentUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Nhập URL ${messageType}...`}
        />
      </div>
      
      {nodeData.attachmentUrl && messageType === 'image' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <img 
            src={nodeData.attachmentUrl} 
            alt="Preview" 
            className="w-full h-32 object-cover rounded-md border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );

  const renderGenericTemplateEditor = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Elements (tối đa 10)
          </label>
          {(nodeData.elements?.length || 0) < 10 && (
            <button
              onClick={() => addArrayItem('elements', { 
                title: '', 
                subtitle: '', 
                imageUrl: '', 
                buttons: [] 
              })}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(nodeData.elements || []).map((element: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Element {index + 1}
                </span>
                <button
                  onClick={() => removeArrayItem('elements', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={element.title || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'title', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tiêu đề"
                />
                <input
                  type="text"
                  value={element.subtitle || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'subtitle', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Mô tả"
                />
                <input
                  type="url"
                  value={element.imageUrl || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'imageUrl', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="URL hình ảnh"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListTemplateEditor = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            List Items (2-4 items)
          </label>
          {(nodeData.elements?.length || 0) < 4 && (
            <button
              onClick={() => addArrayItem('elements', { 
                title: '', 
                subtitle: '', 
                imageUrl: '' 
              })}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <Plus className="w-3 h-3" />
              Thêm
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(nodeData.elements || []).map((element: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Item {index + 1}
                </span>
                <button
                  onClick={() => removeArrayItem('elements', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={element.title || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'title', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tiêu đề"
                />
                <input
                  type="text"
                  value={element.subtitle || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'subtitle', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Mô tả"
                />
                <input
                  type="url"
                  value={element.imageUrl || ''}
                  onChange={(e) => updateArrayItem('elements', index, 'imageUrl', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="URL hình ảnh"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReceiptTemplateEditor = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khách hàng
          </label>
          <input
            type="text"
            value={nodeData.recipientName || ''}
            onChange={(e) => updateData('recipientName', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Tên khách hàng"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số đơn hàng
          </label>
          <input
            type="text"
            value={nodeData.orderNumber || ''}
            onChange={(e) => updateData('orderNumber', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Số đơn hàng"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiền tệ
          </label>
          <input
            type="text"
            value={nodeData.currency || 'VND'}
            onChange={(e) => updateData('currency', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phương thức thanh toán
          </label>
          <input
            type="text"
            value={nodeData.paymentMethod || ''}
            onChange={(e) => updateData('paymentMethod', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Visa, Cash, ..."
          />
        </div>
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (messageType) {
      case 'text':
        return renderTextEditor();
      case 'quick_replies':
        return renderQuickRepliesEditor();
      case 'button_template':
        return renderButtonTemplateEditor();
      case 'image':
      case 'video':
      case 'file':
        return renderAttachmentEditor();
      case 'generic_template':
        return renderGenericTemplateEditor();
      case 'list_template':
        return renderListTemplateEditor();
      case 'receipt_template':
        return renderReceiptTemplateEditor();
      default:
        return renderTextEditor();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Editor Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên node
            </label>
            <input
              type="text"
              value={nodeData.label || ''}
              onChange={(e) => updateData('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tên hiển thị của node"
            />
          </div>

          {/* Message Type Display */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            {getMessageTypeIcon(messageType)}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {messageType.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-xs text-gray-600">Loại message hiện tại</div>
            </div>
          </div>

          {/* Message Editor */}
          {renderEditor()}

          {/* Element Editor */}
          <div className="border-t border-gray-200 pt-4">
            <ElementEditor
              elements={nodeData.elements || []}
              onChange={(elements) => updateData('elements', elements)}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors btn-animate"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors btn-animate"
            title="Preview message"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 px-4 rounded-md hover:bg-red-200 transition-colors btn-animate"
            title="Xóa node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor; 