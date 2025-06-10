'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    textColor: 'text-green-800'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
    textColor: 'text-red-800'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800'
  }
};

let toastId = 0;
let toastListeners = [];

// Toast manager functions
export const showToast = (message, type = 'success', duration = 3000) => {
  const toast = {
    id: ++toastId,
    message,
    type,
    duration,
    timestamp: Date.now()
  };
  
  toastListeners.forEach(listener => listener(toast));
  return toast.id;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const addToast = (toast) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto remove after duration
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    };

    toastListeners.push(addToast);
    
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== addToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
        <div className="flex flex-col space-y-2 max-w-sm mx-auto">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toastType = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = toastType.icon;

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-200 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <div className={`${toastType.bgColor} border border-gray-200 rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${toastType.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${toastType.textColor}`}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;