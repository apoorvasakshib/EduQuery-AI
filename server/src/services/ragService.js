const { getGeminiClient } = require('../config/gemini');
const { searchHybridChunks } = require('./vectorService');

/**
 * Intelligent extractive answer extractor for accurate context grounding
 */
const extractGroundedAnswer = (query, chunks, language = 'en') => {
  if (!chunks || chunks.length === 0) return null;

  const stopWords = new Set([
    'what', 'which', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'the', 'for',
    'in', 'on', 'at', 'to', 'of', 'and', 'or', 'an', 'as', 'by', 'does', 'do',
    'can', 'could', 'should', 'would', 'much', 'many', 'tell', 'me'
  ]);

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const coreKeywords = queryTerms.filter((w) => !stopWords.has(w) && w.length > 2);

  if (coreKeywords.length === 0) return null;

  let bestSentence = null;
  let bestScore = 0;
  let bestChunk = chunks[0];

  for (const chunk of chunks) {
    const sentences = chunk.text
      .split(/(?<=[.?!:\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    for (const sentence of sentences) {
      const sLower = sentence.toLowerCase();
      let matchCount = 0;

      for (const kw of coreKeywords) {
        if (sLower.includes(kw)) {
          matchCount += 3;
        } else {
          const rootKw = kw.slice(0, Math.max(4, kw.length - 2));
          if (sLower.includes(rootKw)) {
            matchCount += 1.5;
          }
        }
      }

      for (const term of queryTerms) {
        if (sLower.includes(term)) matchCount += 0.5;
      }

      // Bonus if contains numbers, percentages, marks, or dates
      if (/\d+%\s*|\b\d+\b/i.test(sentence) && matchCount > 0) matchCount += 2;

      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestSentence = sentence;
        bestChunk = chunk;
      }
    }
  }

  if (bestSentence && bestScore >= 3.5) {
    const docSource = `${bestChunk.documentTitle} (Page ${bestChunk.pageNumber})`;
    if (language === 'kn') {
      return `ಅಧಿಕೃತ ಕಾಲೇಜು ದಾಖಲೆಯ ಪ್ರಕಾರ (${docSource}):\n${bestSentence}`;
    } else if (language === 'hi') {
      return `आधिकारिक कॉलेज दस्तावेज के अनुसार (${docSource}):\n${bestSentence}`;
    } else {
      return `Based on official ${docSource}:\n${bestSentence}`;
    }
  }

  return null;
};

/**
 * Pure RAG Service
 */
const answerQuery = async ({
  query,
  departmentId = null,
  accessibleCollectionIds = [],
  userRole = 'student',
  language = 'en',
}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Query string must be a non-empty text string');
  }

  const fallbackMessage =
    language === 'kn'
      ? "ಲಭ್ಯವಿರುವ ಅಧಿಕೃತ ಕಾಲೇಜು ದಾಖಲೆಗಳಲ್ಲಿ ಈ ಮಾಹಿತಿ ನನಗೆ ಕಂಡುಬರಲಿಲ್ಲ."
      : language === 'hi'
      ? "मुझे उपलब्ध आधिकारिक कॉलेज दस्तावेजों में यह जानकारी नहीं मिली।"
      : "I could not find this information in the available official college documents.";

  // 1. Perform Hybrid Search & Re-ranking
  const chunks = await searchHybridChunks({
    query,
    departmentId,
    accessibleCollectionIds,
    userRole,
    topK: 6,
  });

  const maxScore = chunks.length > 0 ? chunks[0].relevanceScore : 0;

  // Determine Confidence Level
  let confidenceLevel = 'Low';
  if (maxScore >= 75) confidenceLevel = 'High';
  else if (maxScore >= 45) confidenceLevel = 'Medium';

  // Fallback strictly when no relevant context found
  if (chunks.length === 0 || maxScore < 20) {
    return {
      answer: fallbackMessage,
      sources: [],
      confidenceScore: maxScore,
      confidenceLevel: 'Low',
      suggestedQuestions: [
        "What are the official attendance rules?",
        "When are the upcoming semester examination dates?",
        "Where can I view my department timetable?",
      ],
      grounded: false,
    };
  }

  // 2. Format Context and Source Attribution List
  const contextText = chunks
    .map(
      (c, idx) =>
        `[Source ${idx + 1}: ${c.documentTitle} (Version ${c.versionNumber}, Page ${c.pageNumber}) - Relevance ${c.relevanceScore}%]\n${c.text}`
    )
    .join('\n\n');

  const sources = chunks.map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    versionNumber: c.versionNumber,
    pageNumber: c.pageNumber,
    relevanceScore: c.relevanceScore,
    textChunk: c.text,
  }));

  // Language Instruction mapping
  const langInstruction =
    language === 'kn'
      ? 'Answer the question strictly in Kannada language.'
      : language === 'hi'
      ? 'Answer the question strictly in Hindi language.'
      : 'Answer the question in English.';

  // 3. System Prompt
  const prompt = `You are EduQuery AI, the official college information assistant.
You answer questions using ONLY the official retrieved college documents provided in the context below.
Never invent facts. Never use unsupported external knowledge.
If the retrieved context does not contain the answer, clearly state: "${fallbackMessage}"
Always cite the source document name and page number.

Language Requirement: ${langInstruction}

Retrieved Context:
${contextText}

Question:
${query}

Answer:`;

  // 4. Generate Answer using Gemini API or Extractive Grounding Engine
  const apiKey = process.env.GEMINI_API_KEY;
  const isGeminiKeyValid = apiKey && apiKey !== 'your_gemini_api_key_here' && !apiKey.startsWith('AQ.');

  if (isGeminiKeyValid) {
    try {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      const answerText = response.response.text().trim();

      if (answerText && !answerText.includes("could not find") && !answerText.includes("couldn't find")) {
        return {
          answer: answerText,
          sources,
          confidenceScore: maxScore,
          confidenceLevel,
          suggestedQuestions: generateFollowUpSuggestions(query, contextText),
          grounded: true,
        };
      }
    } catch (err) {
      console.warn('[RAG Service] Gemini API warning:', err.message);
    }
  }

  // 5. Intelligent Extractive QA Fallback (Strictly Grounded in Uploaded Document Chunks)
  const extractedAnswer = extractGroundedAnswer(query, chunks, language);
  if (extractedAnswer) {
    return {
      answer: extractedAnswer,
      sources,
      confidenceScore: maxScore,
      confidenceLevel,
      suggestedQuestions: generateFollowUpSuggestions(query, chunks[0].text),
      grounded: true,
    };
  }

  // 6. Return standard Not Found message when genuinely absent
  return {
    answer: fallbackMessage,
    sources: [],
    confidenceScore: maxScore,
    confidenceLevel: 'Low',
    suggestedQuestions: generateFollowUpSuggestions(query, contextText),
    grounded: false,
  };
};

const generateFollowUpSuggestions = (query, context) => {
  const queryLower = query.toLowerCase();
  if (queryLower.includes('attendance') || queryLower.includes('leave')) {
    return [
      "What happens if my attendance is below 75%?",
      "How do I submit a medical leave certificate?",
      "What are the exam eligibility rules?",
    ];
  }
  if (queryLower.includes('exam') || queryLower.includes('marks')) {
    return [
      "When will the semester exam timetable be published?",
      "What is the passing criteria for internal assessments?",
      "How can I apply for re-evaluation of answer scripts?",
    ];
  }
  return [
    "What are the library operational hours?",
    "Where can I find fee payment deadlines?",
    "Who is the head of the department?",
  ];
};

module.exports = {
  answerQuery,
  generateFollowUpSuggestions,
  extractGroundedAnswer,
};
