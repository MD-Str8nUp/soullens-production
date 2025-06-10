'use client'

import { useState, useRef } from 'react'
import { Send, Plus, Mic, Smile, Paperclip } from 'lucide-react'

export default function MessageInput({ onSendMessage, disabled, placeholder = "Share your thoughts..." }) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage('')
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = '40px'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = (e) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 120) // Max 3 lines
    textarea.style.height = newHeight + 'px'
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-4 shadow-lg">
      <div className="flex items-end space-x-3">
        {/* Premium Message input container */}
        <div className="flex-1 relative group">
          <div className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-[#A56CC1]/30 rounded-2xl flex items-end px-4 py-3 min-h-[48px] transition-all duration-300 shadow-sm hover:shadow-lg focus-within:shadow-xl focus-within:border-[#A56CC1]/50">
            {/* Premium Emoji button */}
            <button
              className="text-gray-400 hover:text-[#FFC857] transition-all duration-200 mr-3 self-end pb-1 hover:scale-110"
              disabled={disabled}
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Premium Text input */}
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                adjustTextareaHeight(e)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 bg-transparent resize-none outline-none text-gray-900 placeholder-gray-400 py-1 leading-6 max-h-[120px] font-medium"
              rows={1}
              style={{
                minHeight: '24px',
                height: '24px'
              }}
            />

            {/* Premium Attachment button */}
            <button
              className="text-gray-400 hover:text-[#0B3D91] transition-all duration-200 ml-3 self-end pb-1 hover:scale-110"
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Premium Send/Mic button */}
        {message.trim() ? (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="relative w-12 h-12 bg-gradient-to-br from-[#0B3D91] to-[#A56CC1] hover:from-[#0B3D91] hover:to-[#8b5cf6] rounded-2xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-110 group"
          >
            <Send className="h-5 w-5 text-white translate-x-0.5 group-hover:translate-x-1 transition-transform duration-200" />
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 shimmer opacity-30"></div>
            </div>
          </button>
        ) : (
          <button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            disabled={disabled}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-pink-500 scale-110 animate-pulse'
                : 'bg-gradient-to-br from-[#A56CC1] to-[#FFC857] hover:scale-110'
            }`}
          >
            <Mic className={`h-5 w-5 text-white ${isRecording ? 'animate-pulse scale-110' : ''}`} />
            {!isRecording && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 shimmer opacity-30"></div>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Premium Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center mt-3 space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
          <span className="text-red-500 text-sm font-semibold">Recording voice message...</span>
        </div>
      )}
    </div>
  )
}