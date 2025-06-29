import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, User, Search, Filter, Smartphone } from 'lucide-react';
import { useMessageStore } from '../../stores/messageStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const FarmerMessages: React.FC = () => {
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
  const [showSMSInfo, setShowSMSInfo] = useState(false);
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

  const getParticipantName = (conversation: any) => {
    if (conversation.productName) {
      return `Buyer - ${conversation.productName}`;
    }
    return `Buyer #${conversation.participants.find((p: string) => p !== user?.id)?.slice(-4) || 'Unknown'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">Communicate with buyers and manage inquiries</p>
              {unreadCount > 0 && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSMSInfo(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Smartphone size={20} />
              <span>SMS Options</span>
            </button>
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
                    When buyers contact you about your crops, conversations will appear here.
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {getParticipantName(conversation)}
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
                            <p className="text-xs text-green-600 mb-1">
                              Product: {conversation.productName}
                            </p>
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
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getParticipantName(activeConv)}
                        </h3>
                        {activeConv.productName && (
                          <p className="text-sm text-gray-600">About: {activeConv.productName}</p>
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
                    Choose a conversation from the left to start messaging with buyers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Unread Messages</h3>
            <p className="text-3xl font-bold text-green-600">{unreadCount}</p>
            <p className="text-sm text-gray-600">New inquiries</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
            <p className="text-3xl font-bold text-blue-600">2h</p>
            <p className="text-sm text-gray-600">Average response</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Active Chats</h3>
            <p className="text-3xl font-bold text-purple-600">{userConversations.length}</p>
            <p className="text-sm text-gray-600">Total conversations</p>
          </div>
        </div>
      </div>

      {/* SMS Info Modal */}
      {showSMSInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">SMS Messaging</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📱 SMS Features</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Receive buyer messages via SMS</li>
                    <li>• Reply to inquiries by text</li>
                    <li>• Get notifications for new messages</li>
                    <li>• Works even when offline</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
                  <ol className="text-sm text-gray-700 space-y-1">
                    <li>1. Buyers can send SMS to your registered number</li>
                    <li>2. You receive notifications in the app and via SMS</li>
                    <li>3. Reply directly from the app or via SMS</li>
                    <li>4. All messages sync automatically</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowSMSInfo(false)}
                className="w-full mt-6 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};