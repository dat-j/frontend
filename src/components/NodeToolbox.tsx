import React from 'react';
import { 
  MessageCircle, 
  Play, 
  Square, 
  Type,
  MousePointer,
  Image,
  Video,
  FileText,
  List,
  Receipt,
  Grid3X3
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { v4 as uuidv4 } from 'uuid';

const NodeToolbox: React.FC = () => {
  const { addNode, nodes } = useWorkflowStore();

  // Create node factory function
  const createNode = (type: string, data: any) => {
    return {
      id: uuidv4(),
      type: 'messageNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        ...data,
        messageType: type
      },
    };
  };

  // Node types based on Facebook Messenger Platform
  const nodeTypes = [
    {
      id: 'start',
      label: 'Start',
      description: 'Node khởi đầu',
      icon: Play,
      color: 'green',
      data: {
        label: 'Start',
        message: 'Chào mừng! Tôi có thể giúp gì cho bạn?',
        messageType: 'text'
      }
    },
    {
      id: 'text',
      label: 'Text',
      description: 'Tin nhắn văn bản',
      icon: Type,
      color: 'blue',
      data: {
        label: 'Text Message',
        message: 'Nhập tin nhắn của bạn...',
        messageType: 'text'
      }
    },
    {
      id: 'quick_replies',
      label: 'Quick Replies',
      description: 'Câu trả lời nhanh',
      icon: MousePointer,
      color: 'purple',
      data: {
        label: 'Quick Replies',
        message: 'Chọn một tùy chọn:',
        messageType: 'quick_replies',
        quickReplies: [
          { title: 'Tùy chọn 1', payload: 'OPTION_1' },
          { title: 'Tùy chọn 2', payload: 'OPTION_2' }
        ]
      }
    },
    {
      id: 'buttons',
      label: 'Buttons',
      description: 'Nút bấm',
      icon: Grid3X3,
      color: 'indigo',
      data: {
        label: 'Button Template',
        message: 'Chọn một hành động:',
        messageType: 'button_template',
        buttons: [
          { type: 'postback', title: 'Nút 1', payload: 'BUTTON_1' },
          { type: 'postback', title: 'Nút 2', payload: 'BUTTON_2' }
        ]
      }
    },
    {
      id: 'image',
      label: 'Image',
      description: 'Gửi hình ảnh',
      icon: Image,
      color: 'pink',
      data: {
        label: 'Image Message',
        message: '',
        messageType: 'image',
        attachmentUrl: 'https://via.placeholder.com/400x300'
      }
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Gửi video',
      icon: Video,
      color: 'red',
      data: {
        label: 'Video Message',
        message: '',
        messageType: 'video',
        attachmentUrl: ''
      }
    },
    {
      id: 'file',
      label: 'File',
      description: 'Gửi file',
      icon: FileText,
      color: 'gray',
      data: {
        label: 'File Message',
        message: '',
        messageType: 'file',
        attachmentUrl: ''
      }
    },
    {
      id: 'generic',
      label: 'Generic',
      description: 'Generic template',
      icon: Grid3X3,
      color: 'yellow',
      data: {
        label: 'Generic Template',
        message: '',
        messageType: 'generic_template',
        elements: [
          {
            title: 'Tiêu đề',
            subtitle: 'Mô tả ngắn',
            imageUrl: 'https://via.placeholder.com/300x200',
            buttons: [
              { type: 'web_url', title: 'Xem thêm', url: 'https://example.com' }
            ]
          }
        ]
      }
    },
    {
      id: 'list',
      label: 'List',
      description: 'List template',
      icon: List,
      color: 'teal',
      data: {
        label: 'List Template',
        message: '',
        messageType: 'list_template',
        elements: [
          {
            title: 'Mục 1',
            subtitle: 'Mô tả mục 1',
            imageUrl: 'https://via.placeholder.com/300x200'
          },
          {
            title: 'Mục 2',
            subtitle: 'Mô tả mục 2',
            imageUrl: 'https://via.placeholder.com/300x200'
          }
        ]
      }
    },
    {
      id: 'receipt',
      label: 'Receipt',
      description: 'Receipt template',
      icon: Receipt,
      color: 'orange',
      data: {
        label: 'Receipt Template',
        message: '',
        messageType: 'receipt_template',
        recipientName: 'Khách hàng',
        orderNumber: '12345',
        currency: 'VND',
        paymentMethod: 'Visa',
        summary: {
          subtotal: 100000,
          shippingCost: 20000,
          totalTax: 12000,
          totalCost: 132000
        },
        elements: [
          {
            title: 'Sản phẩm 1',
            subtitle: 'Mô tả sản phẩm',
            quantity: 1,
            price: 100000
          }
        ]
      }
    },
    {
      id: 'end',
      label: 'End',
      description: 'Node kết thúc',
      icon: Square,
      color: 'red',
      data: {
        label: 'End',
        message: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
        messageType: 'text'
      }
    },
    {
      id: 'flexible',
      label: 'Flexible',
      description: 'Node linh hoạt với elements',
      icon: Grid3X3,
      color: 'emerald',
      data: {
        label: 'Flexible Node',
        message: 'Node có thể chứa nhiều loại elements khác nhau',
        messageType: 'text',
        elements: []
      }
    }
  ];

  const handleAddNode = (nodeType: any) => {
    const newNode = createNode(nodeType.id, nodeType.data);
    addNode(newNode);
  };

  return (
    <div className="p-4">
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => {
          const IconComponent = nodeType.icon;
          const colorClasses = {
            green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
            blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
            purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
            indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700',
            pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700',
            red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
            gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700',
            yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700',
            teal: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700',
            orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
            emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700',
          };

          return (
            <button
              key={nodeType.id}
              onClick={() => handleAddNode(nodeType)}
              className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors btn-animate card-hover ${
                colorClasses[nodeType.color as keyof typeof colorClasses]
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{nodeType.label}</div>
                <div className="text-xs opacity-75">{nodeType.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NodeToolbox; 