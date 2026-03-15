import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  const getToken = () => localStorage.getItem('token');

  const handleGenerateTopics = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(
        '/interview/topics',
        { role, jdText: jdText || null }
      );
      setTopics(response.data.topics || []);
      setStep('topics');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const response = await api.post(
        '/interview/topic-content',
        { topic, role }
      );
      setCourseContent(response.data.content);
      setStep('course');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        '/interview/quiz',
        { topic: selectedTopic, role, content: courseContent }
      );
      setQuiz(response.data.quiz);
      setAnswers(Array(response.data.quiz.questions.length).fill(''));
      setCurrentQuestion(0);
      setSubmitted(false);
      setStep('quiz');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        '/interview/quiz/submit',
        { quizId: quiz._id, userAnswers: answers }
      );
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render content with premium markdown-like styling
  const renderContent = (content) => {
    return content.split('\n').map((line, idx) => {
      if (line.trim() === '') return <br key={idx} />;
      if (line.startsWith('# ')) return <h1 key={idx} className="text-4xl font-bold text-indigo-900 mt-8 mb-4 border-b pb-2">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-indigo-800 mt-6 mb-3">{line.substring(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-indigo-700 mt-4 mb-2">{line.substring(4)}</h3>;
      if (line.startsWith('**')) return <p key={idx} className="font-semibold text-indigo-900 mb-2">{line.replace(/\*\*/g, '')}</p>;
      if (line.trim().match(/^\d+\./)) return <p key={idx} className="ml-4 mb-2 text-slate-700"><span className="font-bold text-indigo-600">{line.split('.')[0]}.</span> {line.split('.').slice(1).join('.')}</p>;
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={idx} className="ml-6 mb-2 text-slate-700 list-disc">{line.replace(/^[-*]\s*/, '')}</li>;
      }
      return <p key={idx} className="text-slate-700 mb-4 leading-relaxed">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 font-medium animate-pulse">Generating your premium preparation material...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => step === 'input' ? navigate('/dashboard') : step === 'topics' ? setStep('input') : setStep('topics')} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">AI Interview Master</h1>
          </div>
          {role && <div className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{role}</div>}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        {step === 'input' && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Master Your Next Interview</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Get exhaustive "A to Z" preparation modules, top 50 questions, and interactive quizzes tailored to your target role.</p>
            </div>
            
            <div className="glass-card max-w-2xl mx-auto">
              <form onSubmit={handleGenerateTopics} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Software Engineer" 
                    className="glass-input w-full text-lg"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                
                <div className="pt-2">
                  <button type="button" onClick={() => setShowJDUpload(!showJDUpload)} className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1">
                    {showJDUpload ? 'Remove Job Description' : '+ Add Job Description for better accuracy'}
                  </button>
                  {showJDUpload && (
                    <textarea 
                      placeholder="Paste the job description here..." 
                      className="glass-input w-full mt-3 h-40 resize-none text-sm"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                  )}
                </div>

                <button type="submit" disabled={!role} className="btn-premium btn-premium-primary w-full text-lg">
                  Generate Curriculum
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'topics' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">📚</span>
              Recommended Learning Path
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t, i) => (
                <button key={i} onClick={() => handleSelectTopic(t)} className="glass-card text-left hover:border-indigo-400 group">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{t}</span>
                    <span className="text-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">→</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Comprehensive A-Z module with 50+ questions</p>
                </button>
              ))}
            </div>
            
            <div className="mt-10 pt-10 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Want something specific?</h3>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Enter any topic (e.g. System Design, React)" 
                  className="glass-input flex-1"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                />
                <button onClick={() => handleSelectTopic(customTopic)} disabled={!customTopic} className="btn-premium btn-premium-accent whitespace-nowrap">
                  Build Custom Module
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'course' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="glass-card mb-10 overflow-hidden !p-0">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
                <span className="text-indigo-200 text-sm font-bold tracking-widest uppercase">Intensive Module</span>
                <h2 className="text-3xl font-bold mt-2">{selectedTopic}</h2>
              </div>
              <div className="p-8 prose-premium">
                {renderContent(courseContent)}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-200">
                <div className="bg-indigo-900 text-white p-6 rounded-2xl flex items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xl font-bold">Ready to test your knowledge?</h4>
                    <p className="text-indigo-200 text-sm mt-1">Take a personalized quiz based on the 50 questions and content above.</p>
                  </div>
                  <button onClick={handleStartQuiz} className="btn-premium bg-white text-indigo-900 hover:bg-slate-100 whitespace-nowrap">
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'quiz' && !submitted && (
          <div className="animate-fade-in max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Self-Assessment</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Question {currentQuestion + 1} of {quiz?.questions.length}</h2>
            </div>
            
            <div className="glass-card text-left">
              <p className="text-xl font-bold text-slate-800 mb-8">{quiz?.questions[currentQuestion].question}</p>
              <div className="space-y-4">
                {quiz?.questions[currentQuestion].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      const newAns = [...answers];
                      newAns[currentQuestion] = opt;
                      setAnswers(newAns);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      answers[currentQuestion] === opt 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-200' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="inline-block w-8 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-10">
                <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(v => v -1)} className="text-slate-500 font-bold hover:text-indigo-600 disabled:opacity-30">Previous</button>
                {currentQuestion === quiz.questions.length - 1 ? (
                  <button onClick={handleSubmitQuiz} className="btn-premium btn-premium-primary">Submit Final Answers</button>
                ) : (
                  <button onClick={() => setCurrentQuestion(v => v + 1)} className="btn-premium btn-premium-primary">Next Question</button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'quiz' && submitted && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="glass-card text-center p-12">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🏆</div>
              <h2 className="text-3xl font-bold text-slate-900">Quiz Results</h2>
              <div className="text-6xl font-black text-indigo-600 my-6">{result?.score} <span className="text-2xl text-slate-400 font-medium">/ {result?.total}</span></div>
              
              <div className="text-left bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8">
                <h4 className="font-bold text-indigo-900 mb-3">Improvement Analysis</h4>
                <div className="text-sm text-indigo-800 prose prose-sm max-w-none">
                  {renderContent(result?.improvementSuggestions || 'Keep practicing!')}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('course')} className="btn-premium btn-premium-secondary flex-1">Back to Content</button>
                <button onClick={() => setStep('topics')} className="btn-premium btn-premium-primary flex-1">Try Another Topic</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}