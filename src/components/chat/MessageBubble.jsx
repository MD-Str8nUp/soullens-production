'use client';

import { format } from 'date-fns';
import { X, ExternalLink, Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, onDismiss }) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isError = message.isError;
  const isJournalSuggestion = message.type === 'journal_suggestion';

  if (isSystem && !isJournalSuggestion) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
          {message.text}
        </div>
      </div>
    );
  }

  if (isJournalSuggestion) {
    return (
      <div className="flex justify-center my-6">
        <div className="relative bg-gradient-to-br from-[#0B3D91]/10 via-[#A56CC1]/10 to-[#FFC857]/10 backdrop-blur-sm border border-[#A56CC1]/20 rounded-2xl p-5 max-w-sm mx-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <p className="text-gray-800 text-sm mb-4 pr-8 leading-relaxed font-medium">{message.text}</p>
          
          {message.actions && (
            <div className="flex flex-col gap-2">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (action.href) {
                      window.location.href = action.href;
                    } else if (action.action === 'dismiss' && onDismiss) {
                      onDismiss();
                    }
                  }}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
                    action.href
                      ? 'bg-gradient-to-r from-[#0B3D91] to-[#A56CC1] text-white hover:shadow-lg'
                      : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  {action.href && <ExternalLink className="h-4 w-4" />}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 message-animate`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 max-w-[85%]`}>
        {/* Premium AI Avatar */}
        {!isUser && (
          <div className="relative flex-shrink-0 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D91] to-[#A56CC1] rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        )}
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
          {/* Premium Message Bubble */}
          <div
            className={`
              relative px-5 py-3 rounded-2xl max-w-xs shadow-lg transform transition-all duration-200 hover:scale-[1.02]
              ${isUser
                ? 'bg-gradient-to-br from-[#0B3D91] to-[#1a56db] text-white rounded-br-sm ml-3'
                : isError
                  ? 'bg-gradient-to-br from-red-50 to-pink-50 text-red-800 rounded-bl-sm border border-red-200 mr-3'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 mr-3 hover:shadow-xl'
              }
            `}
          >
            {/* Premium gradient overlay for AI messages */}
            {!isUser && !isError && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91]/5 to-[#A56CC1]/5 rounded-2xl rounded-bl-sm pointer-events-none"></div>
            )}
            
            <p className="relative whitespace-pre-wrap break-words leading-relaxed text-[15px] font-medium">
              {message.text}
            </p>
            
            {/* Premium shimmer effect for user messages */}
            {isUser && (
              <div className="absolute inset-0 rounded-2xl rounded-br-sm overflow-hidden pointer-events-none">
                <div className="absolute inset-0 shimmer opacity-20"></div>
              </div>
            )}
          </div>
          
          {/* Premium Timestamp and Status */}
          <div className={`flex items-center space-x-1.5 px-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className={`text-[11px] font-medium ${isUser ? 'text-gray-600' : 'text-gray-500'}`}>
              {format(message.timestamp, 'h:mm a')}
            </span>
            {isUser && (
              <div className="text-[#0B3D91]">
                <CheckCheck className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}