'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Search,
  Plus,
  MessageCircle,
  Calendar,
  Filter,
  MoreHorizontal,
  Trash2,
  Archive,
  Pin,
  Clock,
  TrendingUp,
  Heart,
  Brain
} from 'lucide-react';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Mock data for demo
      setConversations([
        {
          id: 1,
          title: "Career Change Discussion",
          lastMessage: "That's really helpful advice about transitioning to tech...",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          category: "Advice",
          messageCount: 12,
          mood: "hopeful",
          isStarred: true
        },
        {
          id: 2,
          title: "Morning Reflection",
          lastMessage: "I'm feeling much better about the situation after our chat",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          category: "Venting",
          messageCount: 8,
          mood: "better",
          isStarred: false
        },
        {
          id: 3,
          title: "Weekend Plans",
          lastMessage: "Thanks for helping me prioritize my goals",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          category: "Goals",
          messageCount: 15,
          mood: "motivated",
          isStarred: false
        },
        {
          id: 4,
          title: "Relationship Advice",
          lastMessage: "I think I understand the situation better now",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          category: "Relationships",
          messageCount: 23,
          mood: "confused",
          isStarred: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'starred', label: 'Starred', count: conversations.filter(c => c.isStarred).length },
    { id: 'recent', label: 'Recent', count: conversations.filter(c => 
      Date.now() - new Date(c.timestamp).getTime() < 1000 * 60 * 60 * 24
    ).length }
  ];

  const categories = [
    { id: 'Advice', color: 'bg-blue-100 text-blue-600', icon: Brain },
    { id: 'Venting', color: 'bg-red-100 text-red-600', icon: Heart },
    { id: 'Goals', color: 'bg-green-100 text-green-600', icon: TrendingUp },
    { id: 'Relationships', color: 'bg-pink-100 text-pink-600', icon: Heart },
    { id: 'Work', color: 'bg-purple-100 text-purple-600', icon: Brain },
    { id: 'Health', color: 'bg-orange-100 text-orange-600', icon: Heart },
    { id: 'Ideas', color: 'bg-yellow-100 text-yellow-600', icon: Brain }
  ];

  const getFilteredConversations = () => {
    let filtered = [...conversations];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower) ||
        conv.category.toLowerCase().includes(searchLower)
      );
    }

    if (selectedFilter === 'starred') {
      filtered = filtered.filter(conv => conv.isStarred);
    } else if (selectedFilter === 'recent') {
      filtered = filtered.filter(conv =>
        Date.now() - new Date(conv.timestamp).getTime() < 1000 * 60 * 60 * 24
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getCategoryDetails = (category) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  const loadConversation = (conversation) => {
    localStorage.setItem('loadConversation', JSON.stringify(conversation));
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Conversations</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label} {filter.count > 0 && `(${filter.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {getFilteredConversations().length === 0 ? (
          <div className="flex items-center justify-center h-full px-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-8">Start your first conversation with SoulLens AI to see it here.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Conversation
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {getFilteredConversations().map(conversation => {
              const categoryDetails = getCategoryDetails(conversation.category);
              const CategoryIcon = categoryDetails.icon;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => loadConversation(conversation)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 active:scale-98"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-xl ${categoryDetails.color} flex-shrink-0`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.title}</h3>
                          {conversation.isStarred && (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-2">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(conversation.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{conversation.messageCount} messages</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full ${categoryDetails.color} text-xs font-medium`}>
                            {conversation.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 ml-2">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}