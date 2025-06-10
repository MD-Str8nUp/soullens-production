// ENHANCED DOCUMENT IMPORT COMPONENT
// Premium document import interface for SoulLens AI

'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, File, BookOpen, Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { DocumentParser } from '../../utils/documentParser.js';
import { DocumentContextIntegrator } from '../../utils/documentContextIntegrator.js';

const EnhancedImportData = ({ userAI, onImportComplete, showToast }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    { ext: 'PDF', desc: 'Adobe PDF documents', icon: <FileText className="w-5 h-5" />, color: 'text-red-600' },
    { ext: 'DOCX', desc: 'Microsoft Word documents', icon: <File className="w-5 h-5" />, color: 'text-blue-600' },
    { ext: 'TXT', desc: 'Plain text files', icon: <FileText className="w-5 h-5" />, color: 'text-gray-600' },
    { ext: 'MD', desc: 'Markdown files', icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-600' },
    { ext: 'JSON', desc: 'Exported data from other apps', icon: <Database className="w-5 h-5" />, color: 'text-green-600' },
    { ext: 'RTF', desc: 'Rich text format', icon: <File className="w-5 h-5" />, color: 'text-orange-600' }
  ];

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    
    try {
      // Validate file before processing
      DocumentParser.validateFile(selectedFile);
      
      setFile(selectedFile);
      setIsProcessing(true);
      setProcessingStatus('Parsing document...');
      setImportResult(null);
      
      // Parse the document
      const parsedDocument = await DocumentParser.parseFile(selectedFile);
      setProcessingStatus('Adding to AI memory...');
      
      // Integrate with AI memory system
      const result = await DocumentContextIntegrator.addDocumentToAIMemory(
        parsedDocument, 
        userAI
      );
      
      setImportResult(result);
      setProcessingStatus('Complete!');
      
      if (showToast) {
        showToast('Document imported successfully! Your AI companion now has deeper context.', 'success');
      }
      
      if (onImportComplete) {
        onImportComplete(result);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setProcessingStatus('');
      if (showToast) {
        showToast(error.message, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="enhanced-import max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Your Documents</h2>
        <p className="text-gray-600">
          Transform your AI companion with your personal content
        </p>
      </div>

      {/* Enhanced explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6 border border-blue-100">
        <div className="flex items-start space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">📚 Make Your AI Truly Personal</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Import therapy notes, journal entries, book highlights, and personal documents</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Your AI companion learns your patterns, goals, and challenges</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Enjoy deeper, more meaningful and personalized conversations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>All content remains private and secure - never shared</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported formats grid */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">Supported Document Formats:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {supportedFormats.map(format => (
            <div key={format.ext} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className={format.color}>
                {format.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">{format.ext}</div>
                <div className="text-xs text-gray-600 truncate">{format.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing status */}
      {isProcessing && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-6 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
            <div>
              <div className="font-medium text-yellow-900">Processing Your Document</div>
              <div className="text-sm text-yellow-800">{processingStatus}</div>
            </div>
          </div>
          <div className="mt-3 bg-yellow-200 rounded-full h-2">
            <div className="bg-yellow-600 h-2 rounded-full transition-all duration-500" 
                 style={{ width: processingStatus.includes('Complete') ? '100%' : processingStatus.includes('memory') ? '80%' : '40%' }}>
            </div>
          </div>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6 border border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">✅ Import Successful!</h4>
              <p className="text-sm text-green-800 mb-3">
                Successfully processed {importResult.chunksProcessed} sections from "{importResult.metadata.title}". 
                Your AI companion now has much deeper context about you.
              </p>
              
              {/* Import details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-600">Word Count</div>
                  <div className="font-semibold text-gray-900">{importResult.metadata.wordCount?.toLocaleString()}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-600">Document Type</div>
                  <div className="font-semibold text-gray-900">{importResult.metadata.type?.toUpperCase()}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-600">Sections</div>
                  <div className="font-semibold text-gray-900">{importResult.chunksProcessed}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-gray-600">File Size</div>
                  <div className="font-semibold text-gray-900">{(importResult.metadata.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              {/* Summary */}
              {importResult.summary && (
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-400">
                  <h5 className="font-medium text-gray-900 mb-2">Document Summary:</h5>
                  <p className="text-sm text-gray-700">{importResult.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File upload area */}
      <div 
        className={`upload-area border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : isProcessing 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          dragActive ? 'text-blue-600' : 'text-gray-400'
        }`} />
        
        <div className="mb-4">
          <p className={`text-lg font-medium mb-2 ${
            dragActive ? 'text-blue-900' : 'text-gray-700'
          }`}>
            {dragActive ? 'Drop your document here' : 'Choose a document to import'}
          </p>
          <p className="text-sm text-gray-500">
            Drag & drop or click to select • Maximum 10MB
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.json,.rtf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        <button
          onClick={triggerFileSelect}
          disabled={isProcessing}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isProcessing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : dragActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Select Document</span>
            </>
          )}
        </button>
      </div>

      {/* Import limits and tips */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <span>Import Limits</span>
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Maximum file size: 10MB per document</li>
            <li>• Premium users: Unlimited imports</li>
            <li>• Free users: 3 imports per month</li>
            <li>• Supported: PDF, DOCX, TXT, MD, JSON, RTF</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Pro Tips</span>
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Journal entries work best for emotional understanding</li>
            <li>• Therapy notes help your AI provide better support</li>
            <li>• Book highlights expand your AI's knowledge base</li>
            <li>• Work documents help with career conversations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedImportData;