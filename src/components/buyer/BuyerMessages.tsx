import React, { useState } from 'react';
import { MessageSquare, Send, User, Search, Phone, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  farmerName: string;
  farmerPhone: string;
  productName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  farmerRating: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isFromBuyer: boolean;
}

export const BuyerMessages: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      farmerName: 'Juan Dela Cruz Farm',
      farmerPhone: '+63 912 345 6789',
      productName: 'Premium Rice',
      lastMessage: 'Yes, we have 500kg available. When do you need it?',
      lastMessageTime: new Date('2024-01-20T14:30:00'),
      unreadCount: 2,
      farmerRating: 4.8
    },
    {
      id: 'conv-2',
      farmerName: 'Maria Santos Farm',
      farmerPhone: '+63 923 456 7890',
      productName: 'Sweet Corn',
      lastMessage: 'Thank you for your order! We\'ll prepare it for delivery.',
      lastMessageTime: new Date('2024-01-19T16:45:00'),
      unreadCount: 0,
      farmerRating: 4.9
    },
    {
      id: 'conv-3',
      farmerName: 'Rodriguez Organic Farm',
      farmerPhone: '+63 934 567 8901',
      productName: 'Fresh Tomatoes',
      lastMessage: 'The tomatoes are ready for harvest. Quality is excellent!',
      lastMessageTime: new Date('2024-01-18T10:15:00'),
      unreadCount: 1,
      farmerRating: 4.7
    }
  ];

  // Mock messages for active conversation
  const messages: { [key: string]: Message[] } = {
    'conv-1': [
      {
        id: 'msg-1',
        senderId: 'buyer-1',
        content: 'Hi! I\'m interested in your premium rice. Is it still available?',
        timestamp: new Date('2024-01-20T14:00:00'),
        isFromBuyer: true
      },
      {
        id: 'msg-2',
        senderId: 'farmer-1',
        content: 'Hello! Yes, we have premium rice available. How much do you need?',
        timestamp: new Date('2024-01-20T14:15:00'),
        isFromBuyer: false
      },
      {
        id: 'msg-3',
        senderId: 'buyer-1',
        content: 'I need about 50kg. What\'s the price and can you deliver to Quezon City?',
        timestamp: new Date('2024-01-20T14:20:00'),
        isFromBuyer: true
      },
      {
        id: 'msg-4',
        senderId: 'farmer-1',
        content: 'Yes, we have 500kg available. When do you need it?',
        timestamp: new Date('2024-01-20T14:30:00'),
        isFromBuyer: false
      }
    ]
  };

  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' || 
    conv.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const activeConv = conversations.find(c => c.id === activeConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    // In a real app, this would send the message to the backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Chat with farmers about their products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 text-sm">
                    Start chatting with farmers about their products.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setActiveConversation(conversation.id)}
                      className={`w-full p-4 text-left rounded-lg transition-colors ${
                        activeConversation === conversation.id
                          ? 'bg-green-50 border border-green-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.farmerName}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(conversation.lastMessageTime)} ago
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-600">{conversation.productName}</span>
                            {renderStars(conversation.farmerRating)}
                            <span className="text-xs text-gray-500">({conversation.farmerRating})</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation && activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{activeConv.farmerName}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{activeConv.productName}</span>
                          {renderStars(activeConv.farmerRating)}
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                      <Phone size={20} />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromBuyer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromBuyer
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isFromBuyer ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(message.timestamp)} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">
                    Choose a farmer to start chatting about their products.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Active Chats</h3>
            <p className="text-3xl font-bold text-green-600">{conversations.length}</p>
            <p className="text-sm text-gray-600">Total conversations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Unread Messages</h3>
            <p className="text-3xl font-bold text-blue-600">
              {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Need your attention</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Response Rate</h3>
            <p className="text-3xl font-bold text-purple-600">98%</p>
            <p className="text-sm text-gray-600">Average farmer response</p>
          </div>
        </div>
      </div>
    </div>
  );
};