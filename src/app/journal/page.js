'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Plus, 
  Save,
  Heart,
  Frown,
  Meh,
  Smile,
  Zap,
  Brain,
  Edit3,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  X,
  ArrowLeft
} from 'lucide-react';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('write');
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState('');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Emotion options with icons and colors
  const emotions = [
    { id: 'happy', label: '😊', name: 'Happy', color: 'bg-green-100 text-green-600', ring: 'ring-green-200' },
    { id: 'excited', label: '⚡', name: 'Excited', color: 'bg-yellow-100 text-yellow-600', ring: 'ring-yellow-200' },
    { id: 'calm', label: '😌', name: 'Calm', color: 'bg-blue-100 text-blue-600', ring: 'ring-blue-200' },
    { id: 'neutral', label: '😐', name: 'Neutral', color: 'bg-gray-100 text-gray-600', ring: 'ring-gray-200' },
    { id: 'sad', label: '😢', name: 'Sad', color: 'bg-blue-100 text-blue-600', ring: 'ring-blue-200' },
    { id: 'anxious', label: '😰', name: 'Anxious', color: 'bg-purple-100 text-purple-600', ring: 'ring-purple-200' },
  ];

  useEffect(() => {
    loadJournalEntries();
    if (activeTab === 'write') {
      fetchQuestion();
    }
  }, [activeTab]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch('/api/journal/question');
      const data = await response.json();
      setCurrentQuestion(data.question);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/journal/entries');
      const data = await response.json();
      setJournalEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!currentEntry.trim()) return;

    try {
      setIsLoading(true);
      setSavedStatus('saving');

      const entryData = {
        content: currentEntry,
        emotion: selectedEmotion,
        prompt: currentQuestion,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        setSavedStatus('saved');
        setCurrentEntry('');
        setSelectedEmotion('');
        await loadJournalEntries();
        await fetchQuestion();
        setTimeout(() => setSavedStatus(''), 2000);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setSavedStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredEntries = () => {
    let filtered = journalEntries;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchLower) ||
        entry.prompt?.toLowerCase().includes(searchLower)
      );
    }

    if (filterEmotion !== 'all') {
      filtered = filtered.filter(entry => entry.emotion === filterEmotion);
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const getEmotionDetails = (emotionId) => {
    return emotions.find(e => e.id === emotionId) || emotions[3]; // Default to neutral
  };

  if (activeTab === 'write') {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between safe-area-top">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Write Entry</h1>
          </div>
          <button 
            onClick={() => setActiveTab('entries')}
            className="text-purple-600 font-medium"
          >
            View All
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Question Prompt */}
          {currentQuestion && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-800 mb-2">💭 Today's Reflection</h3>
                  <p className="text-purple-700 leading-relaxed">{currentQuestion}</p>
                </div>
                <button
                  onClick={fetchQuestion}
                  className="text-purple-600 hover:text-purple-800 p-1"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Emotion Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-3">
              {emotions.map(emotion => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedEmotion === emotion.id
                      ? `${emotion.color} border-current ring-4 ${emotion.ring} scale-105`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{emotion.label}</div>
                  <p className={`text-sm font-medium ${
                    selectedEmotion === emotion.id ? 'text-current' : 'text-gray-600'
                  }`}>
                    {emotion.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Writing Area */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your thoughts</h3>
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="What's on your mind today? Start writing your thoughts..."
              className="w-full h-64 px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="p-4 bg-white border-t border-gray-100 safe-area-bottom">
          <button
            onClick={saveEntry}
            disabled={!currentEntry.trim() || !selectedEmotion || isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Entry</span>
              </>
            )}
          </button>
          
          {savedStatus === 'saved' && (
            <div className="mt-2 text-center text-green-600 text-sm font-medium">
              ✅ Entry saved successfully!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Entries tab
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Journal</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setActiveTab('write')}
              className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading entries...</p>
            </div>
          </div>
        ) : getFilteredEntries().length === 0 ? (
          <div className="flex items-center justify-center h-full px-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No entries yet</h3>
              <p className="text-gray-600 mb-8">Start writing your first journal entry to capture your thoughts and feelings.</p>
              <button
                onClick={() => setActiveTab('write')}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Write First Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {getFilteredEntries().map(entry => {
              const emotion = getEmotionDetails(entry.emotion);
              const isExpanded = expandedEntry === entry.id;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${emotion.color}`}>
                        {emotion.label}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{emotion.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.createdAt)} • {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  {entry.prompt && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 italic">"{entry.prompt}"</p>
                    </div>
                  )}

                  <p className={`text-gray-800 leading-relaxed ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}>
                    {entry.content}
                  </p>

                  {entry.content.length > 150 && (
                    <button
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="mt-2 text-purple-600 text-sm font-medium hover:text-purple-800"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}