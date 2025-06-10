// DOCUMENT IMPORT PAGE
// Premium document import interface for SoulLens AI

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedImportData from '../../components/import/EnhancedImportData.jsx';
import { useAI } from '../../hooks/useAI.js';
import Toast from '../../components/ui/Toast.jsx';
import { ArrowLeft, FileText, Brain, Sparkles } from 'lucide-react';

export default function ImportPage() {
  const [showToast, setShowToast] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const { userAI } = useAI();
  const router = useRouter();

  useEffect(() => {
    // Load import history from user profile
    if (userAI?.userProfile?.importedDocuments) {
      setImportHistory(userAI.userProfile.importedDocuments);
    }
  }, [userAI]);

  const handleShowToast = (message, type = 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 5000);
  };

  const handleImportComplete = (result) => {
    // Update import history
    const newImport = {
      title: result.metadata.title,
      type: result.metadata.type,
      importedAt: result.importedAt,
      wordCount: result.metadata.wordCount,
      summary: result.summary
    };
    
    setImportHistory(prev => [...prev, newImport]);
    
    // Optionally redirect to chat after import
    setTimeout(() => {
      router.push('/chat?imported=true');
    }, 2000);
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📋';
      case 'md': return '📖';
      case 'json': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Import Documents</h1>
                  <p className="text-sm text-gray-600">Make your AI companion truly personal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Import Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <EnhancedImportData
                userAI={userAI}
                onImportComplete={handleImportComplete}
                showToast={handleShowToast}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Why Import Documents?</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Your AI learns your personal patterns and communication style</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Conversations become more meaningful and personalized</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Better emotional support based on your history</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Remembers your goals, challenges, and growth</span>
                </li>
              </ul>
            </div>

            {/* Import History */}
            {importHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Import History</h3>
                <div className="space-y-3">
                  {importHistory.slice(-5).reverse().map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">{getTypeIcon(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.wordCount?.toLocaleString()} words • {formatDate(item.importedAt)}
                        </p>
                        {item.summary && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {importHistory.length > 5 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Showing last 5 imports ({importHistory.length} total)
                  </p>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/chat')}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  💬 Start a conversation
                </button>
                <button
                  onClick={() => router.push('/journal')}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  📓 Write in journal
                </button>
                <button
                  onClick={() => router.push('/insights')}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  🧠 View insights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
}