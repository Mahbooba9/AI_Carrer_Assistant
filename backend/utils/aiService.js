const axios = require('axios');

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models/mistral-community/Mistral-7B-Instruct-v0.1/v1/chat/completions';

const generateAIContent = async (prompt) => {
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: "You are a professional AI Career Coach. IMPORTANT: Be extremely concise. For greetings like 'Hi', 'Hello', or 'Hey', respond ONLY with a short, one-sentence greeting (e.g., 'Hello! How can I help with your career today?'). Do not list features unless specifically asked. Only provide detailed advice when the user asks a specific career-related question. Maintain a strictly professional, career-focused scope. Do not discuss non-career topics like movies or games."
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback mock response
    return generateMockResponse(prompt);
  }
};

const generateMockResponse = (prompt) => {
  if (prompt.includes('resume')) {
    return `## Resume Improvements\n\n1. **Add quantifiable achievements** - Include metrics and percentages\n2. **Use action verbs** - Started, Developed, Implemented, Led\n3. **Highlight technical skills** - Better organize programming languages\n4. **Focus on impact** - Show business value of your work\n5. **Keep it concise** - One page for entry-level, two for senior\n\n### Missing Skills:\n- Advanced SQL optimization\n- Cloud architecture (AWS/GCP)\n- Leadership experience\n\n### Improved Bullet Points:\n- "Developed scalable backend systems using Node.js and MongoDB, improving response time by 40%"\n- "Led team of 3 developers in implementing microservices architecture"\n- "Optimized database queries reducing load time from 5s to 0.8s"`;
  }

  if (prompt.includes('interview')) {
    return `## Interview Preparation Guide\n\n### Key Topics:\n1. System Design\n2. Data Structures & Algorithms\n3. Database Design\n4. API Development\n5. Performance Optimization\n\n### Sample Questions:\n1. How would you design a URL shortening service?\n2. Explain the difference between SQL and NoSQL\n3. What is a microservice architecture?\n4. How do you optimize database queries?\n5. Describe the OAuth 2.0 flow\n\n### Tips:\n- Practice coding problems on LeetCode\n- Prepare system design questions using the STAR method\n- Practice mock interviews\n- Research the company thoroughly`;
  }

  return `AI Response: The requested content has been generated.`;
};

module.exports = { generateAIContent };