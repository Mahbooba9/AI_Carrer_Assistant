import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InterviewPrep() {
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [topics, setTopics] = useState([]);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [courseContent, setCourseContent] = useState('');
  const [showJDUpload, setShowJDUpload] = useState(false);
  const [step, setStep] = useState('input'); // input, topics, course, quiz
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://ai-carrer-assistant.onrender.com/api';

  const getToken = () => localStorage.getItem('token');

  const handleGenerateTopics = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/topics`,
        {
          role,
          jdText: jdText || null,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setTopics(response.data.topics || []);
      setStep('topics');
    } catch (err) {
      console.error('Error:', err.response?.data?.message || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic, difficulty) => {
    setSelectedTopic({ topic, difficulty });
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/topic-content`,
        {
          topic,
          role,
          difficulty,
          jdText: jdText || null,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setCourseContent(response.data.content || response.data.courseModule.content);
      setStep('course');
    } catch (err) {
      console.error('Error:', err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/quiz`,
        {
          topic: selectedTopic.topic,
          role,
          difficulty: selectedTopic.difficulty,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setQuiz(response.data.quiz);
      setAnswers(Array(response.data.quiz.questions.length).fill(''));
      setCurrentQuestion(0);
      setSubmitted(false);
      setStep('quiz');
    } catch (err) {
      console.error('Error:', err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interview/quiz/submit`,
        {
          quizId: quiz._id,
          userAnswers: answers,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      console.error('Error:', err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quiz Result Screen
  if (step === 'quiz' && submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Quiz Completed! 🎉</h1>
            <div className="text-6xl font-bold text-blue-600 mb-6">
              {result.score}/{result.total}
            </div>
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              {result.percentage}% Score
            </p>
            <p className="text-lg text-gray-600 mb-8">{result.feedback}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('course');
                  setSubmitted(false);
                }}
                className="btn btn-secondary flex-1"
              >
                Back to Course
              </button>
              <button
                onClick={() => {
                  setStep('topics');
                  setSelectedTopic(null);
                  setCourseContent('');
                }}
                className="btn btn-primary flex-1"
              >
                Select Another Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (step === 'quiz' && quiz && !submitted) {
    const question = quiz.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800">📝 Quiz</h1>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="card">
            <div className="mb-8">
              <div className="bg-gray-200 h-2 rounded-full mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">{question.question}</h2>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestion] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="mr-3"
                  />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4 justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="btn btn-secondary"
              >
                ← Previous
              </button>

              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary">
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Course Content Step
  if (step === 'course') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => setStep('topics')}
              className="text-blue-600 font-bold hover:underline mb-2"
            >
              ← Back to Topics
            </button>
            <h1 className="text-3xl font-bold text-gray-800">📖 {selectedTopic?.topic}</h1>
            <p className="text-gray-600">
              {selectedTopic?.difficulty && selectedTopic.difficulty !== 'General' && (
                <>{selectedTopic.difficulty} Level | </>
              )}Role: {role}
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="card mb-8">
            <div className="prose prose-sm max-w-none mb-8">
              {courseContent.split('\n').map((line, idx) => {
                if (line.trim() === '') return null;
                if (line.includes('###')) {
                  return (
                    <h3 key={idx} className="text-lg font-bold text-blue-600 mt-4">
                      {line.replace(/###/g, '').trim()}
                    </h3>
                  );
                }
                if (line.includes('##')) {
                  return (
                    <h2 key={idx} className="text-xl font-bold text-gray-800 mt-4">
                      {line.replace(/##/g, '').trim()}
                    </h2>
                  );
                }
                if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                  return (
                    <li key={idx} className="text-gray-700 ml-4">
                      {line.replace(/^[-*]\s/, '').trim()}
                    </li>
                  );
                }
                return (
                  <p key={idx} className="text-gray-700 whitespace-pre-wrap">
                    {line}
                  </p>
                );
              })}
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Generating Quiz...' : '✓ Completed! Start Quiz (15-20 questions)'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Topics Selection Step
  if (step === 'topics') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => setStep('input')}
              className="text-blue-600 font-bold hover:underline mb-2"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">📚 Select Topics to Study</h1>
            <p className="text-gray-600">Role: {role}</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {topics && topics.length > 0 ? (
            <div className="space-y-8">
              {typeof topics[0] === 'string' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic, tIdx) => (
                    <button
                      key={tIdx}
                      onClick={() => handleSelectTopic(topic, 'General')}
                      disabled={loading}
                      className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                    >
                      <p className="font-semibold text-gray-800">{topic}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {topics.map((levelGroup, idx) => (
                    <div key={idx} className="card">
                      <h2 className="text-2xl font-bold mb-4 text-blue-600">{levelGroup.level} Level</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {levelGroup.topics &&
                          levelGroup.topics.map((topic, tIdx) => (
                            <button
                              key={tIdx}
                              onClick={() => handleSelectTopic(topic, levelGroup.level)}
                              disabled={loading}
                              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                            >
                              <p className="font-semibold text-gray-800">{topic}</p>
                              <p className="text-sm text-gray-500">{levelGroup.level} difficulty</p>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No topics generated. Please try again.</p>
            </div>
          )}

          {/* Custom Topic Section */}
          <div className="card mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Or Enter Your Own Topic</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter a custom topic (e.g., React Hooks, SQL Joins)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSelectTopic(customTopic, 'Custom')}
                disabled={loading || !customTopic.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Input Step
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 font-bold hover:underline mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">🎓 Interview Preparation</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="card">
          <form onSubmit={handleGenerateTopics} className="space-y-4">
            <input
              type="text"
              placeholder="Enter job role (e.g., Data Analyst, Software Engineer)"
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowJDUpload(!showJDUpload)}
              className="btn btn-secondary w-full"
            >
              {showJDUpload ? '✕ Hide' : '+ Paste Job Description (Recommended)'}
            </button>

            {showJDUpload && (
              <textarea
                placeholder="Paste the job description for personalized topic recommendations..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}

            <button
              type="submit"
              disabled={loading || !role.trim()}
              className="btn btn-primary w-full"
            >
              {loading ? 'Generating Topics...' : 'Generate Interview Topics'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}