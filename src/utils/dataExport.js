// Data export/import utilities for SoulLens
import { getAllPreferences, getUserPreference, STORAGE_KEYS } from './storage';

// Get user conversations from localStorage or API
const getConversations = () => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    const conversations = localStorage.getItem('soullens_conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
};

// Get journal entries from localStorage or API
const getJournalEntries = () => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    const entries = localStorage.getItem('soullens_journal_entries');
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Failed to get journal entries:', error);
    return [];
  }
};

// Get user profile
const getUserProfile = () => {
  return getUserPreference(STORAGE_KEYS.USER_PROFILE, {
    name: "SoulLens User",
    email: "user@soullens.ai",
    avatar: "S",
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  });
};

// Export user data with options
export const exportUserData = async (options = { type: 'all', format: 'json' }) => {
  try {
    let exportData = {};
    const { type, format } = options;

    // Build export data based on type
    if (type === 'all' || type === 'profile') {
      exportData.profile = getUserProfile();
    }
    if (type === 'all' || type === 'conversations') {
      exportData.conversations = getConversations();
    }
    if (type === 'all' || type === 'journal') {
      exportData.journalEntries = getJournalEntries();
    }
    if (type === 'all' || type === 'insights') {
      exportData.insights = getUserPreference('soullens_insights', []);
    }
    if (type === 'all') {
      exportData.preferences = getAllPreferences();
    }

    // Add metadata
    exportData.metadata = {
      exportDate: new Date().toISOString(),
      version: "2.1.0",
      source: "SoulLens AI",
      exportType: type
    };

    let content, mimeType, fileExtension;
    const timestamp = new Date().toISOString().split('T')[0];

    // Format data based on chosen format
    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'csv') {
      content = convertToCSV(exportData);
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else if (format === 'txt') {
      content = convertToText(exportData);
      mimeType = 'text/plain';
      fileExtension = 'txt';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const filename = `soullens-${type}-export-${timestamp}.${fileExtension}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

// Convert data to CSV format
const convertToCSV = (data) => {
  let csv = '';
  
  if (data.conversations && data.conversations.length > 0) {
    csv += 'CONVERSATIONS\n';
    csv += 'Date,Persona,Message,Response\n';
    data.conversations.forEach(conv => {
      conv.messages?.forEach(msg => {
        const date = new Date(msg.timestamp || Date.now()).toISOString().split('T')[0];
        const persona = conv.persona || 'AI';
        const message = `"${(msg.content || '').replace(/"/g, '""')}"`;
        const response = `"${(msg.response || '').replace(/"/g, '""')}"`;
        csv += `${date},${persona},${message},${response}\n`;
      });
    });
    csv += '\n';
  }

  if (data.journalEntries && data.journalEntries.length > 0) {
    csv += 'JOURNAL ENTRIES\n';
    csv += 'Date,Title,Content,Mood\n';
    data.journalEntries.forEach(entry => {
      const date = new Date(entry.timestamp || Date.now()).toISOString().split('T')[0];
      const title = `"${(entry.title || 'Untitled').replace(/"/g, '""')}"`;
      const content = `"${(entry.content || '').replace(/"/g, '""')}"`;
      const mood = entry.mood || 'neutral';
      csv += `${date},${title},${content},${mood}\n`;
    });
  }

  return csv;
};

// Convert data to plain text format
const convertToText = (data) => {
  let text = `SoulLens Data Export\n`;
  text += `Export Date: ${new Date().toLocaleDateString()}\n`;
  text += `Export Type: ${data.metadata?.exportType || 'all'}\n\n`;

  if (data.profile) {
    text += `PROFILE\n`;
    text += `========\n`;
    text += `Name: ${data.profile.name}\n`;
    text += `Email: ${data.profile.email}\n`;
    text += `Join Date: ${data.profile.joinDate}\n\n`;
  }

  if (data.conversations && data.conversations.length > 0) {
    text += `CONVERSATIONS (${data.conversations.length})\n`;
    text += `=============\n`;
    data.conversations.forEach((conv, i) => {
      text += `Conversation ${i + 1} (${conv.persona || 'AI'})\n`;
      text += `Date: ${new Date(conv.timestamp || Date.now()).toLocaleDateString()}\n`;
      conv.messages?.forEach(msg => {
        text += `User: ${msg.content || ''}\n`;
        text += `AI: ${msg.response || ''}\n`;
      });
      text += `\n`;
    });
  }

  if (data.journalEntries && data.journalEntries.length > 0) {
    text += `JOURNAL ENTRIES (${data.journalEntries.length})\n`;
    text += `===============\n`;
    data.journalEntries.forEach((entry, i) => {
      text += `Entry ${i + 1}: ${entry.title || 'Untitled'}\n`;
      text += `Date: ${new Date(entry.timestamp || Date.now()).toLocaleDateString()}\n`;
      text += `Mood: ${entry.mood || 'neutral'}\n`;
      text += `Content: ${entry.content || ''}\n\n`;
    });
  }

  return text;
};

// Import user data from JSON file
export const importUserData = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      reject(new Error('Please select a valid JSON file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.metadata || !data.metadata.source) {
          reject(new Error('Invalid SoulLens data file'));
          return;
        }

        let importedItems = 0;

        // Import preferences
        if (data.preferences) {
          Object.entries(data.preferences).forEach(([key, value]) => {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              importedItems++;
            } catch (error) {
              console.warn(`Failed to import preference ${key}:`, error);
            }
          });
        }

        // Import conversations
        if (data.conversations && Array.isArray(data.conversations)) {
          try {
            localStorage.setItem('soullens_conversations', JSON.stringify(data.conversations));
            importedItems += data.conversations.length;
          } catch (error) {
            console.warn('Failed to import conversations:', error);
          }
        }

        // Import journal entries
        if (data.journalEntries && Array.isArray(data.journalEntries)) {
          try {
            localStorage.setItem('soullens_journal_entries', JSON.stringify(data.journalEntries));
            importedItems += data.journalEntries.length;
          } catch (error) {
            console.warn('Failed to import journal entries:', error);
          }
        }

        // Import profile
        if (data.profile) {
          try {
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.profile));
            importedItems++;
          } catch (error) {
            console.warn('Failed to import profile:', error);
          }
        }

        resolve({ 
          success: true, 
          importedItems,
          exportDate: data.metadata.exportDate 
        });
        
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

// Clear all user data
export const clearAllUserData = () => {
  try {
    // Clear all SoulLens related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('soullens_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return { success: true, clearedItems: keysToRemove.length };
  } catch (error) {
    console.error('Failed to clear data:', error);
    return { success: false, error: error.message };
  }
};

// Get data summary for export preview
export const getDataSummary = () => {
  if (typeof window === 'undefined') {
    return {
      conversations: 0,
      journalEntries: 0,
      preferences: 0,
      totalSize: 0
    };
  }
  
  const conversations = getConversations();
  const journalEntries = getJournalEntries();
  const preferences = getAllPreferences();
  
  return {
    conversations: conversations.length,
    journalEntries: journalEntries.length,
    preferences: Object.keys(preferences).length,
    totalSize: JSON.stringify({
      conversations,
      journalEntries,
      preferences
    }).length
  };
};