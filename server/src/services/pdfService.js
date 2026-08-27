const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const Tesseract = require('tesseract.js');
const { getGeminiClient } = require('../config/gemini');

/**
 * Perform OCR on image buffer using Gemini Vision (if configured) or Tesseract.js
 */
const extractTextWithOCR = async (buffer, mimeType = 'image/png') => {
  // 1. Try Gemini Vision if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = 'Extract all readable text, tables, numbers, rules, and academic guidelines from this official document image accurately without omitting details. Output only the extracted text:';
      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png',
        },
      };
      const result = await model.generateContent([prompt, imagePart]);
      const geminiText = result.response.text().trim();
      if (geminiText && geminiText.length > 10) {
        return geminiText;
      }
    } catch (err) {
      console.warn('[OCR Service] Gemini Vision fallback to Tesseract:', err.message);
    }
  }

  // 2. Use Tesseract.js for robust local offline OCR
  try {
    const { data } = await Tesseract.recognize(buffer, 'eng');
    return data.text ? data.text.trim() : '';
  } catch (err) {
    throw new Error(`OCR extraction failed: ${err.message}`);
  }
};

/**
 * Extracts text from PDF buffer or image buffer
 */
const extractTextFromDocument = async (fileBuffer, fileName = '', mimeType = 'application/pdf') => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer provided for extraction');
  }

  console.log('[EXTRACTION] Starting text extraction');
  const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g)$/i.test(fileName);
  const isText = mimeType.startsWith('text/') || /\.txt$/i.test(fileName);

  if (isText) {
    const rawText = fileBuffer.toString('utf-8').trim();
    if (!rawText || rawText.length === 0) {
      throw new Error('Text document is empty.');
    }
    const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\n+/g, '\n ').trim();
    console.log('[EXTRACTION] Text extracted successfully');
    console.log(`[EXTRACTION] Extracted text length: ${cleanedText.length}`);
    return {
      text: cleanedText,
      numPages: 1,
      requiresOCR: false,
    };
  }

  if (isImage) {
    const ocrText = await extractTextWithOCR(fileBuffer, mimeType);
    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('No readable text could be extracted from the uploaded image. Please ensure the image is clear and contains text.');
    }
    const cleanedText = ocrText.replace(/\r\n/g, '\n').replace(/\n+/g, '\n ').trim();
    console.log('[EXTRACTION] Text extracted successfully');
    console.log(`[EXTRACTION] Extracted text length: ${cleanedText.length}`);
    return {
      text: cleanedText,
      numPages: 1,
      requiresOCR: true,
    };
  }

  // Handle PDF documents
  try {
    const data = await pdfParse(fileBuffer);
    let rawText = data.text || '';
    const numPages = data.numpages || 1;

    // Detect if PDF text density is extremely low (scanned image PDF)
    const averageCharsPerPage = rawText.trim().length / numPages;
    const requiresOCR = averageCharsPerPage < 30;

    if (requiresOCR && rawText.trim().length < 30) {
      // Perform OCR for scanned PDF
      try {
        const ocrResult = await extractTextWithOCR(fileBuffer, 'application/pdf');
        if (ocrResult && ocrResult.length > 20) {
          rawText = ocrResult;
        }
      } catch (ocrErr) {
        console.warn('[EXTRACTION] Scanned PDF OCR warning:', ocrErr.message);
      }
    }

    const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\n+/g, '\n ').trim();
    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('PDF appears empty or no readable text could be extracted.');
    }

    console.log('[EXTRACTION] Text extracted successfully');
    console.log(`[EXTRACTION] Extracted text length: ${cleanedText.length}`);

    return {
      text: cleanedText,
      numPages,
      requiresOCR,
      info: data.info,
    };
  } catch (err) {
    throw new Error(`Failed to parse PDF text: ${err.message}`);
  }
};

/**
 * Extract keywords from chunk text for BM25/keyword hybrid search index
 */
const extractKeywords = (text) => {
  const stopWords = new Set([
    'what', 'which', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how',
    'this', 'that', 'these', 'those', 'there', 'their', 'they', 'them',
    'with', 'from', 'about', 'above', 'below', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'under', 'again', 'further',
    'then', 'once', 'here', 'both', 'each', 'more', 'most', 'other', 'some',
    'such', 'only', 'own', 'same', 'than', 'too', 'very', 'will', 'just',
    'should', 'could', 'would', 'have', 'has', 'had', 'having', 'been', 'being',
    'does', 'did', 'doing', 'were', 'must', 'shall', 'cannot'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
  return Array.from(new Set(words));
};

/**
 * Split text into chunks with page numbers and keyword extraction
 */
const chunkTextWithPages = (text, numPages = 1, chunkSize = 800, overlap = 150) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const chunks = [];
  let startIndex = 0;
  const textLength = text.length;
  const approxCharsPerPage = Math.max(1, Math.floor(textLength / numPages));

  while (startIndex < textLength) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < textLength) {
      const nextSpace = text.indexOf(' ', endIndex);
      if (nextSpace !== -1 && nextSpace - endIndex < 60) {
        endIndex = nextSpace;
      }
    } else {
      endIndex = textLength;
    }

    const chunkContent = text.slice(startIndex, endIndex).trim();
    if (chunkContent.length > 0) {
      const estimatedPage = Math.min(numPages, Math.floor(startIndex / approxCharsPerPage) + 1);
      chunks.push({
        chunkId: uuidv4(),
        text: chunkContent,
        pageNumber: estimatedPage,
        keywords: extractKeywords(chunkContent),
        chunkIndex: chunks.length,
      });
    }

    if (endIndex >= textLength) {
      break;
    }

    startIndex = endIndex - overlap;
    if (startIndex <= 0 || startIndex >= textLength) {
      break;
    }
  }

  return chunks;
};

const processDocument = async (fileBuffer, fileName, mimeType = 'application/pdf') => {
  const { text, numPages, requiresOCR } = await extractTextFromDocument(fileBuffer, fileName, mimeType);
  const chunks = chunkTextWithPages(text, numPages, 800, 150);

  return {
    rawText: text,
    numPages,
    requiresOCR,
    chunkCount: chunks.length,
    chunks,
  };
};

module.exports = {
  extractTextFromDocument,
  chunkTextWithPages,
  processDocument,
  processPDFDocument: processDocument,
  extractKeywords,
};
