import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UploadResume from './components/UploadResume';
import JobSearch from './components/JobSearch';
import ResumeImprover from './components/ResumeImprover';
import InterviewPrep from './components/InterviewPrep';
import ChatBot from './components/ChatBot';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  // Update auth state periodically to handle login/logout
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    
    // Check every 1 second (simple approach for now)
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-search"
          element={
            <ProtectedRoute>
              <JobSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-improver"
          element={
            <ProtectedRoute>
              <ResumeImprover />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      {isAuthenticated && <ChatBot />}
    </BrowserRouter>
  );
}