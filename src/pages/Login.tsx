import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestLogin = () => {
    setLoading(true);
    // Bypass the backend completely to avoid AWS errors
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 10000);
      const mockUser = {
        id: `demo_user_${randomId}`,
        email: `demo${randomId}@eduscribe.com`,
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6C47FF&color=fff',
        role: null as any
      };
      
      login(mockUser, 'mock_token_12345');
      navigate('/role-selection');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 flex flex-col items-center shadow-soft relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-coral-pink/10 rounded-full opacity-50 blur-2xl"></div>
        
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
          <GraduationCap className="text-white w-8 h-8 -rotate-3" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">eduScribe</h1>
        <p className="text-gray-500 mb-10 text-center text-sm px-4">
          Your accessible lecture companion platform. Join to learn or teach today.
        </p>
        
        {error && (
          <div className="mb-6 w-full p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button 
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Instant Test Login'}
        </button>
      </div>
      
      <p className="mt-6 text-sm text-gray-400">
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </p>
    </div>
  );
};

export default Login;
