import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Type,
  Image,
  Video,
  FileText,
  MousePointer,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';

interface ElementData {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'button' | 'quick_reply' | 'generic_card' | 'list_item';
  content?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  fileUrl?: string;
  buttonType?: 'postback' | 'web_url' | 'phone_number';
  payload?: string;
  url?: string;
  quickReplyPayload?: string;
  buttons?: Array<{
    type: 'postback' | 'web_url' | 'phone_number';
    title: string;
    payload?: string;
    url?: string;
  }>;
}

interface ElementEditorProps {
  elements: ElementData[];
  onChange: (elements: ElementData[]) => void;
}

const ElementEditor: React.FC<ElementEditorProps> = ({ elements = [], onChange }) => {
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  // Element type configurations
  const elementTypes = [
    { value: 'text', label: 'Text', icon: Type, description: 'Tin nhắn văn bản' },
    { value: 'image', label: 'Image', icon: Image, description: 'Hình ảnh' },
    { value: 'video', label: 'Video', icon: Video, description: 'Video' },
    { value: 'file', label: 'File', icon: FileText, description: 'Tập tin đính kèm' },
    { value: 'button', label: 'Button', icon: Grid3X3, description: 'Nút bấm' },
    { value: 'quick_reply', label: 'Quick Reply', icon: MousePointer, description: 'Trả lời nhanh' },
    { value: 'generic_card', label: 'Generic Card', icon: Grid3X3, description: 'Thẻ tổng quát' },
    { value: 'list_item', label: 'List Item', icon: List, description: 'Mục danh sách' }
  ];

  const generateElementId = () => {
    return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const addElement = (type: ElementData['type']) => {
    const newElement: ElementData = {
      id: generateElementId(),
      type,
      ...(type === 'text' && { content: '' }),
      ...(type === 'button' && { title: '', buttonType: 'postback', payload: '' }),
      ...(type === 'quick_reply' && { title: '', quickReplyPayload: '' }),
      ...(type === 'image' && { imageUrl: '', title: '' }),
      ...(type === 'video' && { fileUrl: '', title: '' }),
      ...(type === 'file' && { fileUrl: '', title: '' }),
      ...(type === 'generic_card' && { title: '', subtitle: '', imageUrl: '', buttons: [] }),
      ...(type === 'list_item' && { title: '', subtitle: '' })
    };

    const updatedElements = [...elements, newElement];
    onChange(updatedElements);
    
    // Auto expand new element
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      newSet.add(newElement.id);
      return newSet;
    });
  };

  const updateElement = (elementId: string, updates: Partial<ElementData>) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    onChange(updatedElements);
  };

  const removeElement = (elementId: string) => {
    const updatedElements = elements.filter(element => element.id !== elementId);
    onChange(updatedElements);
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      newSet.delete(elementId);
      return newSet;
    });
  };

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= elements.length) return;

    const updatedElements = [...elements];
    [updatedElements[currentIndex], updatedElements[newIndex]] = [updatedElements[newIndex], updatedElements[currentIndex]];
    onChange(updatedElements);
  };

  const toggleElementExpanded = (elementId: string) => {
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  };

  const getElementIcon = (type: string) => {
    const elementType = elementTypes.find(et => et.value === type);
    return elementType ? elementType.icon : Type;
  };

  const getElementTitle = (element: ElementData) => {
    switch (element.type) {
      case 'text':
        return element.content?.substring(0, 30) + (element.content && element.content.length > 30 ? '...' : '') || 'Text Element';
      case 'button':
        return element.title || 'Button Element';
      case 'quick_reply':
        return element.title || 'Quick Reply Element';
      case 'image':
      case 'video':
      case 'file':
        return element.title || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element`;
      case 'generic_card':
      case 'list_item':
        return element.title || `${element.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Element`;
      default:
        return 'Element';
    }
  };

  // Element specific editors
  const renderTextEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung
        </label>
        <textarea
          value={element.content || ''}
          onChange={(e) => updateElement(element.id, { content: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Nhập nội dung văn bản..."
        />
      </div>
    </div>
  );

  const renderImageEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề hình ảnh..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL hình ảnh
        </label>
        <input
          type="url"
          value={element.imageUrl || ''}
          onChange={(e) => updateElement(element.id, { imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );

  const renderVideoEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề (tùy chọn)
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề video..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL video
        </label>
        <input
          type="url"
          value={element.fileUrl || ''}
          onChange={(e) => updateElement(element.id, { fileUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/video.mp4"
        />
      </div>
    </div>
  );

  const renderFileEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên file
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tên file..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL file
        </label>
        <input
          type="url"
          value={element.fileUrl || ''}
          onChange={(e) => updateElement(element.id, { fileUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/file.pdf"
        />
      </div>
    </div>
  );

  const renderButtonEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề nút
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề nút..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại nút
        </label>
        <select
          value={element.buttonType || 'postback'}
          onChange={(e) => updateElement(element.id, { buttonType: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="postback">Postback</option>
          <option value="web_url">Web URL</option>
          <option value="phone_number">Phone Number</option>
        </select>
      </div>
      {element.buttonType === 'postback' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payload
          </label>
          <input
            type="text"
            value={element.payload || ''}
            onChange={(e) => updateElement(element.id, { payload: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Payload..."
          />
        </div>
      )}
      {element.buttonType === 'web_url' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            value={element.url || ''}
            onChange={(e) => updateElement(element.id, { url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="https://example.com"
          />
        </div>
      )}
    </div>
  );

  const renderQuickReplyEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề quick reply..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payload
        </label>
        <input
          type="text"
          value={element.quickReplyPayload || ''}
          onChange={(e) => updateElement(element.id, { quickReplyPayload: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Payload..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon URL (tùy chọn)
        </label>
        <input
          type="url"
          value={element.imageUrl || ''}
          onChange={(e) => updateElement(element.id, { imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/icon.png"
        />
      </div>
    </div>
  );

  const renderGenericCardEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề thẻ..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phụ đề (tùy chọn)
        </label>
        <input
          type="text"
          value={element.subtitle || ''}
          onChange={(e) => updateElement(element.id, { subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Phụ đề..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL hình ảnh (tùy chọn)
        </label>
        <input
          type="url"
          value={element.imageUrl || ''}
          onChange={(e) => updateElement(element.id, { imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );

  const renderListItemEditor = (element: ElementData) => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu đề
        </label>
        <input
          type="text"
          value={element.title || ''}
          onChange={(e) => updateElement(element.id, { title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Tiêu đề mục..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả (tùy chọn)
        </label>
        <textarea
          value={element.subtitle || ''}
          onChange={(e) => updateElement(element.id, { subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Mô tả mục..."
        />
      </div>
    </div>
  );

  const renderElementEditor = (element: ElementData) => {
    switch (element.type) {
      case 'text':
        return renderTextEditor(element);
      case 'image':
        return renderImageEditor(element);
      case 'video':
        return renderVideoEditor(element);
      case 'file':
        return renderFileEditor(element);
      case 'button':
        return renderButtonEditor(element);
      case 'quick_reply':
        return renderQuickReplyEditor(element);
      case 'generic_card':
        return renderGenericCardEditor(element);
      case 'list_item':
        return renderListItemEditor(element);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Elements</h3>
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm Element
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <div className="p-2">
              {elementTypes.map((elementType) => {
                const IconComponent = elementType.icon;
                return (
                  <button
                    key={elementType.value}
                    onClick={() => addElement(elementType.value as any)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                  >
                    <IconComponent className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{elementType.label}</div>
                      <div className="text-xs text-gray-500">{elementType.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Elements List */}
      {elements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có element nào. Nhấn "Thêm Element" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {elements.map((element, index) => {
            const IconComponent = getElementIcon(element.type);
            const isExpanded = expandedElements.has(element.id);
            
            return (
              <div key={element.id} className="border border-gray-200 rounded-lg">
                {/* Element Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{getElementTitle(element)}</div>
                      <div className="text-xs text-gray-500 capitalize">{element.type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Move buttons */}
                    <button
                      onClick={() => moveElement(element.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveElement(element.id, 'down')}
                      disabled={index === elements.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Expand/Collapse button */}
                    <button
                      onClick={() => toggleElementExpanded(element.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={isExpanded ? "Thu gọn" : "Mở rộng"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => removeElement(element.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Xóa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Element Editor */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    {renderElementEditor(element)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ElementEditor; 