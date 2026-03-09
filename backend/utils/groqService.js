const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const generateContent = async (messages, model = 'llama3-8b-8192') => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        messages,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
};

module.exports = { generateContent };