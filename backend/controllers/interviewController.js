const Quiz = require('../models/Quiz');
const { generateContent: generateGroqContent } = require('../utils/groqService');
const { generateContent: generateOpenRouterContent } = require('../utils/openRouterService');

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

    const prompt = `Generate 5-7 key subject areas or technical topics that are essential for a ${role} position interview preparation. Focus on core subjects like DBMS, Computer Networks, Operating Systems, OOP, Data Structures, etc. for technical roles, or relevant business/marketing topics for business roles.

Provide them as a JSON array of strings, like: ["DBMS", "Computer Networks", "Operating Systems", "OOP", "Data Structures & Algorithms"]`;

    let topics = [];
    try {
      const topicsText = await generateGroqContent(prompt);
      try {
        topics = JSON.parse(topicsText);
      } catch {
        topics = topicsText.split('\n').filter(t => t.trim()).slice(0, 7);
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

    const prompt = `Create a comprehensive, structured overview of the topic "${topic}" for someone preparing for a ${role} interview.
Include the following sections with detail:
1. Definition and core concepts
2. Importance of this topic for a ${role} role
3. Key subtopics or areas to master
4. Common interview questions (with example answers/high‑level approaches)
5. Practical preparation tips or exercises
6. Real world examples or scenarios where it matters
Use clear prose, headings, bullet points where appropriate, and aim for complete, efficient coverage.`;

    let content;
    try {
      content = await generateOpenRouterContent(prompt);
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      content = `**${topic} for ${role}**\n\n${topic} is an important concept in ${role} interviews. Focus on understanding the fundamentals, practicing with examples, and being able to explain your thought process clearly. Key areas to cover include core concepts, real-world applications, and common challenges. Practice explaining this topic in simple terms and provide examples from your experience.`;
    }

    res.json({ content, topic, role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const prompt = `Generate a quiz with 5 multiple choice questions for a ${role} interview. 
For each question, provide:
- Question text
- 4 options (A, B, C, D)
- Correct answer
Format as JSON array with objects containing: {question, options: [a,b,c,d], correctAnswer}`;

    let questions = [];
    try {
      const quizData = await generateGroqContent(prompt);
      questions = parseQuizData(quizData);
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      questions = generateMockQuestions(role);
    }

    const quiz = await Quiz.create({
      userId: req.userId,
      role,
      questions: questions.length > 0 ? questions : generateMockQuestions(role),
      total: Math.max(questions.length, 5),
    });

    res.json({ quiz });
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
    quiz.questions.forEach((q, index) => {
      q.userAnswer = userAnswers[index] || '';
      if (q.correctAnswer.toLowerCase() === q.userAnswer.toLowerCase()) {
        score++;
      }
    });

    quiz.score = score;
    await quiz.save();

    res.json({ message: 'Quiz submitted', score, total: quiz.total });
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