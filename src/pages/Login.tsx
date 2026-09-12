import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleTestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 10000);
      const mockUser = {
        id: `demo_user_${randomId}`,
        email: `demo${randomId}@eduscribe.com`,
        name: 'Demo User',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6C47FF&color=fff',
        role: null as any
      };
      
      const mockToken = `MOCK::${btoa(JSON.stringify(mockUser))}`;
      login(mockUser, mockToken);
      navigate('/role-selection');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Left Side - Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-8 left-8 flex items-center space-x-2 text-white">
          <PlayCircle className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">eduScribe</span>
        </div>
        
        <div className="z-10 mt-16 max-w-xl">
          <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
            AI-Powered Lecture Transcription Platform.
          </h1>
          <p className="text-primary-foreground/80 text-lg font-medium mb-12">
            Upload your lectures and automatically generate synchronized, accessible transcripts for your students.
          </p>
          
          <div className="relative w-full max-w-md mx-auto aspect-video bg-black/20 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm flex items-center justify-center p-6">
             <div className="w-full h-full border border-white/20 rounded-xl flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex space-x-2">
                   <div className="w-2 h-8 bg-coral-pink rounded-full animate-pulse"></div>
                   <div className="w-2 h-12 bg-coral-pink rounded-full animate-pulse delay-75"></div>
                   <div className="w-2 h-6 bg-coral-pink rounded-full animate-pulse delay-150"></div>
                   <div className="w-2 h-10 bg-coral-pink rounded-full animate-pulse delay-300"></div>
                </div>
                <div className="text-white/50 text-sm font-bold tracking-widest uppercase">Processing Audio...</div>
             </div>
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-32 -right-32 w-96 h-96 bg-coral-pink opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
          
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PlayCircle className="text-primary w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign in to eduScribe</h2>
          <p className="text-gray-500 mb-8 font-medium">Click below to enter the platform instantly.</p>

          <button 
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full flex items-center justify-center bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In to Platform
              </>
            )}
          </button>
          
          <p className="mt-8 text-xs text-gray-400 font-medium">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
