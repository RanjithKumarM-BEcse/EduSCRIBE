import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Presentation } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RoleSelection: React.FC = () => {
  const { user, token, setRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: 'staff' | 'student') => {
    setLoading(true);
    try {
      // In a real app, you'd want a route like PUT /api/user/role
      // For now, we'll assume the context handles it and we navigate
      setRole(role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to set role', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-10 shadow-soft relative overflow-hidden">
        
        <div className="text-center mb-10 relative z-10">
          <div className="inline-block bg-purple-50 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            Welcome to eduScribe, {user.name.split(' ')[0]}!
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">How will you be using eduScribe?</h2>
          <p className="text-gray-500 mt-3">Select your role to personalize your experience. You can't change this later.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {/* Staff Card */}
          <button 
            disabled={loading}
            onClick={() => handleSelectRole('staff')}
            className="group relative p-8 rounded-3xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Presentation className="w-24 h-24 text-primary rotate-12" />
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Presentation className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Staff / Teacher</h3>
            <p className="text-gray-500 text-sm">Create classrooms, upload lectures, and manage your students' access.</p>
          </button>

          {/* Student Card */}
          <button 
            disabled={loading}
            onClick={() => handleSelectRole('student')}
            className="group relative p-8 rounded-3xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-secondary/20 hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-secondary -rotate-12" />
            </div>
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="text-secondary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
            <p className="text-gray-500 text-sm">Join classrooms, watch synchronized lectures, and read transcripts.</p>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
