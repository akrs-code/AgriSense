import { MessageType } from '../types/enums';


export interface MessageDTO {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: MessageType;
    isRead: boolean;
    createdAt: Date;
}


export interface ConversationDTO {
    id: string;
    participants: string[];
    productId?: string;
    productName?: string;
    lastMessage?: MessageDTO;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SendMessageRequestDTO {
    conversationId: string;
    receiverId: string;
    content: string;
    type: MessageType;
}


export interface CreateConversationRequestDTO {
    participantId: string;
    productId?: string;
    productName?: string;
}

export interface MarkMessagesReadRequestDTO {
    conversationId: string;
}


export interface FetchConversationsResponseDTO {
    conversations: ConversationDTO[];
    totalUnreadCount: number;
}

export interface FetchMessagesResponseDTO {
    messages: MessageDTO[];
}

export interface ConversationCreatedResponseDTO {
    conversationId: string;
    conversation?: ConversationDTO;
}