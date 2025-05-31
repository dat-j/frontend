import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, User, Bot, ArrowRight, ArrowDown } from 'lucide-react';
import { chatService, ChatMessage, ChatResponse } from '../services/chatService';

interface ChatPreviewProps {
  workflowId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ workflowId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const facebookUserId = 'preview-user-123'; // Fixed user ID for preview

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessageToState = (
    response: ChatResponse | string, 
    isFromUser: boolean, 
    messageType?: 'text' | 'attachment' | 'quick_replies',
    metadata?: any
  ) => {
    let text = '';
    let newMessageType = messageType || 'text';
    
    if (typeof response === 'string') {
      text = response;
    } else {
      // Handle Facebook Messenger Platform response
      text = response.text || response.message || '';
      newMessageType = response.messageType;
      metadata = {
        ...metadata,
        attachment: response.attachment,
        quick_replies: response.quick_replies,
        buttons: response.buttons,
        ...response.metadata,
      };
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: sessionId || '',
      facebookUserId,
      messageText: text,
      messageType: newMessageType as any,
      isFromUser,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (message: string, isButtonClick = false, buttonText?: string) => {
    if (!message.trim() && !isButtonClick) return;

    setIsLoading(true);
    
    try {
      // Add user message to state with button info if it's a button click
      const userMessageMetadata = isButtonClick ? {
        buttonPayload: message,
        buttonTitle: buttonText,
      } : {};

      const userMessage = addMessageToState(
        isButtonClick ? buttonText || message : message, 
        true, 
        isButtonClick ? 'attachment' : 'text',
        userMessageMetadata
      );

      // Send to backend
      const response: ChatResponse = await chatService.sendMessage({
        facebookUserId,
        message,
        workflowId,
      });

      // Update session ID if new
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }

      // Add bot response to state
      addMessageToState(response, false);

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessageToState('Lỗi khi gửi tin nhắn. Vui lòng thử lại.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (payload: string, title: string) => {
    sendMessage(payload, true, title);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const resetChat = async () => {
    try {
      await chatService.resetSession(facebookUserId);
      setMessages([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-500 text-white rounded-t-lg">
          <h3 className="text-lg font-semibold">Chat Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Bắt đầu cuộc trò chuyện với bot...</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isButtonMessage = message.isFromUser && message.metadata.buttonPayload;
              const botTriggeredByButton = !message.isFromUser && message.metadata.triggeredByButton;
              
              return (
                <div key={message.id} className="space-y-2">
                  {/* Show connection indicator for button-triggered responses */}
                  {botTriggeredByButton && (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <ArrowDown className="w-3 h-3" />
                        <span>Response từ button: "{botTriggeredByButton.title}"</span>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.isFromUser 
                        ? isButtonMessage 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.isFromUser ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.isFromUser ? 'You' : 'Bot'}
                        </span>
                        {isButtonMessage && (
                          <span className="text-xs bg-purple-600 px-1 rounded">Button</span>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        {message.messageText}
                        
                        {/* Show button payload info for button clicks */}
                        {isButtonMessage && (
                          <div className="text-xs opacity-75 mt-1 bg-purple-600 bg-opacity-20 p-1 rounded">
                            Payload: {message.metadata.buttonPayload}
                          </div>
                        )}
                      </div>

                      {/* Render Attachments */}
                      {!message.isFromUser && message.metadata.attachment && (
                        <div className="mt-2">
                          {renderAttachment(message.metadata.attachment, handleButtonClick, isLoading)}
                        </div>
                      )}

                      {/* Render Quick Replies */}
                      {!message.isFromUser && message.metadata.quick_replies && message.metadata.quick_replies.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs opacity-75 mb-1">Quick Replies:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.quick_replies.map((qr: any, qrIndex: number) => (
                              <button
                                key={qrIndex}
                                onClick={() => handleButtonClick(qr.payload, qr.title)}
                                className="text-xs bg-blue-500 text-white rounded-full px-3 py-1 hover:bg-blue-600 transition-colors"
                                disabled={isLoading}
                              >
                                {qr.image_url && (
                                  <img src={qr.image_url} alt="" className="w-3 h-3 inline-block mr-1 rounded-full" />
                                )}
                                {qr.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Legacy Buttons for bot messages */}
                      {!message.isFromUser && message.metadata.buttons && message.metadata.buttons.length > 0 && !message.metadata.attachment && !message.metadata.quick_replies && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs opacity-75 mb-1">Choose an option:</div>
                          {message.metadata.buttons.map((button: any, btnIndex: number) => (
                            <button
                              key={btnIndex}
                              onClick={() => handleButtonClick(button.payload, button.title)}
                              className="block w-full text-left text-xs bg-white text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                              disabled={isLoading}
                            >
                              <div className="font-medium">{button.title}</div>
                              <div className="text-gray-500">→ {button.payload}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Text message</span>
              <div className="w-3 h-3 bg-purple-500 rounded ml-4"></div>
              <span>Button click</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;

// Helper function to render different attachment types
function renderAttachment(attachment: any, handleButtonClick: (payload: string, title: string) => void, isLoading: boolean) {
  if (!attachment) return null;

  switch (attachment.type) {
    case 'image':
      return (
        <div className="mt-2">
          <img 
            src={attachment.payload?.url} 
            alt="Attached image" 
            className="max-w-full h-auto rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );

    case 'video':
      return (
        <div className="mt-2">
          <video 
            src={attachment.payload?.url} 
            controls 
            className="max-w-full h-auto rounded-lg border"
          />
        </div>
      );

    case 'file':
      return (
        <div className="mt-2">
          <a 
            href={attachment.payload?.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            📎 Download File
          </a>
        </div>
      );

    case 'template':
      return renderTemplate(attachment.payload, handleButtonClick, isLoading);

    default:
      return null;
  }
}

// Helper function to render different template types
function renderTemplate(payload: any, handleButtonClick: (payload: string, title: string) => void, isLoading: boolean) {
  if (!payload) return null;

  switch (payload.template_type) {
    case 'button':
      return (
        <div className="mt-2 space-y-1">
          <div className="text-sm font-medium">{payload.text}</div>
          <div className="space-y-1">
            {payload.buttons?.map((button: any, btnIndex: number) => (
              <button
                key={btnIndex}
                onClick={() => handleButtonClick(button.payload || button.url || '', button.title)}
                className="block w-full text-left text-xs bg-white text-blue-500 border border-blue-500 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium">{button.title}</div>
                <div className="text-gray-500">
                  {button.type === 'web_url' ? `🔗 ${button.url}` : `→ ${button.payload}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'generic':
      return (
        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
          {payload.elements?.map((element: any, elemIndex: number) => (
            <div key={elemIndex} className="border rounded-lg p-2 bg-white">
              {element.image_url && (
                <img 
                  src={element.image_url} 
                  alt={element.title} 
                  className="w-full h-20 object-cover rounded mb-2"
                />
              )}
              <div className="text-sm font-medium">{element.title}</div>
              {element.subtitle && (
                <div className="text-xs text-gray-600 mt-1">{element.subtitle}</div>
              )}
              {element.buttons && element.buttons.length > 0 && (
                <div className="mt-2 space-y-1">
                  {element.buttons.map((button: any, btnIndex: number) => (
                    <button
                      key={btnIndex}
                      onClick={() => handleButtonClick(button.payload || button.url || '', button.title)}
                      className="block w-full text-left text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600 transition-colors"
                      disabled={isLoading}
                    >
                      {button.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'list':
      return (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {payload.elements?.map((element: any, elemIndex: number) => (
            <div key={elemIndex} className="flex items-start gap-2 p-2 border rounded">
              {element.image_url && (
                <img 
                  src={element.image_url} 
                  alt={element.title} 
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{element.title}</div>
                {element.subtitle && (
                  <div className="text-xs text-gray-600">{element.subtitle}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );

    case 'receipt':
      return (
        <div className="mt-2 border rounded-lg p-3 bg-white text-sm">
          <div className="font-medium text-center mb-2">🧾 Receipt</div>
          <div className="space-y-1 text-xs">
            <div><strong>Recipient:</strong> {payload.recipient_name}</div>
            <div><strong>Order #:</strong> {payload.order_number}</div>
            <div><strong>Payment:</strong> {payload.payment_method}</div>
            {payload.summary && (
              <div className="mt-2 pt-2 border-t">
                <div>Subtotal: {payload.summary.subtotal} {payload.currency}</div>
                <div>Shipping: {payload.summary.shipping_cost} {payload.currency}</div>
                <div>Tax: {payload.summary.total_tax} {payload.currency}</div>
                <div className="font-medium">Total: {payload.summary.total_cost} {payload.currency}</div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          Unknown template type: {payload.template_type}
        </div>
      );
  }
} 