import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Presentation, PlayCircle, ShieldCheck, Users } from 'lucide-react';

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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
               <PlayCircle className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl text-gray-900">eduScribe</span>
         </div>
         <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold text-gray-700">{user.name}</span>
         </div>
      </nav>

      <main id="main-content" className="flex-1 flex flex-col items-center pt-24 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Choose Your Role</h2>
          <p className="text-gray-500 font-medium">Select how you'll use eduScribe</p>
          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mt-12 px-4">
            
            {/* Staff Card */}
            <div 
              tabIndex={0}
              role="button"
              aria-label="Select Staff Role"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectRole('staff');
                }
              }}
              onClick={() => handleSelectRole('staff')}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer group hover:border-primary transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck className="w-8 h-8 text-primary group-hover:text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Staff</h3>
              <p className="text-gray-500 font-medium">Create classrooms, manage students, and track overall progress.</p>
            </div>

            {/* Student Card */}
            <div 
              tabIndex={0}
              role="button"
              aria-label="Select Student Role"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectRole('student');
                }
              }}
              onClick={() => handleSelectRole('student')}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer group hover:border-primary transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="w-8 h-8 text-primary group-hover:text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Student</h3>
              <p className="text-gray-500 font-medium">Join classes, access materials, and monitor your personal growth.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
