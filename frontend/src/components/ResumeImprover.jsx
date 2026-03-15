import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResumeScanner() {
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [results, setResults] = useState(null);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJDUpload, setShowJDUpload] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(
        '/resume/improve',
        { role, jdText: jdText || null }
      );
      setResults(response.data.scannerResults);
      setCurrentSkills(response.data.currentSkills || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderImprovementSummary = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, idx) => {
      if (line.trim() === '') return null;
      if (line.trim().match(/^\d+\./) || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={idx} className="ml-4 mb-2 text-slate-700">{line.replace(/^(\d+\.|[-*])\s*/, '')}</li>;
      }
      return <p key={idx} className="text-slate-700 mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">ATS Resume Scanner</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Inputs & Skills */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Optimization Criteria</h2>
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ML Engineer" 
                    className="glass-input w-full"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                
                <div>
                  <button type="button" onClick={() => setShowJDUpload(!showJDUpload)} className="text-indigo-600 text-xs font-bold hover:underline mb-2">
                    {showJDUpload ? '- Remove Job Description' : '+ Add Job Description'}
                  </button>
                  {showJDUpload && (
                    <textarea 
                      placeholder="Paste JD for targeted analysis..." 
                      className="glass-input w-full h-40 resize-none text-sm"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !role} 
                  className="btn-premium btn-premium-primary w-full"
                >
                  {loading ? 'Scanning...' : 'Scan Resume'}
                </button>
              </form>
            </div>

            {/* Detected Skills */}
            <div className="glass-card">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Detected Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentSkills.length > 0 ? currentSkills.map((skill, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 italic">
                    # {skill}
                  </span>
                )) : <p className="text-xs text-slate-400">No skills detected yet. Upload your resume.</p>}
              </div>
            </div>
          </div>

          {/* Right Panel: Scanner Results */}
          <div className="lg:col-span-8">
            {!results && !loading && (
              <div className="glass-card h-full flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-800">Ready to Scan?</h3>
                <p className="text-slate-500 max-w-xs mt-2">Enter your target role to get matches, identified gaps, and keywords.</p>
              </div>
            )}

            {loading && (
              <div className="glass-card h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-600 font-bold animate-pulse">Scanning your resume against industry standards...</p>
              </div>
            )}

            {results && !loading && (
              <div className="space-y-6 animate-fade-in">
                {/* Score Section */}
                <div className="glass-card">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Scan Results</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency: A+</span>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span>Match Percentage</span>
                      <span className={`${results.matchPercentage > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{results.matchPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${results.matchPercentage > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${results.matchPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <p className="text-indigo-900 text-sm font-medium leading-relaxed italic">
                      <span className="font-bold mr-2">Match Summary:</span> {results.matchSummary}
                    </p>
                  </div>
                </div>

                {/* Skills Checklists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills */}
                  <div className="glass-card">
                    <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                       Matching Skills
                    </h3>
                    <div className="space-y-3">
                      {results.matchingSkills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
                          <span className="text-emerald-500 font-bold text-lg">✓</span> {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Gaps */}
                  <div className="glass-card">
                    <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                       Missing Technical Skills
                    </h3>
                    <div className="space-y-3">
                      {results.missingTechnicalSkills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
                          <span className="text-rose-500 font-bold text-lg">✕</span> {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Soft Skills & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card">
                    <h3 className="text-sm font-black text-slate-900 mb-4">Missing Soft Skills</h3>
                    <div className="space-y-3">
                      {results.missingSoftSkills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <span className="text-rose-500 font-bold text-lg">✕</span> {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card">
                    <h3 className="text-sm font-black text-slate-900 mb-4">Education Match</h3>
                    <p className="text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {results.educationMatch}
                    </p>
                  </div>
                </div>

                {/* Keyword Analysis */}
                <div className="glass-card">
                  <h3 className="text-sm font-black text-slate-900 mb-4">Missing Keywords & Reason</h3>
                  <div className="space-y-4">
                    {results.missingKeywords.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <span className="text-rose-500 font-bold text-xl h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm">✕</span>
                        <div>
                          <p className="font-bold text-rose-600 uppercase text-xs tracking-widest">{item.keyword}</p>
                          <p className="text-sm text-slate-600 mt-1 font-medium">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Advice */}
                <div className="glass-card border-l-4 border-l-indigo-600">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Summary to Improve</h3>
                  <div className="prose-premium text-sm leading-relaxed">
                    {renderImprovementSummary(results.improvementSummary)}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button onClick={() => window.print()} className="btn-premium btn-premium-secondary">Export PDF</button>
                  <button onClick={() => setResults(null)} className="btn-premium btn-premium-primary">New Scan</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}