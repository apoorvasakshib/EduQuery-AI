// Vector Store Configuration Abstraction
// Handles Pinecone or MongoDB Vector/Embedding Fallback Store

const getVectorConfig = () => {
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeIndex = process.env.PINECONE_INDEX || 'eduquery-index';

  return {
    provider: pineconeApiKey ? 'pinecone' : 'mongodb_fallback',
    pineconeApiKey,
    pineconeIndex,
  };
};

module.exports = { getVectorConfig };
