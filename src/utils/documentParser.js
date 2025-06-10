// SOULLENS DOCUMENT PARSER - PREMIUM DOCUMENT IMPORT SYSTEM
// Supports PDF, DOCX, TXT, MD, JSON, RTF document parsing for AI context integration

export class DocumentParser {
  
  static async parseFile(file) {
    const fileType = await this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return await this.parsePDF(file);
      case 'docx':
        return await this.parseDOCX(file);
      case 'txt':
      case 'md':
        return await this.parseText(file);
      case 'json':
        return await this.parseJSON(file);
      case 'rtf':
        return await this.parseRTF(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}. Supported formats: PDF, DOCX, TXT, MD, JSON, RTF`);
    }
  }
  
  static async getFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const validTypes = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'txt': 'txt',
      'md': 'md',
      'markdown': 'md',
      'json': 'json',
      'rtf': 'rtf'
    };
    
    return validTypes[extension] || null;
  }
  
  static async parsePDF(file) {
    try {
      // For client-side PDF parsing, we'll use a fallback approach
      // In a real implementation, you'd use PDF.js or a server-side service
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`PDF parsing failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return {
        content: result.text || 'PDF content could not be extracted automatically. Please copy and paste the text manually.',
        metadata: {
          pages: result.pages || 1,
          title: file.name,
          size: file.size,
          type: 'pdf',
          wordCount: (result.text || '').split(' ').filter(w => w.length > 0).length
        }
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('PDF parsing failed. Please try saving as a text file and importing that instead.');
    }
  }
  
  static async parseDOCX(file) {
    try {
      // Dynamic import for client-side compatibility
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content found in DOCX file');
      }
      
      return {
        content: result.value,
        metadata: {
          title: file.name,
          size: file.size,
          type: 'docx',
          wordCount: result.value.split(' ').filter(w => w.length > 0).length,
          messages: result.messages || []
        }
      };
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('DOCX parsing failed. Please save as TXT format and try again.');
    }
  }
  
  static async parseText(file) {
    try {
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Text file appears to be empty');
      }
      
      return {
        content: text,
        metadata: {
          title: file.name,
          size: file.size,
          type: file.name.endsWith('.md') ? 'markdown' : 'text',
          wordCount: text.split(' ').filter(w => w.length > 0).length,
          lineCount: text.split('\n').length
        }
      };
    } catch (error) {
      console.error('Text parsing error:', error);
      throw new Error('Failed to read text file. Please check the file format.');
    }
  }
  
  static async parseJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Extract text content from various JSON structures
      let content = '';
      
      // ChatGPT/Claude export format
      if (data.conversations) {
        content += data.conversations.map(conv => 
          `${conv.userInput || conv.user || ''}\n${conv.aiResponse || conv.assistant || ''}\n`
        ).join('\n');
      }
      
      // Journal entries format
      if (data.journalEntries || data.entries) {
        const entries = data.journalEntries || data.entries;
        content += entries.map(entry => 
          `${entry.date || ''}\n${entry.content || entry.text || entry.entry || ''}\n`
        ).join('\n');
      }
      
      // Generic content extraction
      if (data.content) {
        content += data.content;
      }
      
      // Notes/highlights format
      if (data.notes) {
        content += data.notes.map(note => note.text || note.content || '').join('\n');
      }
      
      // Highlights format (Kindle, etc.)
      if (data.highlights) {
        content += data.highlights.map(highlight => 
          `"${highlight.text || highlight.content || ''}" - ${highlight.note || ''}`
        ).join('\n');
      }
      
      if (!content || content.trim().length === 0) {
        content = JSON.stringify(data, null, 2); // Fallback to raw JSON
      }
      
      return {
        content,
        metadata: {
          title: file.name,
          size: file.size,
          type: 'json',
          dataStructure: Object.keys(data),
          wordCount: content.split(' ').filter(w => w.length > 0).length
        }
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Invalid JSON file format. Please check the file structure.');
    }
  }
  
  static async parseRTF(file) {
    try {
      // Basic RTF parsing - strip RTF formatting codes
      const text = await file.text();
      
      // Remove RTF control codes and formatting
      let cleanText = text
        .replace(/\{\\[^}]*\}/g, '') // Remove RTF control groups
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/\{|\}/g, '') // Remove remaining braces
        .replace(/\n\s*\n/g, '\n') // Clean up extra newlines
        .trim();
      
      if (!cleanText || cleanText.length === 0) {
        throw new Error('No readable text found in RTF file');
      }
      
      return {
        content: cleanText,
        metadata: {
          title: file.name,
          size: file.size,
          type: 'rtf',
          wordCount: cleanText.split(' ').filter(w => w.length > 0).length
        }
      };
    } catch (error) {
      console.error('RTF parsing error:', error);
      throw new Error('RTF parsing failed. Please save as TXT format and try again.');
    }
  }
  
  // Validate file before parsing
  static validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['pdf', 'docx', 'doc', 'txt', 'md', 'json', 'rtf'];
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }
    
    const fileType = this.getFileType(file);
    if (!fileType || !allowedTypes.includes(fileType)) {
      throw new Error(`Unsupported file type. Supported formats: ${allowedTypes.join(', ').toUpperCase()}`);
    }
    
    return true;
  }
  
  // Extract summary from content
  static generateQuickSummary(content, maxLength = 200) {
    if (!content || content.length === 0) return '';
    
    // Split into sentences and take the first few meaningful ones
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Only meaningful sentences
    
    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence + '. ';
      } else {
        break;
      }
    }
    
    return summary.trim() || content.substring(0, maxLength) + '...';
  }
}