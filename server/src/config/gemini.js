const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini Config] Warning: GEMINI_API_KEY is not set or using default placeholder.');
  }
  return new GoogleGenerativeAI(apiKey || 'dummy-key-for-initialization');
};

module.exports = { getGeminiClient };
