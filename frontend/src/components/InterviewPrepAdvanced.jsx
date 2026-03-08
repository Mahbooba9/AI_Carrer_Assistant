import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InterviewPrepAdvanced() {
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [courseContent, setCourseContent] = useState('');
  const [showJDUpload, setShowJDUpload] = useState(false);
  const [step, setStep] = useState('input'); // input, topics, course, quiz
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://ai-carrer-assistant.onrender.com/api';

  const handleGenerateTopics = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/interview-advanced/topics`,
        {
          role,
          jdText: jdText || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTopics(response.data.topics || []);
      setStep('topics');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic, difficulty) => {
    setSelectedTopic({ topic, difficulty });
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/interview-advanced/course`,
        {
          topic,
          role,
          difficulty,
          jdText: jdText || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCourseContent(response.data.content || response.data.courseModule.content);
      setStep('course');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/interview-advanced/quiz-questions`,
        {
          topic: selectedTopic.topic,
          role,
          difficulty: selectedTopic.difficulty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQuiz(response.data.quiz);
      setQuizStarted(true);
      setStep('quiz');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Input Step
  if (step === 'input') {
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
            <h1 className="text-3xl font-bold text-gray-800">🎓 Interview Preparation (Advanced)</h1>
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
              {topics.map((levelGroup, idx) => (
                <div key={idx} className="card">
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">{levelGroup.level} Level</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {levelGroup.topics && levelGroup.topics.map((topic, tIdx) => (
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
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No topics generated. Please try again.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Course Content Step
  if (step === 'course') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => setStep('topics')}
              className="text-blue-600 font-bold hover:underline mb-2"
            >
              ← Back to Topics
            </button>
            <h1 className="text-3xl font-bold text-gray-800">📖 {selectedTopic?.topic}</h1>
            <p className="text-gray-600">{selectedTopic?.difficulty} Level | Role: {role}</p>
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

  return null;
}