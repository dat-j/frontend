import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  id: string;
  sessionId: string;
  facebookUserId: string;
  messageText: string;
  messageType: 'text' | 'button' | 'quick_reply' | 'attachment' | 'quick_replies';
  isFromUser: boolean;
  metadata: {
    // Legacy support
    buttons?: Array<{
      title: string;
      payload: string;
      type: 'postback';
    }>;
    nodeId?: string;
    buttonPayload?: string; // For user messages from button clicks
    buttonTitle?: string; // For user messages from button clicks
    triggeredByButton?: { // For bot responses triggered by buttons
      payload: string;
      title: string;
      fromNodeId?: string;
    };
    
    // New Facebook Messenger Platform support
    attachment?: FacebookMessengerAttachment;
    quick_replies?: FacebookMessengerQuickReply[];
    nodeType?: string;
    triggeredByQuickReply?: {
      payload: string;
      title: string;
      fromNodeId?: string;
    };
    quickReplyPayload?: string;
    quickReplyTitle?: string;
  };
  createdAt: string;
}

export interface FacebookMessengerElement {
  title?: string;
  subtitle?: string;
  image_url?: string;
  default_action?: {
    type: 'web_url';
    url: string;
    messenger_extensions?: boolean;
    webview_height_ratio?: 'compact' | 'tall' | 'full';
  };
  buttons?: Array<{
    type: 'postback' | 'web_url' | 'phone_number';
    title: string;
    payload?: string;
    url?: string;
  }>;
}

export interface FacebookMessengerAttachment {
  type: 'template' | 'image' | 'video' | 'audio' | 'file';
  payload?: {
    template_type?: 'generic' | 'button' | 'list' | 'receipt';
    text?: string;
    elements?: FacebookMessengerElement[];
    buttons?: Array<{
      type: 'postback' | 'web_url' | 'phone_number';
      title: string;
      payload?: string;
      url?: string;
    }>;
    // Receipt template specific
    recipient_name?: string;
    order_number?: string;
    currency?: string;
    payment_method?: string;
    summary?: {
      subtotal: number;
      shipping_cost: number;
      total_tax: number;
      total_cost: number;
    };
    // Media attachments
    url?: string;
    is_reusable?: boolean;
  };
}

export interface FacebookMessengerQuickReply {
  content_type: 'text' | 'user_phone_number' | 'user_email';
  title?: string;
  payload?: string;
  image_url?: string;
}

export interface ChatResponse {
  // Basic message data (legacy)
  message?: string;
  messageType: 'text' | 'attachment' | 'quick_replies';
  
  // Facebook Messenger Platform format
  text?: string;
  attachment?: FacebookMessengerAttachment;
  quick_replies?: FacebookMessengerQuickReply[];
  
  // Legacy support
  buttons?: Array<{
    title: string;
    payload: string;
    type: 'postback';
  }>;
  
  // Session info
  sessionId: string;
  workflowEnded: boolean;
  
  // Metadata
  metadata?: {
    nodeId?: string;
    nodeType?: string;
    triggeredByButton?: {
      payload: string;
      title: string;
      fromNodeId?: string;
    };
  };
}

export interface ProcessMessageDto {
  facebookUserId: string;
  message: string;
  workflowId?: string;
}

export const chatService = {
  // Send message to chatbot
  async sendMessage(data: ProcessMessageDto): Promise<ChatResponse> {
    const response = await api.post('/chat/message', data);
    return response.data;
  },

  // Get chat history for a user
  async getChatHistory(facebookUserId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/history/${facebookUserId}?limit=${limit}`);
    return response.data;
  },

  // Get session history
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/session/${sessionId}/history`);
    return response.data;
  },

  // End session
  async endSession(sessionId: string): Promise<void> {
    await api.post(`/chat/session/${sessionId}/end`);
  },

  // Reset user session
  async resetSession(facebookUserId: string): Promise<void> {
    await api.post(`/chat/reset/${facebookUserId}`);
  },
}; 