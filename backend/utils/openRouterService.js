const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const generateContent = async (messages, model = 'anthropic/claude-3-haiku') => {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    throw error;
  }
};

module.exports = { generateContent };