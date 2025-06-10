'use client'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-1">
      <div className="flex items-end space-x-2 max-w-[85%]">
        {/* AI Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
          <span className="text-white text-xs font-semibold">AI</span>
        </div>
        
        {/* Typing bubble */}
        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm mr-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}