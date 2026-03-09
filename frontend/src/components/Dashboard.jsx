import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User"}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const features = [
    {
      title: 'Upload Resume',
      description: 'AI-powered parsing to extract skills and build your profile.',
      icon: '📄',
      path: '/upload-resume',
      color: 'bg-blue-500',
    },
    {
      title: 'Job Search',
      description: 'Match your resume against live opportunities with precision scores.',
      icon: '🔍',
      path: '/job-search',
      color: 'bg-emerald-500',
    },
    {
      title: 'ATS Resume Scanner',
      description: 'Advanced semantic analysis to tailor your resume for any JD.',
      icon: '✨',
      path: '/resume-improver',
      color: 'bg-indigo-500',
    },
    {
      title: 'Interview Master',
      description: 'Role-specific A-Z subjects, 50+ questions, and smart quizzes.',
      icon: '🎓',
      path: '/interview-prep',
      color: 'bg-violet-500',
    },
  ];

  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI CAREER HUB</h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Empowering Your Professional Journey</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">Premium Member</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-premium btn-premium-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12 animate-fade-in">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Welcome back, <span className="text-indigo-600">{user.name.split(' ')[0]}!</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium">What's your goal for today's session?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              className="glass-card cursor-pointer group hover:scale-[1.02] active:scale-[0.98] !p-8 flex flex-col items-start min-h-[300px]"
            >
              <div className={`${feature.color} w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-3xl mb-8 group-hover:rotate-12 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{feature.description}</p>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`${feature.color} h-full w-0 group-hover:w-full transition-all duration-700 ease-out`}></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}