import { create } from 'zustand';
import { Message, Conversation } from '../types';

interface MessageState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversation: string | null;
  isLoading: boolean;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, productId?: string) => Promise<string>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['buyer-1', 'seller-1'],
    productId: '1',
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'Hi! Is this rice still available?',
      type: 'text',
      isRead: false,
      createdAt: new Date()
    },
    updatedAt: new Date()
  }
];

const mockMessages: { [key: string]: Message[] } = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'Hi! Is this rice still available?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'seller-1',
      receiverId: 'buyer-1',
      content: 'Yes, we have 500kg in stock. How much do you need?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3000000)
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'I need about 50kg. Can you deliver to Quezon City?',
      type: 'text',
      isRead: false,
      createdAt: new Date()
    }
  ]
};

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: mockConversations,
  messages: mockMessages,
  activeConversation: null,
  isLoading: false,

  sendMessage: async (conversationId, content, receiverId) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: 'current-user-id', // This would come from auth store
      receiverId,
      content,
      type: 'text',
      isRead: false,
      createdAt: new Date()
    };

    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), newMessage]
      },
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      )
    }));
  },

  createConversation: async (participantId, productId) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: ['current-user-id', participantId],
      productId,
      updatedAt: new Date()
    };

    set(state => ({
      conversations: [...state.conversations, newConversation]
    }));

    return newConversation.id;
  },

  fetchConversations: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ isLoading: false });
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
  },

  markAsRead: async (conversationId) => {
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map(msg => ({
          ...msg,
          isRead: true
        })) || []
      }
    }));
  }
}));