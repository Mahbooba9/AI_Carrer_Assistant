import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JobSearch() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experience, setExperience] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.post(
        '/jobs/search',
        {
          jobTitle,
          location,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          experience: experience || null,
          company: company || null,
          skills: skills ? skills.split(',').map(s => s.trim()) : null,
        }
      );

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error:', err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Opportunity Finder</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {/* Search & Filter Section */}
        <div className="glass-card mb-10 overflow-hidden !p-0">
          <div className="p-8 border-b border-slate-100">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Job Title (e.g., Lead AI Engineer)"
                    className="glass-input w-full pl-12 text-lg"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-premium btn-premium-primary px-10">
                  {loading ? 'Searching...' : 'Find Jobs'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-premium btn-premium-secondary whitespace-nowrap"
                >
                  {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                    <input type="text" className="glass-input w-full text-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Min Salary (USD)</label>
                    <input type="number" className="glass-input w-full text-sm" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Max Salary (USD)</label>
                    <input type="number" className="glass-input w-full text-sm" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Experience</label>
                    <input type="text" placeholder="e.g. entry-level" className="glass-input w-full text-sm" value={experience} onChange={(e) => setExperience(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                    <input type="text" className="glass-input w-full text-sm" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Required Skills (Optional)</label>
                    <input type="text" placeholder="comma-separated" className="glass-input w-full text-sm" value={skills} onChange={(e) => setSkills(e.target.value)} />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Results Info */}
        {searched && !loading && (
          <div className="mb-6 flex justify-between items-center text-slate-500 font-medium px-2">
            <span>Showing {jobs.length} relevant opportunities</span>
            <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic">Matching against your resume</span>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.role}</h3>
                  </div>
                  <p className="font-bold text-indigo-600 flex items-center gap-1">
                    <span className="p-1 bg-indigo-100 rounded text-xs">🏢</span> {job.company}
                  </p>
                </div>
                {/* Match Score Badge */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 px-4 py-2 rounded-2xl text-center shadow-sm">
                  <div className="text-2xl font-black text-emerald-600 leading-none">{job.matchScore || 85}%</div>
                  <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-tighter mt-1">Match</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">{job.location}</span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">{job.type}</span>
                {job.salary !== 'Not disclosed' && (
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider italic">💰 {job.salary}</span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                {job.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.slice(0, 4).map((req, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded italic"># {req}</span>
                  ))}
                  {job.requirements.length > 4 && <span className="text-[10px] text-indigo-500 font-bold ml-1">+{job.requirements.length - 4} more</span>}
                </div>
                
                <div className="flex gap-3">
                  <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn-premium btn-premium-primary flex-1 text-sm">
                    Apply on Provider ↗
                  </a>
                  <button onClick={() => navigate('/resume-improver', { state: { jd: job.description, role: job.role } })} className="btn-premium btn-premium-secondary px-4">
                    Optimise Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {searched && jobs.length === 0 && !loading && (
          <div className="glass-card text-center py-20 border-dashed border-2">
            <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
            <p className="text-slate-500 mt-2">Try broadening your search or adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}