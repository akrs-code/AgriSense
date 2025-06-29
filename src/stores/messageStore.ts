import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  productId?: string;
  productName?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

interface MessageState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversation: string | null;
  isLoading: boolean;
  totalUnreadCount: number;
  sendMessage: (conversationId: string, content: string, receiverId: string) => Promise<void>;
  createConversation: (participantId: string, productId?: string, productName?: string) => Promise<string>;
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  getConversationsByUser: (userId: string) => Conversation[];
  getUnreadCount: (userId: string) => number;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['buyer-1', 'seller-1'],
    productId: '1',
    productName: 'Premium Rice',
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'conv-2',
    participants: ['buyer-1', 'seller-1'],
    productId: '2',
    productName: 'Sweet Corn',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  {
    id: 'conv-3',
    participants: ['admin-1', 'seller-1'],
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 3600000) // 1 hour ago
  }
];

const mockMessages: { [key: string]: Message[] } = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'Hi! I\'m interested in your premium rice. Is it still available?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'seller-1',
      receiverId: 'buyer-1',
      content: 'Hello! Yes, we have premium rice available. How much do you need?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3000000)
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'I need about 50kg. What\'s the price and can you deliver to Quezon City?',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000)
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'seller-1',
      receiverId: 'buyer-1',
      content: 'Yes, we have 500kg available. Price is ₱45/kg. We can deliver to Quezon City for an additional ₱200.',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 300000)
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'seller-1',
      receiverId: 'buyer-1',
      content: 'When do you need the delivery?',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 60000)
    }
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'buyer-1',
      receiverId: 'seller-1',
      content: 'Thank you for the sweet corn! Quality was excellent.',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000)
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'seller-1',
      receiverId: 'buyer-1',
      content: 'Thank you for your order! We appreciate your business.',
      type: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 1200000)
    }
  ],
  'conv-3': [
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'admin-1',
      receiverId: 'seller-1',
      content: 'Your verification documents have been approved. Welcome to AgriSense!',
      type: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000)
    }
  ]
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: mockConversations,
      messages: mockMessages,
      activeConversation: null,
      isLoading: false,
      totalUnreadCount: 0,

      sendMessage: async (conversationId, content, receiverId) => {
        const { conversations, messages } = get();
        
        // Get current user from auth store (in real app)
        const currentUser = 'buyer-1'; // This would come from auth store

        const newMessage: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          conversationId,
          senderId: currentUser,
          receiverId,
          content,
          type: 'text',
          isRead: false,
          createdAt: new Date()
        };

        // Update messages
        const updatedMessages = {
          ...messages,
          [conversationId]: [...(messages[conversationId] || []), newMessage]
        };

        // Update conversation
        const updatedConversations = conversations.map(conv =>
          conv.id === conversationId
            ? { 
                ...conv, 
                lastMessage: newMessage, 
                updatedAt: new Date(),
                unreadCount: conv.participants.includes(receiverId) ? conv.unreadCount + 1 : conv.unreadCount
              }
            : conv
        );

        set({
          messages: updatedMessages,
          conversations: updatedConversations
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
      },

      createConversation: async (participantId, productId, productName) => {
        const { conversations } = get();
        const currentUser = 'buyer-1'; // This would come from auth store

        // Check if conversation already exists
        const existingConv = conversations.find(conv =>
          conv.participants.includes(currentUser) && 
          conv.participants.includes(participantId) &&
          (!productId || conv.productId === productId)
        );

        if (existingConv) {
          return existingConv.id;
        }

        const newConversation: Conversation = {
          id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          participants: [currentUser, participantId],
          productId,
          productName,
          unreadCount: 0,
          updatedAt: new Date()
        };

        set(state => ({
          conversations: [...state.conversations, newConversation]
        }));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        return newConversation.id;
      },

      fetchConversations: async (userId) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update last messages for conversations
        const { conversations, messages } = get();
        const updatedConversations = conversations.map(conv => {
          const convMessages = messages[conv.id] || [];
          const lastMessage = convMessages[convMessages.length - 1];
          const unreadCount = convMessages.filter(msg => 
            !msg.isRead && msg.receiverId === userId
          ).length;
          
          return {
            ...conv,
            lastMessage,
            unreadCount
          };
        });

        const totalUnread = updatedConversations
          .filter(conv => conv.participants.includes(userId))
          .reduce((sum, conv) => sum + conv.unreadCount, 0);

        set({ 
          conversations: updatedConversations,
          totalUnreadCount: totalUnread,
          isLoading: false 
        });
      },

      fetchMessages: async (conversationId) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ isLoading: false });
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversation: conversationId });
      },

      markAsRead: async (conversationId, userId) => {
        const { messages, conversations } = get();
        
        // Mark messages as read
        const updatedMessages = {
          ...messages,
          [conversationId]: (messages[conversationId] || []).map(msg => 
            msg.receiverId === userId ? { ...msg, isRead: true } : msg
          )
        };

        // Update conversation unread count
        const updatedConversations = conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        );

        const totalUnread = updatedConversations
          .filter(conv => conv.participants.includes(userId))
          .reduce((sum, conv) => sum + conv.unreadCount, 0);

        set({
          messages: updatedMessages,
          conversations: updatedConversations,
          totalUnreadCount: totalUnread
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
      },

      markAllAsRead: async (userId) => {
        const { messages, conversations } = get();
        
        // Mark all messages as read for this user
        const updatedMessages = { ...messages };
        Object.keys(updatedMessages).forEach(convId => {
          updatedMessages[convId] = updatedMessages[convId].map(msg =>
            msg.receiverId === userId ? { ...msg, isRead: true } : msg
          );
        });

        // Update all conversation unread counts
        const updatedConversations = conversations.map(conv =>
          conv.participants.includes(userId)
            ? { ...conv, unreadCount: 0 }
            : conv
        );

        set({
          messages: updatedMessages,
          conversations: updatedConversations,
          totalUnreadCount: 0
        });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
      },

      getConversationsByUser: (userId) => {
        const { conversations } = get();
        return conversations
          .filter(conv => conv.participants.includes(userId))
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      },

      getUnreadCount: (userId) => {
        const { conversations } = get();
        return conversations
          .filter(conv => conv.participants.includes(userId))
          .reduce((sum, conv) => sum + conv.unreadCount, 0);
      }
    }),
    {
      name: 'agrisense-messages',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        totalUnreadCount: state.totalUnreadCount
      })
    }
  )
);