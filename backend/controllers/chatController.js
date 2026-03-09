const ChatMessage = require('../models/ChatMessage');
const { generateContent: generateGroqContent } = require('../utils/groqService');
const { generateContent: generateOpenRouterContent } = require('../utils/openRouterService');

const RESTRICTED_TOPICS = ['movie', 'film', 'actor', 'actress', 'cricket', 'sports', 'game', 'politics', 'celebrity', 'entertainment'];

const isCareerRelated = (question) => {
  const lowerQuestion = question.toLowerCase();
  return !RESTRICTED_TOPICS.some(topic => lowerQuestion.includes(topic));
};

const generateMockResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('resume')) {
    return 'Resume improvement tips: 1) Start with a strong summary highlighting your key achievements 2) Use quantifiable metrics (e.g., "Increased sales by 30%") 3) Tailor keywords to match job descriptions 4) Keep it to 1-2 pages 5) Include relevant certifications and projects. Use our Resume Improver tool for AI-powered suggestions!';
  }
  if (lowerQuestion.includes('interview')) {
    return 'Interview preparation: 1) Research the company and role thoroughly 2) Practice the STAR method for behavioral questions 3) Prepare technical questions based on your field 4) Have thoughtful questions ready for the interviewer 5) Practice with mock interviews. Check out our Interview Prep section for role-specific topics and quizzes!';
  }
  if (lowerQuestion.includes('job') || lowerQuestion.includes('search')) {
    return 'Job search strategies: 1) Update your LinkedIn profile and network actively 2) Customize applications for each role 3) Use job boards, company websites, and recruiters 4) Follow up on applications 5) Consider informational interviews. Our Job Search tool can help you find relevant positions!';
  }
  if (lowerQuestion.includes('career') || lowerQuestion.includes('growth')) {
    return 'Career development advice: 1) Set clear goals and create a development plan 2) Seek mentorship and feedback 3) Continuously learn new skills 4) Build a professional network 5) Track your achievements. What specific aspect of career growth interests you?';
  }
  if (lowerQuestion.includes('salary') || lowerQuestion.includes('negotiate')) {
    return 'Salary negotiation tips: 1) Research market rates for your role and location 2) Highlight your achievements and value 3) Practice your pitch 4) Consider total compensation package 5) Be prepared to walk away if needed. Know your worth!';
  }
  return 'I\'m here to help with career development! I can assist with resume writing, interview preparation, job search strategies, salary negotiation, and professional growth. What specific career topic would you like to discuss?';
};

const askBot = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.userId;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Check if question is career-related
    if (!isCareerRelated(question)) {
      return res.json({
        question,
        answer: "I'm specifically designed to help with career-related topics like resume building, job search, interview preparation, and professional development. I politely decline to discuss movies, entertainment, or other non-career topics. How can I help you with your career? 😊",
        isCareerRelated: false,
      });
    }

    // Get recent conversation history (last 3 messages)
    const recentMessages = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(3)
      .sort({ timestamp: 1 });

    // Build structured messages for OpenRouter/Groq
    const systemPrompt = `You are a Professional AI Career Coach. 
Requirements:
- Only answer career-related questions (resumes, interviews, job search, professional growth).
- Use **bold** for emphasis.
- Use bullet points for lists.
- Be extremely concise and professional.
- No filler or conversational fluff unless it's a greeting.
- If a question is not career-related, politely decline and steer back to careers.`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    recentMessages.forEach(msg => {
      messages.push({ role: 'user', content: msg.question });
      messages.push({ role: 'assistant', content: msg.answer });
    });

    // Add current question
    messages.push({ role: 'user', content: question });

    // Build contents for Gemini-style APIs
    const geminiContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I will act as a Professional AI Career Coach with the specified requirements." }] }
    ];
    recentMessages.forEach(msg => {
      geminiContents.push({ role: 'user', parts: [{ text: msg.question }] });
      geminiContents.push({ role: 'model', parts: [{ text: msg.answer }] });
    });
    geminiContents.push({ role: 'user', parts: [{ text: question }] });

    let answer = '';
    try {
      console.log('Fetching AI response...');
      // Use messages for OpenRouter/Groq, contents for Gemini
      answer = await generateOpenRouterContent(messages);
      if (!answer) throw new Error('Empty response from OpenRouter');
    } catch (apiError) {
      console.error('OpenRouter Failure:', apiError.message);
      try {
        answer = await generateGroqContent(messages);
        if (!answer) throw new Error('Empty response from Groq');
      } catch (groqError) {
        console.error('Groq Failure:', groqError.message);
        try {
          // Gemini as a third fallback
          const { generateContent: generateGeminiContent } = require('../utils/geminiService');
          answer = await generateGeminiContent(geminiContents);
        } catch (geminiError) {
          console.error('Gemini Failure:', geminiError.message);
          answer = generateMockResponse(question);
        }
      }
    }

    // Ensure answer is a string and not empty
    answer = String(answer || generateMockResponse(question));

    // Save with error protection
    let chatMessage;
    try {
      chatMessage = await ChatMessage.create({
        userId,
        question,
        answer,
        isCareerRelated: true,
      });
    } catch (dbError) {
      console.error('Database Save Error:', dbError.message);
      // Fallback message object for response
      chatMessage = { timestamp: new Date(), _id: 'temp-id' };
    }

    res.json({
      question,
      answer,
      isCareerRelated: true,
      timestamp: chatMessage.timestamp,
      messageId: chatMessage._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;

    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .sort({ timestamp: 1 }); // Return in chronological order

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { askBot, getChatHistory };