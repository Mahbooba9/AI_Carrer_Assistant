import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResumeImprover() {
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [improvements, setImprovements] = useState('');
  const [currentSkills, setCurrentSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJDUpload, setShowJDUpload] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'https://ai-carrer-assistant.onrender.com/api';

  const handleImprove = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/resume/improve`,
        {
          role,
          jdText: jdText || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setImprovements(response.data.improvements);
      setCurrentSkills(response.data.currentSkills || []);
    } catch (err) {
      console.error('Error:', err.response?.data?.message || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800">✨ Resume Improver</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="card mb-8">
          <form onSubmit={handleImprove} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter target job role"
                className="input-field flex-1"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Analyzing...' : 'Get Suggestions'}
              </button>
            </div>

            {/* JD Toggle */}
            <button
              type="button"
              onClick={() => setShowJDUpload(!showJDUpload)}
              className="btn btn-secondary w-full"
            >
              {showJDUpload ? 'Hide JD Upload' : '+ Paste Job Description (Optional)'}
            </button>

            {/* JD Textarea */}
            {showJDUpload && (
              <textarea
                placeholder="Paste the job description here for more targeted suggestions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}
          </form>
        </div>

        {/* Current Skills */}
        {currentSkills.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Current Skills</h2>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded-full"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {improvements && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {jdText ? '📋 JD-Based Suggestions' : '🎯 AI-Powered Suggestions'}
            </h2>
            <div className="prose prose-sm max-w-none space-y-4">
              {improvements.split('\n').map((line, idx) => {
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
          </div>
        )}
      </main>
    </div>
  );
}