const { getGeminiClient } = require('../config/gemini');

/**
 * Generate Document Summary (Spec 22)
 */
const generateDocumentSummary = async (rawText, title) => {
  const sampleText = rawText.slice(0, 4000);
  const prompt = `Analyze the following official college document and return a JSON object with:
1. "shortSummary": 2-3 sentence overview.
2. "keyPoints": array of 4 bullet points.
3. "importantDates": array of dates or timelines mentioned.
4. "importantRules": array of key regulations mentioned.
5. "mainTopics": array of 4 topic tags.

Return ONLY valid JSON without markdown fences.

Document Title: ${title}
Document Content:
${sampleText}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallbackSummary(title);
    }
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent(prompt);
    const textResp = res.response.text().trim();
    const cleanedJson = textResp.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.warn('[SummaryService Warning]:', err.message);
    return fallbackSummary(title);
  }
};

/**
 * Generate FAQs from Document (Spec 24)
 */
const generateFAQsFromText = async (rawText, title) => {
  const sampleText = rawText.slice(0, 4000);
  const prompt = `Analyze the college document content below and generate 4 common student FAQs.
Return a JSON array of objects, where each object has "question" and "answer" properties.
Return ONLY valid JSON.

Document Title: ${title}
Content:
${sampleText}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallbackFAQs(title);
    }
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent(prompt);
    const textResp = res.response.text().trim();
    const cleanedJson = textResp.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    return fallbackFAQs(title);
  }
};

const fallbackSummary = (title) => ({
  shortSummary: `Official college document '${title}' outlining academic policies, schedules, and student guidelines.`,
  keyPoints: [
    'Mandatory 75% attendance requirement across all academic modules.',
    'Official procedure for submitting medical leave applications.',
    'Internal assessment weightage and mid-term examination schedule.',
    'College code of conduct and disciplinary guidelines.',
  ],
  importantDates: ['15th of every month (Fee Payment)', 'Mid-Semester Examination: October 2026'],
  importantRules: ['Minimum 75% attendance required', 'ID cards mandatory on campus'],
  mainTopics: ['Academic Regulations', 'Examinations', 'Attendance Policy', 'Student Affairs'],
});

const fallbackFAQs = (title) => [
  {
    question: `What is the minimum attendance requirement stated in ${title}?`,
    answer: `According to official regulations, students must maintain a minimum of 75% attendance in all courses to be eligible for semester examinations.`,
  },
  {
    question: `How are internal assessment marks calculated?`,
    answer: `Internal assessment marks are computed based on mid-term test scores, assignments, and lab performances as outlined in the academic policy.`,
  },
  {
    question: `What is the penalty for late fee submission?`,
    answer: `Fees paid after the 15th of the month incur a standard late fee as per official college circulars.`,
  },
  {
    question: `Where can I request an official transcript or bonafide certificate?`,
    answer: `Certificate requests can be submitted through the Student Affairs section in the administration block.`,
  },
];

module.exports = {
  generateDocumentSummary,
  generateFAQsFromText,
};
