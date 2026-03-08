import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JobSearch() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('United States');
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

  const API_BASE_URL = 'https://ai-carrer-assistant.onrender.com/api';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/jobs/search`,
        {
          jobTitle,
          location,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          experience: experience || null,
          company: company || null,
          skills: skills ? skills.split(',').map(s => s.trim()) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error:', err.response?.data?.message || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
      setJobs([]);
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
          <h1 className="text-3xl font-bold text-gray-800">🔍 Job Search</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Job Title (e.g., Data Analyst, Software Engineer)"
                className="input-field flex-1"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
                <input
                  type="text"
                  placeholder="Location"
                  className="input-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Min Salary (USD)"
                  className="input-field"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Max Salary (USD)"
                  className="input-field"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Experience Level (e.g., entry-level, mid-level, senior)"
                  className="input-field"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Company Name"
                  className="input-field"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Skills (comma-separated)"
                  className="input-field"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {searched && jobs.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">No jobs found matching your criteria</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-blue-600">{job.role}</h3>
                <p className="text-lg font-semibold text-gray-800">{job.company}</p>
                <p className="text-gray-600">📍 {job.location}</p>
                <p className="text-sm text-gray-500">{job.type || 'Full-time'}</p>
              </div>

              {job.salary && (
                <p className="text-green-600 font-semibold mb-2">💰 {job.salary}</p>
              )}

              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-700 mb-2">Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.slice(0, 5).map((req, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 5 && (
                      <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                        +{job.requirements.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full text-center"
              >
                Apply Now →
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}