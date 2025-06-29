import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Search, Phone, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMessageStore } from '../../stores/messageStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const BuyerMessages: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    messages, 
    sendMessage, 
    activeConversation, 
    setActiveConversation,
    markAsRead,
    fetchConversations,
    getConversationsByUser,
    getUnreadCount
  } = useMessageStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userConversations = user ? getConversationsByUser(user.id) : [];
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  useEffect(() => {
    if (user) {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;

    const receiverId = conversation.participants.find(p => p !== user.id);
    if (!receiverId) return;

    setIsLoading(true);
    try {
      await sendMessage(activeConversation, newMessage.trim(), receiverId);
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = async (conversationId: string) => {
    setActiveConversation(conversationId);
    if (user) {
      await markAsRead(conversationId, user.id);
    }
  };

  const filteredConversations = userConversations.filter(conv => {
    if (!searchQuery) return true;
    
    const lastMessage = conv.lastMessage?.content.toLowerCase() || '';
    const productName = conv.productName?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return lastMessage.includes(query) || productName.includes(query);
  });

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const activeConv = conversations.find(c => c.id === activeConversation);

  const getSellerName = (conversation: any) => {
    if (conversation.productName) {
      return `Seller - ${conversation.productName}`;
    }
    return `Seller #${conversation.participants.find((p: string) => p !== user?.id)?.slice(-4) || 'Unknown'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Chat with farmers about their products</p>
            {unreadCount > 0 && (
              <p className="text-green-600 text-sm font-medium mt-1">
                {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
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
                      onClick={() => handleConversationClick(conversation.id)}
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
                            <p className="font-medium text-gray-900 truncate">
                              {getSellerName(conversation)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(conversation.lastMessage.createdAt)} ago
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {conversation.productName && (
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs text-green-600">
                                Product: {conversation.productName}
                              </span>
                              <div className="flex items-center">
                                <Star size={12} className="text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500 ml-1">4.8</span>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
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
                        <h3 className="font-semibold text-gray-900">
                          {getSellerName(activeConv)}
                        </h3>
                        {activeConv.productName && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{activeConv.productName}</span>
                            <div className="flex items-center">
                              <Star size={12} className="text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500 ml-1">4.8</span>
                            </div>
                          </div>
                        )}
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
                  {activeMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    activeMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(message.createdAt)} ago
                            {!message.isRead && message.senderId === user?.id && (
                              <span className="ml-1">• Sent</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isLoading}
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
            <p className="text-3xl font-bold text-green-600">{userConversations.length}</p>
            <p className="text-sm text-gray-600">Total conversations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Unread Messages</h3>
            <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
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