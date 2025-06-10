'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import PersonaSelector from './PersonaSelector';
import { MoreHorizontal, ArrowLeft, User, Phone, Video, Search } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useSubscription';
import FeatureGate from '@/components/subscription/FeatureGate';
import MessageLimitWarning from '@/components/subscription/MessageLimitWarning';
import UpgradeModal from '@/components/subscription/UpgradeModal';

export default function ChatInterface({ aiEngine }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! I'm SoulLens, your AI companion. What's on your mind today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState('mentor'); // Start with mentor for trial users
  const [conversationId, setConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalTrigger, setUpgradeModalTrigger] = useState('');
  const messagesEndRef = useRef(null);

  // Subscription hooks
  const {
    canSendMessage,
    trackMessageUsage,
    canAccessPersona,
    isPremium,
    messagesUsedToday,
    shouldShowUpgradePrompt,
    trackUpgradePrompt
  } = useTrialStatus();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for loaded conversation on mount
  useEffect(() => {
    const loadConversation = localStorage.getItem('loadConversation');
    if (loadConversation) {
      try {
        const conversation = JSON.parse(loadConversation);
        setMessages(conversation.messages || []);
        setConversationId(conversation.id);
        setConversationTitle(conversation.title);
        localStorage.removeItem('loadConversation');
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }
  }, []);

  // Auto-save conversation every 30 seconds or after significant changes
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the initial message
      const timer = setTimeout(() => {
        saveConversation();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [messages]);

  const saveConversation = async (force = false) => {
    if (messages.length <= 1 && !force) return; // Don't save empty conversations

    try {
      const conversationData = {
        title: conversationTitle || generateTitle(),
        messages: messages.map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : msg.sender === 'user' ? 'user' : 'system',
          content: msg.text,
          timestamp: msg.timestamp
        })),
        category: categorizeConversation(),
        relatedJournalEntries: []
      };

      const url = conversationId ? '/api/conversations' : '/api/conversations';
      const method = conversationId ? 'PUT' : 'POST';
      
      if (conversationId) {
        conversationData.id = conversationId;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });

      if (response.ok) {
        const savedConversation = await response.json();
        if (!conversationId) {
          setConversationId(savedConversation.id);
        }
        setLastSaveTime(new Date());
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const generateTitle = () => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
    }
    return 'New Conversation';
  };

  const categorizeConversation = () => {
    const allText = messages.map(msg => msg.text.toLowerCase()).join(' ');
    
    const categories = {
      'Advice': ['advice', 'help', 'should i', 'what do you think', 'recommend'],
      'Venting': ['frustrated', 'angry', 'upset', 'annoyed', 'hate', 'can\'t believe'],
      'Goals': ['goal', 'want to', 'plan', 'achieve', 'improve', 'better at'],
      'Relationships': ['relationship', 'friend', 'family', 'partner', 'boyfriend', 'girlfriend'],
      'Work': ['job', 'work', 'career', 'boss', 'colleague', 'office'],
      'Health': ['health', 'exercise', 'diet', 'sleep', 'stress', 'anxiety'],
      'Ideas': ['idea', 'thinking about', 'what if', 'creative', 'project']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  };

  const handleSendMessage = async (text) => {
    // Check if user can send message (trial limits)
    if (!canSendMessage()) {
      trackUpgradePrompt('message_limit');
      setUpgradeModalTrigger('message_limit');
      setShowUpgradeModal(true);
      return;
    }

    // Track message usage for trial users
    trackMessageUsage();

    // Add user message
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Make API call to chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sessionType: 'check_in',
          includeJournalContext: true,
          persona: currentPersona
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI message
      const aiMessage = {
        id: Date.now() + 1,
        text: data.result,
        sender: 'ai',
        timestamp: new Date(),
        metadata: data.metadata
      };
      setMessages(prev => [...prev, aiMessage]);

      // Only show journal recommendation if it's the first time this session AND user explicitly needs it
      if (data.metadata?.journal_recommendation?.should_recommend &&
          data.metadata?.journal_recommendation?.reason === 'explicit_reflection_need') {
        setTimeout(() => {
          const journalPrompt = {
            id: Date.now() + 2,
            text: `💭 It sounds like you might benefit from writing about this. Would you like to check out your journal to explore these thoughts further?`,
            sender: 'system',
            timestamp: new Date(),
            type: 'journal_suggestion',
            actions: [
              { label: 'Open Journal', href: '/journal' },
              { label: 'Maybe Later', action: 'dismiss' }
            ]
          };
          setMessages(prev => [...prev, journalPrompt]);
        }, 1500);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Let's try again!",
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePersonaChange = async (persona) => {
    // Check if user can access this persona
    if (!canAccessPersona(persona)) {
      trackUpgradePrompt('persona_block');
      setUpgradeModalTrigger('persona_block');
      setShowUpgradeModal(true);
      setShowPersonaSelector(false);
      return;
    }

    setCurrentPersona(persona);
    setShowPersonaSelector(false);
    
    const systemMessage = {
      id: Date.now(),
      text: `Switched to ${persona} mode. I'll adjust my conversation style accordingly.`,
      sender: 'system',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const startNewConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Hey there! I'm SoulLens, your AI companion. What's on your mind today?",
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
    setConversationId(null);
    setConversationTitle('');
  };

  const dismissJournalSuggestion = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const personaDisplayNames = {
    friend: 'Friend',
    mentor: 'Mentor',
    therapist: 'Therapist',
    coach: 'Coach'
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Premium Chat Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 safe-area-top shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Premium AI Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0B3D91] to-[#A56CC1] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your AI Companion
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  currentPersona === 'friend' ? 'bg-blue-500' :
                  currentPersona === 'mentor' ? 'bg-purple-500' :
                  currentPersona === 'therapist' ? 'bg-green-500' :
                  'bg-orange-500'
                }`}></span>
                {personaDisplayNames[currentPersona]} Mode
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPersonaSelector(!showPersonaSelector)}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>

      {/* Premium Persona Selector */}
      {showPersonaSelector && (
        <div className="absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Conversation Style</h3>
          <PersonaSelector
            currentPersona={currentPersona}
            onPersonaChange={handlePersonaChange}
          />
        </div>
      )}

      {/* Premium Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Message Limit Warning */}
        {!canSendMessage() && (
          <MessageLimitWarning
            onUpgradeClick={() => {
              setUpgradeModalTrigger('message_limit');
              setShowUpgradeModal(true);
            }}
            onDismiss={() => {}}
          />
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onDismiss={message.type === 'journal_suggestion' ? () => dismissJournalSuggestion(message.id) : undefined}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Bottom Fixed */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isTyping || !canSendMessage()}
          placeholder={
            !canSendMessage()
              ? `Daily limit reached (${messagesUsedToday}/3). Upgrade for unlimited messages!`
              : "Type your message..."
          }
        />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeModalTrigger}
      />
    </div>
  );
}