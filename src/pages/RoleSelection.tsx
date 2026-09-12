import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Presentation, PlayCircle } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const { user, setRole } = useAuth();
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
               <PlayCircle className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-900">eduScribe</span>
         </div>
         <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold text-gray-700">{user.name}</span>
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center pt-24 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Choose Your Role</h2>
          <p className="text-gray-500 font-medium">Select how you'll use eduScribe</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          {/* Staff Card */}
          <div className="flex-1 bg-white rounded-2xl p-6 border-2 border-primary shadow-sm relative">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-primary">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Staff / Teacher</h3>
            <p className="text-gray-500 text-sm mb-6">Create classrooms, upload lectures, and manage your students' access.</p>
            <button 
              disabled={loading}
              onClick={() => handleSelectRole('staff')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-all"
            >
              Continue as Staff
            </button>
          </div>

          {/* Student Card */}
          <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 shadow-sm transition-all">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-gray-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
            <p className="text-gray-500 text-sm mb-6">Join classrooms, watch synchronized lectures, and read transcripts.</p>
            <button 
              disabled={loading}
              onClick={() => handleSelectRole('student')}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-200 transition-all"
            >
              Continue as Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
