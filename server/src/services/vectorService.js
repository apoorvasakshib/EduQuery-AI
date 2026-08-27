const { getGeminiClient } = require('../config/gemini');
const DocumentVersion = require('../models/DocumentVersion');
const Document = require('../models/Document');
const Department = require('../models/Department');

/**
 * Cosine Similarity Calculation
 */
const calculateCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Robust semantic token vectorizer for offline / unconfigured API environments
 */
const createSemanticVector = (text) => {
  const dim = 128;
  const vector = new Array(dim).fill(0);
  if (!text) return vector;

  const clean = text.toLowerCase().replace(/[^\w\s]/gi, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 1);

  // Hash words and character bigrams into embedding dimensions with TF weighting
  for (const word of words) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash) + word.charCodeAt(i);
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 1.0;

    // Character bigrams for partial matching (e.g., attend -> attendance)
    for (let i = 0; i < word.length - 1; i++) {
      const biHash = (word.charCodeAt(i) * 31 + word.charCodeAt(i + 1)) % dim;
      vector[biHash] += 0.5;
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map((v) => v / magnitude);
};

const generateEmbedding = async (text) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('AQ.')) {
      return createSemanticVector(text);
    }
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    return createSemanticVector(text);
  } catch (err) {
    return createSemanticVector(text);
  }
};

/**
 * Keyword Overlap Score Calculation with stop words filtering and partial matching
 */
const calculateKeywordScore = (query, text, chunkKeywords = []) => {
  const stopWords = new Set([
    'what', 'which', 'where', 'when', 'who', 'whom', 'whose', 'why', 'how',
    'this', 'that', 'these', 'those', 'there', 'their', 'they', 'them',
    'with', 'from', 'about', 'above', 'below', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'under', 'again', 'further',
    'then', 'once', 'here', 'both', 'each', 'more', 'most', 'other', 'some',
    'such', 'only', 'own', 'same', 'than', 'too', 'very', 'will', 'just',
    'should', 'could', 'would', 'have', 'has', 'had', 'having', 'been', 'being',
    'does', 'did', 'doing', 'were', 'must', 'shall', 'cannot', 'the', 'is', 'are',
    'for', 'in', 'on', 'at', 'to', 'of', 'and', 'or', 'an', 'as', 'by'
  ]);

  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));

  if (queryTokens.length === 0) return 0;

  const textLower = text.toLowerCase();
  let matches = 0;

  for (const token of queryTokens) {
    if (textLower.includes(token) || chunkKeywords.includes(token)) {
      matches += 1;
    } else {
      // Partial prefix match (e.g. attend -> attendance, eligib -> eligibility)
      const rootToken = token.slice(0, Math.max(4, token.length - 2));
      if (textLower.includes(rootToken)) {
        matches += 0.75;
      }
    }
  }

  return Math.min(1.0, matches / queryTokens.length);
};

/**
 * Hybrid Search & Re-Ranking (Semantic Vector + Keyword BM25)
 */
const searchHybridChunks = async ({
  query,
  departmentId = null,
  accessibleCollectionIds = [],
  userRole = 'student',
  topK = 6,
}) => {
  console.log('[SEARCH] Searching official college documents');
  const queryEmbedding = await generateEmbedding(query);

  // 1. Fetch all processed official documents
  let activeDocs = [];

  if (departmentId && userRole !== 'super_admin') {
    // Search department-specific documents + general college documents
    const generalDept = await Department.findOne({ code: 'GEN' });
    const deptIds = [departmentId];
    if (generalDept) deptIds.push(generalDept._id);

    activeDocs = await Document.find({
      status: 'processed',
      departmentId: { $in: deptIds },
    }).populate('activeVersionId');
  }

  // Fallback: If no documents found under department filter or no department specified, search all processed college documents
  if (activeDocs.length === 0) {
    activeDocs = await Document.find({ status: 'processed' }).populate('activeVersionId');
  }

  const candidates = [];

  for (const doc of activeDocs) {
    const version = doc.activeVersionId;
    if (!version || !version.chunks || version.chunks.length === 0) continue;

    for (const chunk of version.chunks) {
      // 1. Semantic Cosine Similarity
      let semanticScore = 0;
      if (chunk.embedding && chunk.embedding.length > 0) {
        semanticScore = calculateCosineSimilarity(queryEmbedding, chunk.embedding);
      }

      // 2. Keyword Match Score
      const keywordScore = calculateKeywordScore(query, chunk.text, chunk.keywords || []);

      // 3. Combined Hybrid Score (Give high priority if keywords explicitly match)
      let hybridScore = semanticScore * 0.5 + keywordScore * 0.5;
      if (keywordScore >= 0.5) {
        hybridScore = Math.max(hybridScore, 0.4 + keywordScore * 0.6);
      }

      candidates.push({
        documentId: doc._id.toString(),
        documentTitle: doc.title,
        versionNumber: version.versionNumber || 1,
        pageNumber: chunk.pageNumber || 1,
        chunkId: chunk.chunkId,
        text: chunk.text,
        semanticScore,
        keywordScore,
        rawScore: hybridScore,
      });
    }
  }

  // 4. Sort and Re-Rank
  candidates.sort((a, b) => b.rawScore - a.rawScore);
  const topCandidates = candidates.slice(0, 20);

  const reranked = topCandidates.map((chunk) => {
    const lengthPenalty = chunk.text.length < 40 ? 0.8 : 1.0;
    const finalScore = Math.min(1.0, chunk.rawScore * lengthPenalty);
    return {
      ...chunk,
      relevanceScore: Math.round(finalScore * 100),
    };
  });

  reranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const finalResults = reranked.slice(0, topK);

  console.log(`[SEARCH] Number of relevant results: ${finalResults.length}`);
  if (finalResults.length > 0) {
    console.log(`[SEARCH] Relevant document found: ${finalResults[0].documentTitle} (Page ${finalResults[0].pageNumber}, Relevance: ${finalResults[0].relevanceScore}%)`);
  }

  return finalResults;
};

module.exports = {
  calculateCosineSimilarity,
  calculateKeywordScore,
  generateEmbedding,
  searchHybridChunks,
};
