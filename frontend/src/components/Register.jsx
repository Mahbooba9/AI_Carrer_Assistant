import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl z-10 transition-all duration-300 hover:border-white/20 my-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mb-2">
            Join Us
          </h1>
          <p className="text-gray-400">Create your account to supercharge your career</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-gray-600"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-gray-600"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-gray-600"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all text-white placeholder:text-gray-600"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-emerald-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#141d33] px-2 text-gray-500">Already a member?</span></div>
        </div>

        <p className="text-center text-gray-400">
          <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
            Login to your account
          </Link>
        </p>
      </div>
    </div>
  );
}