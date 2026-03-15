const { generateContent: generateGroqContent } = require('../utils/groqService');
const Quiz = require('../models/Quiz');

const getMockTopics = (role) => {
  const topicMap = {
    'Software Engineer': [
      'Database Management Systems (DBMS)',
      'Computer Networks',
      'Operating Systems',
      'Object Oriented Programming (OOP)',
      'Data Structures & Algorithms'
    ],
    'Product Manager': [
      'Product Strategy',
      'Market Analysis',
      'User Interviews',
      'Metrics & Analytics',
      'Roadmapping'
    ],
    'Data Scientist': [
      'Machine Learning Basics',
      'Statistics & Probability',
      'Data Preprocessing',
      'Model Evaluation',
      'Python/SQL'
    ],
    'DevOps Engineer': [
      'CI/CD Pipelines',
      'Kubernetes',
      'Docker',
      'Cloud Infrastructure',
      'Monitoring & Logging'
    ],
  };
  
  return topicMap[role] || ['Technical Skills', 'Problem Solving', 'Communication', 'Project Management', 'Teamwork'];
};

const generateInterviewTopics = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const seKeywords = ['software', 'developer', 'engineer', 'frontend', 'backend', 'fullstack', 'coder', 'programming'];
    const isSERole = seKeywords.some(kw => role.toLowerCase().includes(kw));

    const prompt = `Generate 5-7 key foundational subject areas or technical topics that are essential for a ${role} position interview preparation. 
    ${isSERole ? `As this is a software-related role, you MUST include core CS subjects:
    - Data Structures and Algorithms (DSA)
    - Database Management Systems (DBMS)
    - Operating Systems (OS)
    - Computer Networks (CN)
    - Object-Oriented Programming (OOP)` : 'Focus on core subjects or industry-standard domains for this role.'}
    
    Provide them as a JSON array of strings, like: ["DBMS", "Computer Networks", "Operating Systems", "OOP", "Data Structures & Algorithms"]. 
    Return ONLY the JSON array.`;

    let topics = [];
    try {
      const messages = [{ role: 'user', content: prompt }];
      const topicsText = await generateGroqContent(messages, 'llama3-70b-8192');
      const jsonMatch = topicsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        topics = topicsText.split('\n').filter(t => t.trim().length > 3).slice(0, 7);
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      topics = getMockTopics(role);
    }

    res.json({ topics, role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateTopicContent = async (req, res) => {
  try {
    const { topic, role } = req.body;

    if (!topic || !role) {
      return res.status(400).json({ message: 'Topic and role are required' });
    }

    const prompt = `Create an exhaustive, "A to Z" comprehensive guide for the topic "${topic}" for a ${role} candidate. 
    The guide must cover EVERYTHING from basic definitions to highly advanced concepts.
    
    Structure it exactly as follows:
    1. **Fundamental Overview**: Basic definition and core principles.
    2. **Core Concepts (A to Z)**: Detailed breakdown of all major sub-topics related to ${topic}. Explain them clearly and deeply.
    3. **Implementation & Practicality**: How this is used in real-world ${role} scenarios.
    4. **Advanced Scenarios**: Edge cases, optimization, and complex problem-solving related to ${topic}.
    5. **Top 50 Interview Questions**: List 50 critical interview questions (categorized by difficulty: Basic, Intermediate, Advanced) that could be asked about ${topic}. Provide high-level hints/key points for the answers.
    6. **Preparation Checklist**: A step-by-step guide to mastering this topic.

    Use professional markdown, clear headings, and be extremely detailed. This should be the only resource the candidate needs for this topic.`;

    let content;
    try {
      const messages = [{ role: 'user', content: prompt }];
      content = await generateGroqContent(messages, 'llama3-70b-8192');
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      content = `**${topic} for ${role}**\n\nERROR: ${apiError.message}. Fallback triggered. Please check if your GROQ_API_KEY has access to the model.`;
    }

    res.json({ content, topic, role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { role, topic, content } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const context = content ? `based on this specific content: ${content.substring(0, 2000)}` : `for the topic ${topic || 'Interview Prep'}`;

    const prompt = `Generate a rigorous quiz with 5 multiple choice questions for a ${role} candidate ${context}. 
    Ensure the questions are challenging and cover key concepts.
    
    For each question, provide:
    - Question text
    - 4 options (A, B, C, D)
    - Correct answer
    Format as ONLY a JSON array with objects containing: {question, options: [a,b,c,d], correctAnswer}`;

    let questions = [];
    try {
      const messages = [{ role: 'user', content: prompt }];
      const quizData = await generateGroqContent(messages, 'llama3-70b-8192');
      questions = parseQuizData(quizData);
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      questions = generateMockQuestions(role);
    }

    const quiz = await Quiz.create({
      userId: req.userId,
      role: topic || role,
      questions: questions.length > 0 ? questions : generateMockQuestions(role),
      total: Math.max(questions.length, 5),
    });

    res.json({ 
      quiz,
      debugError: questions.length === 0 ? 'Questions array was empty, used mock data' : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, userAnswers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    let feedbackPrompt = `The user took a quiz on ${quiz.role} and scored ${score}/${quiz.total}. 
    Here are the questions and their answers:
    `;

    quiz.questions.forEach((q, index) => {
      q.userAnswer = userAnswers[index] || '';
      const isCorrect = q.correctAnswer.toLowerCase() === q.userAnswer.toLowerCase();
      if (isCorrect) {
        score++;
      }
      feedbackPrompt += `\nQ: ${q.question}\nCorrect Ans: ${q.correctAnswer}\nUser Ans: ${q.userAnswer}\nResult: ${isCorrect ? 'Correct' : 'Incorrect'}`;
    });

    feedbackPrompt += `\n\nBased on these results, provide a brief, constructive "Area for Improvement" report (3-4 bullet points) to help the user master this topic.`;

    let improvementSuggestions = "Keep practicing and review the core concepts of " + quiz.role;
    try {
      const messages = [{ role: 'user', content: feedbackPrompt }];
      improvementSuggestions = await generateGroqContent(messages);
    } catch (apiError) {
      console.error('Feedback Gen Error:', apiError);
    }

    quiz.score = score;
    quiz.improvementSuggestions = improvementSuggestions;
    await quiz.save();

    res.json({ message: 'Quiz submitted', score, total: quiz.total, improvementSuggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractTopics = (text) => {
  const topics = [
    'System Design',
    'Data Structures',
    'SQL & Databases',
    'API Development',
    'Problem Solving',
  ];
  return topics;
};

const extractTips = (text) => {
  const tips = [
    'Practice coding problems daily',
    'Prepare system design questions',
    'Research the company thoroughly',
    'Practice mock interviews',
    'Get good sleep before interview',
  ];
  return tips;
};

const parseQuizData = (text) => {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateMockQuestions();
  } catch {
    return generateMockQuestions();
  }
};

const generateMockQuestions = (role = 'General') => {
  return [
    {
      question: 'What is the most important skill for a ' + role + '?',
      options: ['Communication', 'Problem Solving', 'Technical Knowledge', 'Leadership'],
      correctAnswer: 'Problem Solving',
    },
    {
      question: 'How do you handle tight deadlines?',
      options: ['Rush through', 'Prioritize tasks', 'Ask for extension', 'Ignore'],
      correctAnswer: 'Prioritize tasks',
    },
    {
      question: 'What motivates you in your work?',
      options: ['Salary', 'Learning', 'Power', 'Vacation'],
      correctAnswer: 'Learning',
    },
    {
      question: 'How do you stay updated with industry trends?',
      options: ['Social media', 'Courses and blogs', 'Nothing', 'Gossip'],
      correctAnswer: 'Courses and blogs',
    },
    {
      question: 'Describe your greatest professional achievement.',
      options: [
        'Large project completion',
        'Team leadership',
        'Problem solving',
        'All of above',
      ],
      correctAnswer: 'All of above',
    },
  ];
};

module.exports = {
  generateInterviewTopics,
  generateTopicContent,
  generateQuiz,
  submitQuiz,
};