const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

/**
 * Lazily initialize the Gemini client so the server doesn't crash when
 * the API key isn't configured yet.
 */
const getModel = () => {
  if (model) return model;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Get one at https://aistudio.google.com/apikey and add it to your .env file.'
    );
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  return model;
};

// ─── Generate Quiz Questions from a Topic ────────────────────────────────────
/**
 * Uses Gemini to generate quiz questions on a given topic.
 *
 * @param {string} topic - The subject/topic for the quiz (e.g. "JavaScript closures")
 * @param {number} count - Number of questions to generate (1–20)
 * @param {string} difficulty - "easy" | "medium" | "hard"
 * @returns {Promise<Array>} Array of question objects matching our Quiz schema
 */
const generateQuizQuestions = async (topic, count = 5, difficulty = 'medium') => {
  const gemini = getModel();

  const prompt = `You are an expert quiz creator for an EdTech platform called 4Bit Labs.

Generate exactly ${count} multiple-choice quiz questions about: "${topic}"
Difficulty level: ${difficulty}

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no code fences, no explanation.

Each question object must have this exact structure:
{
  "question": "The question text",
  "options": [
    { "key": "A", "text": "Option A text" },
    { "key": "B", "text": "Option B text" },
    { "key": "C", "text": "Option C text" },
    { "key": "D", "text": "Option D text" }
  ],
  "correctAnswer": "A",
  "explanation": "Brief explanation of why this is correct",
  "points": 10
}

Rules:
- Each question MUST have exactly 4 options (A, B, C, D)
- correctAnswer must be one of "A", "B", "C", "D"
- Make questions educational and accurate
- Vary the correct answer positions (don't always use A)
- For "${difficulty}" difficulty: ${{
    easy: 'focus on basic concepts, definitions, and simple recall',
    medium: 'mix conceptual understanding with practical application',
    hard: 'test deep understanding, edge cases, and advanced concepts',
  }[difficulty] || 'mix conceptual understanding with practical application'}
- points should be 10 for easy, 15 for medium, 20 for hard`;

  const result = await gemini.generateContent(prompt);
  const text = result.response.text().trim();

  // Parse the response — strip markdown fences if present
  let cleaned = text;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('Gemini response parse failed. Raw text:', text);
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // Validate structure
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('AI returned empty or invalid question array.');
  }

  // Sanitize & enforce schema
  return questions.map((q, i) => ({
    question: q.question || `Question ${i + 1}`,
    options: (q.options || []).slice(0, 4).map((opt) => ({
      key: opt.key || ['A', 'B', 'C', 'D'][i % 4],
      text: opt.text || '',
    })),
    correctAnswer: ['A', 'B', 'C', 'D'].includes(q.correctAnswer) ? q.correctAnswer : 'A',
    explanation: q.explanation || '',
    points: q.points || { easy: 10, medium: 15, hard: 20 }[difficulty] || 10,
  }));
};

// ─── Generate Quiz Title & Description ───────────────────────────────────────
/**
 * Generate a catchy quiz title and description from the topic.
 */
const generateQuizMeta = async (topic, difficulty) => {
  const gemini = getModel();

  const prompt = `Generate a short quiz title and 1-sentence description for a ${difficulty} quiz about "${topic}".
Respond ONLY with JSON: { "title": "...", "description": "..." }
No markdown, no code fences.`;

  const result = await gemini.generateContent(prompt);
  let text = result.response.text().trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      title: `${topic} Quiz`,
      description: `Test your knowledge of ${topic} with this ${difficulty} quiz.`,
    };
  }
};

module.exports = { generateQuizQuestions, generateQuizMeta };
