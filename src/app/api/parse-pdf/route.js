// PDF PARSING API ENDPOINT
// Handles server-side PDF text extraction for document import

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }
    
    try {
      // Try to parse PDF using pdf-parse
      const pdfParse = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const data = await pdfParse.default(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        return NextResponse.json({
          error: 'No text could be extracted from this PDF. The PDF might be image-based or encrypted.',
          suggestion: 'Try using OCR software to extract text, or copy and paste the content manually.'
        }, { status: 422 });
      }
      
      return NextResponse.json({
        text: data.text,
        pages: data.numpages,
        info: data.info,
        success: true
      });
      
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      
      // Return helpful error message
      return NextResponse.json({
        error: 'Failed to extract text from PDF',
        details: parseError.message,
        suggestion: 'This PDF might be password-protected, corrupted, or image-based. Try converting to text format first.',
        fallback: true
      }, { status: 422 });
    }
    
  } catch (error) {
    console.error('PDF API error:', error);
    return NextResponse.json({
      error: 'Internal server error during PDF processing',
      suggestion: 'Please try again or contact support if the issue persists.'
    }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({
    message: 'PDF parsing endpoint. Use POST with a PDF file.',
    supportedMethods: ['POST'],
    maxFileSize: '10MB',
    acceptedTypes: ['application/pdf']
  });
}