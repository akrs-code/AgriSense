// frontend/stores/messageStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, useAuthStore } from './authStore'; // Assuming authStore is in the same directory or adjust path

// Import socket.io-client
import { io, Socket } from 'socket.io-client';

// Import the DTOs from your message.types.ts (frontend DTOs)
import {
  MessageDTO,
  ConversationDTO,
  SendMessageRequestDTO,
  CreateConversationRequestDTO,
  MarkMessagesReadRequestDTO,
  FetchConversationsResponseDTO,
  FetchMessagesResponseDTO,
  ConversationCreatedResponseDTO,
} from '../types/message.types'; // Adjust path if necessary

import { MessageType } from '../types/enums'; // Assuming enums.ts is in the same directory or adjust path

// Define the shape of your message state
interface MessageState {
  conversations: ConversationDTO[];
  messages: { [conversationId: string]: MessageDTO[] };
  activeConversation: string | null;
  isLoading: boolean;
  totalUnreadCount: number;
  // WebSocket related actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  // Existing actions
  sendMessage: (conversationId: string, content: string, receiverId: string, type?: MessageType) => Promise<void>;
  createConversation: (participantId: string, productId?: string, productName?: string) => Promise<string>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getConversationsByUser: (userId: string) => ConversationDTO[];
  getUnreadCount: (userId: string) => number;
  // Internal state update actions, not exposed directly to components but used by WS listeners
  _addNewMessage: (message: MessageDTO) => void;
  _addNewConversation: (conversation: ConversationDTO) => void;
  _updateConversationMeta: (conversationId: string, lastMessage: MessageDTO, unreadCountChange: number) => void;
  _markMessagesAsReadClient: (conversationId: string, readerId: string, messageIds: string[]) => void;
}

// --- API Client for Messages ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.WS_BASE_URL;

let socket: Socket | null = null; // Declare socket instance outside the store

const messageApiClient = {
  getAuthToken: (): string => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found. User might not be logged in.');
      throw new Error('Authentication required.');
    }
    return token;
  },

  fetchConversations: async (): Promise<FetchConversationsResponseDTO> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch conversations.');
    }
    return response.json();
  },

  fetchMessages: async (conversationId: string): Promise<FetchMessagesResponseDTO> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch messages for conversation.');
    }
    return response.json();
  },

  sendMessage: async (payload: SendMessageRequestDTO): Promise<MessageDTO> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message.');
    }
    return response.json();
  },

  createConversation: async (payload: CreateConversationRequestDTO): Promise<ConversationCreatedResponseDTO> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create conversation.');
    }
    return response.json();
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark messages as read.');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const token = messageApiClient.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/messages/mark-all-read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark all messages as read.');
    }
  },
};

// Helper function to convert DTOs to frontend models (parses date strings)
const mapMessageDTOToMessage = (dto: MessageDTO): MessageDTO => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
});

const mapConversationDTOToConversation = (dto: ConversationDTO): ConversationDTO => ({
  ...dto,
  updatedAt: new Date(dto.updatedAt),
  createdAt: new Date(dto.createdAt), // Ensure createdAt is also mapped
  lastMessage: dto.lastMessage ? mapMessageDTOToMessage(dto.lastMessage) : undefined,
});


// Helper function to convert date strings back to Date objects (same as your original)
const reviveDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/; // Example: 2023-10-27T10:00:00
    if (dateRegex.test(obj) && !isNaN(new Date(obj).getTime())) { // Also check for valid date
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) { // Ensure it's own property
        if (key === 'updatedAt' || key === 'createdAt') {
          result[key] = typeof obj[key] === 'string' ? new Date(obj[key]) : obj[key];
        } else {
          result[key] = reviveDates(obj[key]);
        }
      }
    }
    return result;
  }

  return obj;
};


export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversation: null,
      isLoading: false,
      totalUnreadCount: 0,

      // --- WebSocket Connection & Disconnection ---
      connectWebSocket: () => {
        const token = messageApiClient.getAuthToken();
        if (socket && socket.connected) {
          console.log('Socket already connected.');
          return;
        }

        socket = io(WS_BASE_URL, {
          auth: {
            token: token,
          },
        });

        socket.on('connect', () => {
          console.log('Socket.IO connected!', socket?.id);
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
          console.error('Socket.IO connection error:', err.message);
          if (err.message === 'Authentication token missing.' || err.message === 'Invalid or expired token.') {
            console.error('WebSocket Authentication Failed. Please log in again.');
            useAuthStore.getState().logout();
          }
        });

        // --- WebSocket Event Listeners ---
        socket.on('newMessage', (messageDTO: MessageDTO) => {
          console.log('Received newMessage via WebSocket:', messageDTO);
          get()._addNewMessage(messageDTO);
        });

        socket.on('newConversation', (conversationDTO: ConversationDTO) => {
          console.log('Received newConversation via WebSocket:', conversationDTO);
          get()._addNewConversation(conversationDTO);
          // Also fetch conversations to ensure accurate sorting and last message
          get().fetchConversations();
        });

        socket.on('conversationUpdated', (data: { conversationId: string; message: string; }) => {
          console.log('Received conversationUpdated via WebSocket:', data);
          // This typically means some meta-data changed, best to refetch conversations
          get().fetchConversations();
        });

        socket.on('messagesRead', (data: { conversationId: string; readerId: string; messageIds: string[]; }) => {
          console.log('Received messagesRead via WebSocket:', data);
          get()._markMessagesAsReadClient(data.conversationId, data.readerId, data.messageIds);
        });

        // Add other listeners (e.g., 'typing', 'userOnline', 'userOffline') as needed
        socket.on('pong', (data: string) => {
          console.log('Received pong:', data);
        });
      },

      disconnectWebSocket: () => {
        if (socket && socket.connected) {
          socket.disconnect();
          socket = null; // Clear the socket instance
          console.log('Socket.IO explicitly disconnected.');
        }
      },

      // --- Internal helper actions for WebSocket updates ---
      _addNewMessage: (messageDTO: MessageDTO) => {
        const newMessage = mapMessageDTOToMessage(messageDTO);
        set(state => {
          const conversationId = newMessage.conversationId;
          const updatedMessages = {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), newMessage],
          };

          // Update conversation lastMessage and unread count for the receiver
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              const currentUser = useAuthStore.getState().user;
              let newUnreadCount = conv.unreadCount;

              // Only increment unread if the message is for the current user and it's not from themselves
              if (currentUser && newMessage.receiverId === currentUser.id && newMessage.senderId !== currentUser.id) {
                newUnreadCount += 1;
              }

              return {
                ...conv,
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt,
                unreadCount: newUnreadCount,
              };
            }
            return conv;
          });

          // Re-calculate total unread count
          const newTotalUnreadCount = updatedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

          return {
            ...state,
            messages: updatedMessages,
            conversations: updatedConversations,
            totalUnreadCount: newTotalUnreadCount,
          };
        });
      },

      _addNewConversation: (conversationDTO: ConversationDTO) => {
        const newConversation = mapConversationDTOToConversation(conversationDTO);
        set(state => ({
          conversations: [...state.conversations, newConversation]
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()), // Keep sorted by last update
        }));
      },

      _updateConversationMeta: (conversationId: string, lastMessage: MessageDTO, unreadCountChange: number) => {
        set(state => {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: lastMessage ? mapMessageDTOToMessage(lastMessage) : conv.lastMessage,
                updatedAt: lastMessage ? new Date(lastMessage.createdAt) : conv.updatedAt,
                unreadCount: Math.max(0, conv.unreadCount + unreadCountChange), // Ensure no negative unread count
              };
            }
            return conv;
          }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Re-sort

          const newTotalUnreadCount = updatedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

          return {
            ...state,
            conversations: updatedConversations,
            totalUnreadCount: newTotalUnreadCount,
          };
        });
      },

      // frontend/stores/messageStore.ts (corrected section)

      _markMessagesAsReadClient: (conversationId: string, readerId: string, messageIds: string[]) => {
        set(state => {
          const currentUser = useAuthStore.getState().user;
          // Only update if the event is relevant to the current user (either they are the reader or the sender)
          if (!currentUser || (readerId !== currentUser.id && !state.messages[conversationId]?.some(msg => messageIds.includes(msg.id) && msg.senderId === currentUser.id))) {
            return state;
          }

          const currentMessages = state.messages[conversationId] || [];
          // removed markedMessagesCount as it was not used after calculation, keep only if needed for debug/metrics
          // let markedMessagesCount = 0;

          const updatedMessagesInConv = currentMessages.map(msg => {
            // FIX: Changed msgIds to messageIds
            if (messageIds.includes(msg.id) && !msg.isRead) {
              //   markedMessagesCount++; // If still tracking this
              return { ...msg, isRead: true };
            }
            return msg;
          });

          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              // If the current user is the reader, their unread count for this conversation goes to 0
              if (readerId === currentUser.id) {
                return { ...conv, unreadCount: 0 };
              }
              // If the current user is a sender of the marked messages, their UI should reflect messages as read
              // (their own unread count won't change, but senders need the read receipt)
              return conv;
            }
            return conv;
          });

          const newTotalUnreadCount = updatedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

          return {
            ...state,
            messages: {
              ...state.messages,
              [conversationId]: updatedMessagesInConv,
            },
            conversations: updatedConversations,
            totalUnreadCount: newTotalUnreadCount,
          };
        });
      },

      // --- Existing API-driven actions (mostly remain the same, but now WS handles real-time updates) ---

      // frontend/stores/messageStore.ts (corrected sendMessage function)

      sendMessage: async (conversationId, content, receiverId, type = MessageType.Text) => {
        set({ isLoading: true });
        // const { messages, conversations } = get(); // This line is now removed
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          set({ isLoading: false });
          throw new Error('User not authenticated. Cannot send message.');
        }

        try {
          const payload: SendMessageRequestDTO = {
            conversationId,
            receiverId,
            content,
            type,
          };
          const sentMessageDTO = await messageApiClient.sendMessage(payload);
          const newMessage = mapMessageDTOToMessage(sentMessageDTO);

          // Optimistic update: Add message immediately to sender's view
          // The WebSocket will then confirm and update other clients.
          set(state => {
            const updatedMessages = {
              ...state.messages,
              [conversationId]: [...(state.messages[conversationId] || []), newMessage],
            };

            // Update conversation meta for sender (lastMessage, updatedAt)
            // This update ensures the sender's conversation list shows the new message immediately
            const updatedConversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: newMessage,
                  updatedAt: newMessage.createdAt,
                  // Sender's unreadCount does not change when they send a message
                };
              }
              return conv;
            });

            return {
              ...state,
              messages: updatedMessages,
              conversations: updatedConversations,
            };
          });

        } catch (error: any) {
          set({ isLoading: false });
          console.error("Failed to send message:", error.message);
          throw new Error(error.message || 'An unexpected error occurred while sending message.');
        } finally {
          set({ isLoading: false }); // Ensure isLoading is reset
        }
      },
      createConversation: async (participantId, productId, productName) => {
        set({ isLoading: true });
        const { conversations } = get();
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          set({ isLoading: false });
          throw new Error('User not authenticated. Cannot create conversation.');
        }

        // Frontend optimization: Check for existing conversation locally
        const existingConv = conversations.find(conv =>
          conv.participants.includes(currentUser.id) &&
          conv.participants.includes(participantId) &&
          (!productId || conv.productId === productId)
        );

        if (existingConv) {
          set({ isLoading: false });
          get().setActiveConversation(existingConv.id); // Set as active if found
          return existingConv.id;
        }

        try {
          const payload: CreateConversationRequestDTO = {
            participantId,
            productId,
            productName,
          };
          const response = await messageApiClient.createConversation(payload);

          // If the backend says it was an existing conversation, refresh.
          // The 'conversationUpdated' WS event might also handle this.
          if (!response.conversation) {
            await get().fetchConversations();
            get().setActiveConversation(response.conversationId);
            return response.conversationId;
          }

          // If a new conversation was truly created, the _addNewConversation WS listener will handle it.
          // No need for explicit 'set' here based on `response.conversation` if WS is reliable.
          // However, for immediate UI feedback (if WS is slightly delayed), you could optimistically add it here too.
          // For now, let's rely on the WS event for a single source of truth for new conversations.

          get().setActiveConversation(response.conversationId);
          return response.conversationId;

        } catch (error: any) {
          set({ isLoading: false });
          console.error("Failed to create conversation:", error.message);
          throw new Error(error.message || 'An unexpected error occurred while creating conversation.');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchConversations: async () => {
        set({ isLoading: true });
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          set({ isLoading: false });
          console.warn('No current user found. Cannot fetch conversations.');
          set({ conversations: [], totalUnreadCount: 0 });
          return;
        }

        try {
          const response = await messageApiClient.fetchConversations();
          const fetchedConversations = response.conversations.map(mapConversationDTOToConversation);
          const totalUnread = fetchedConversations.reduce((sum: number, conv: ConversationDTO) => sum + conv.unreadCount, 0);

          set({
            conversations: fetchedConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()), // Ensure sorted
            totalUnreadCount: totalUnread,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          console.error("Failed to fetch conversations:", error.message);
          throw new Error(error.message || 'An unexpected error occurred while fetching conversations.');
        }
      },

      fetchMessages: async (conversationId) => {
        set({ isLoading: true });
        const { messages } = get();
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          set({ isLoading: false });
          console.warn('No current user found. Cannot fetch messages.');
          set({ messages: { ...messages, [conversationId]: [] } });
          return;
        }

        try {
          const response = await messageApiClient.fetchMessages(conversationId);
          const fetchedMessages = response.messages.map(mapMessageDTOToMessage);

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: fetchedMessages,
            },
            isLoading: false,
          }));

          // Automatically mark messages as read once fetched (if they are for the current user and unread)
          await get().markAsRead(conversationId);

        } catch (error: any) {
          set({ isLoading: false });
          console.error("Failed to fetch messages:", error.message);
          throw new Error(error.message || 'An unexpected error occurred while fetching messages.');
        }
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversation: conversationId });
      },

      markAsRead: async (conversationId) => {
        // Optimistic update first
        set(state => {
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) return state;

          const currentMessages = state.messages[conversationId] || [];
          let markedCount = 0;
          const updatedMessagesInConv = currentMessages.map(msg => {
            if (msg.receiverId === currentUser.id && !msg.isRead) {
              markedCount++;
              return { ...msg, isRead: true };
            }
            return msg;
          });

          const updatedConversations = state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, unreadCount: 0 } // Reset unread count for this conversation
              : conv
          );

          const newTotalUnreadCount = updatedConversations
            .reduce((sum, conv) => sum + conv.unreadCount, 0);

          return {
            ...state,
            messages: {
              ...state.messages,
              [conversationId]: updatedMessagesInConv,
            },
            conversations: updatedConversations,
            totalUnreadCount: newTotalUnreadCount,
          };
        });

        try {
          await messageApiClient.markAsRead(conversationId);
          // Backend will emit 'messagesRead' to all relevant clients,
          // which will trigger _markMessagesAsReadClient for consistency.
        } catch (error: any) {
          console.error("Failed to mark messages as read on backend:", error.message);
          // If backend fails, consider reverting the optimistic update or showing an error
          get().fetchConversations(); // Fallback to refresh from backend
        }
      },

      markAllAsRead: async () => {
        // Optimistic update
        set(state => {
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) return state;

          const updatedMessages = { ...state.messages };
          Object.keys(updatedMessages).forEach(convId => {
            updatedMessages[convId] = updatedMessages[convId].map(msg =>
              msg.receiverId === currentUser.id ? { ...msg, isRead: true } : msg
            );
          });

          const updatedConversations = state.conversations.map(conv =>
            conv.participants.includes(currentUser.id)
              ? { ...conv, unreadCount: 0 }
              : conv
          );

          return {
            ...state,
            messages: updatedMessages,
            conversations: updatedConversations,
            totalUnreadCount: 0,
          };
        });

        try {
          await messageApiClient.markAllAsRead();
          // Backend will emit 'messagesRead' for each affected conversation,
          // triggering _markMessagesAsReadClient.
        } catch (error: any) {
          console.error("Failed to mark all messages as read on backend:", error.message);
          get().fetchConversations(); // Fallback to refresh from backend
        }
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
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            // Ensure dates are revived
            const stateWithDates = reviveDates(parsed.state);
            return {
              state: stateWithDates,
              version: parsed.version
            };
          } catch (e) {
            console.error("Error parsing persisted message store:", e);
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

// --- WebSocket Connection Management outside React Component Lifecycle ---
// We can use a listener on the authStore to connect/disconnect the socket
// This ensures the socket is only active when a user is logged in.
useAuthStore.subscribe(
  (state: AuthState, prevState: AuthState) => {
    // If user logs in (transition from no user to a user)
    if (state.user && !prevState.user) {
      console.log('User logged in, connecting WebSocket...');
      useMessageStore.getState().connectWebSocket();
    }
    // If user logs out (transition from a user to no user)
    if (!state.user && prevState.user) {
      console.log('User logged out, disconnecting WebSocket...');
      useMessageStore.getState().disconnectWebSocket();
    }
  }
  // No selector as second argument here if you want full state in the first callback
);
// Initial connection attempt if user is already logged in on app start
// This part remains fine as it's a direct synchronous check.
if (useAuthStore.getState().user) {
  console.log('App started with user logged in, connecting WebSocket...');
  useMessageStore.getState().connectWebSocket();
}