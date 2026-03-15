const { generateContent: generateGroqContent } = require('../utils/groqService');

const generateInterviewTopics = async (req, res) => {
  try {
    const { role, jdText } = req.body;
    const userId = req.userId;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const resume = await Resume.findOne({ userId });

    // Generate topics based on role and JD
    const prompt = jdText
      ? `Based on this job description and resume, suggest 8-10 highly specific and unique interview topics the candidate should prepare for. Organize them by difficulty (Beginner, Intermediate, Advance). Make topics tailored to the ${role} role and avoid generic ones unless directly relevant. Ensure variety and specificity.

Job Description:
${jdText}

Resume Skills:
${resume?.resumeText || 'N/A'}

Format exactly as:
BEGINNER:
- Topic 1
- Topic 2
...
INTERMEDIATE:
- Topic 1
...
ADVANCE:
- Topic 1
...`
      : `For a ${role} position, suggest 8-10 highly specific and unique interview preparation topics. Organize them by difficulty level (Beginner, Intermediate, Advance). Make topics tailored to the ${role} role and ensure they vary based on typical requirements for this position. Avoid generic topics.

Format exactly as:
BEGINNER:
- Topic 1
- Topic 2
...
INTERMEDIATE:
- Topic 1
...
ADVANCE:
- Topic 1
...`;

    const topicsResponse = await generateGroqContent([{ role: 'user', content: prompt }]);
    const topics = parseTopics(topicsResponse);

    res.json({
      topics,
      role,
      jdBased: !!jdText,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateCourseContent = async (req, res) => {
  try {
    const { topic, role, difficulty, jdText } = req.body;
    const userId = req.userId;

    if (!topic || !role || !difficulty) {
      return res.status(400).json({ message: 'Topic, role, and difficulty are required' });
    }

    // Generate course content
    const prompt = jdText
      ? `Create a comprehensive ${difficulty} level course on "${topic}" for someone preparing for a ${role} position based on this job description:
${jdText}

Include detailed explanations for each concept:
1. Key Concepts & Definitions (explain each with examples)
2. Important Points & Best Practices (with real scenarios)
3. Real-world Examples (specific to ${role})
4. Common Interview Questions on this topic (with sample answers)
5. Practice Tips (hands-on exercises)

Make it detailed and beginner-friendly if Beginner level, intermediate if Intermediate, advanced if Advance. Ensure content is tailored to the ${role} role.`
      : `Create a comprehensive ${difficulty} level course on "${topic}" for a ${role} interview preparation.

Include detailed explanations for each concept:
1. Key Concepts & Definitions (explain each with examples)
2. Important Points & Best Practices (with real scenarios)
3. Real-world Examples (specific to ${role})
4. Common Interview Questions on this topic (with sample answers)
5. Practice Tips (hands-on exercises)

Make it detailed and beginner-friendly if Beginner level, intermediate if Intermediate, advanced if Advance. Ensure content is tailored to the ${role} role.`;

    const content = await generateGroqContent([{ role: 'user', content: prompt }]);

    // Save course module
    const courseModule = await CourseModule.create({
      userId,
      role,
      topic,
      difficulty,
      content,
      jdBased: !!jdText,
    });

    res.json({
      courseModule,
      content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQuizForTopic = async (req, res) => {
  try {
    const { topic, role, difficulty } = req.body;
    const userId = req.userId;

    if (!topic || !role) {
      return res.status(400).json({ message: 'Topic and role are required' });
    }

    // Check already asked questions for this topic
    const askedQuestions = await QuizQuestion.find({ userId, role, topic });
    const askedCount = askedQuestions.length;

    // Generate new quiz questions (15-20 questions)
    const prompt = `Generate 15 unique multiple choice interview questions on "${topic}" for a ${role} role at ${difficulty} difficulty level. Ensure questions vary and are not repetitive.

Requirements:
- Each question should have 4 options (A, B, C, D)
- Include the correct answer
- Questions should be progressively harder
- Avoid repeating similar questions
- Make questions realistic for actual interviews

Return as JSON array with this format:
[
  {
    "question": "...",
    "options": ["A option", "B option", "C option", "D option"],
    "correctAnswer": "A option"
  }
]`;

    const quizDataText = await generateGroqContent(prompt);
    let questions = [];

    try {
      const jsonMatch = quizDataText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      questions = generateMockQuestions(topic, role);
    }

    // Save questions to database (track them)
    for (const q of questions) {
      await QuizQuestion.create({
        userId,
        role,
        topic,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty,
        askedCount: askedCount + 1,
      });
    }

    const quiz = await Quiz.create({
      userId,
      role,
      questions: questions,
      total: questions.length,
    });

    res.json({
      quiz,
      questionsCount: questions.length,
      previouslyAsked: askedCount,
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
    quiz.questions.forEach((q, index) => {
      q.userAnswer = userAnswers[index] || '';
      if (q.correctAnswer.toLowerCase() === q.userAnswer.toLowerCase()) {
        score++;
      }
    });

    quiz.score = score;
    await quiz.save();

    const percentage = Math.round((score / quiz.total) * 100);
    const feedback = percentage >= 80
      ? 'Excellent! You have a strong understanding of this topic.'
      : percentage >= 60
        ? 'Good effort! Review the weak areas and try again.'
        : 'Keep practicing! This topic needs more focus.';

    res.json({
      message: 'Quiz submitted',
      score,
      total: quiz.total,
      percentage,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseTopics = (text) => {
  const topics = { Beginner: [], Intermediate: [], Advance: [] };
  const lines = text.split('\n');

  let currentLevel = null;
  for (const line of lines) {
    if (line.includes('BEGINNER')) currentLevel = 'Beginner';
    else if (line.includes('INTERMEDIATE')) currentLevel = 'Intermediate';
    else if (line.includes('ADVANCE')) currentLevel = 'Advance';
    else if (line.trim().startsWith('-') && currentLevel) {
      topics[currentLevel].push(line.trim().substring(1).trim());
    }
  }

  return Object.values(topics).flat().length > 0
    ? Object.entries(topics).map(([level, items]) => ({ level, topics: items }))
    : getDefaultTopics();
};

const generateMockQuestions = (topic, role) => {
  return [
    {
      question: `What is the most important aspect of ${topic}?`,
      options: ['Understanding fundamentals', 'Memorizing facts', 'Fast execution', 'None of above'],
      correctAnswer: 'Understanding fundamentals',
    },
    {
      question: `How would you apply ${topic} in a ${role} role?`,
      options: ['Theory only', 'Practical implementation', 'Both theory and practice', 'It\'s not applicable'],
      correctAnswer: 'Both theory and practice',
    },
    {
      question: `What is a common challenge in ${topic}?`,
      options: ['Too complex', 'Lack of resources', 'Implementation issues', 'All of the above'],
      correctAnswer: 'All of the above',
    },
  ];
};

const getDefaultTopics = () => [
  { level: 'Beginner', topics: ['Fundamentals', 'Core Concepts', 'Basics'] },
  { level: 'Intermediate', topics: ['Advanced Concepts', 'Best Practices', 'Real-world Applications'] },
  { level: 'Advance', topics: ['Complex Scenarios', 'Edge Cases', 'Optimization'] },
];

module.exports = {
  generateInterviewTopics,
  generateCourseContent,
  generateQuizForTopic,
  submitQuiz,
};