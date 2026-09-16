import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

// Helper to decode the JWT returned by GoogleLogin
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSuccess = (credentialResponse: any) => {
    setError('');
    try {
      const token = credentialResponse.credential;
      const userInfo = decodeJwt(token);
      
      if (!userInfo) throw new Error('Invalid token');

      const user = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture,
        role: null as any
      };
      
      login(user, token);
      navigate('/role-selection');
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    setError('Google login failed.');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      
      {/* Left Side - Brand / Marketing */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
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
      <main id="main-content" className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
          
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PlayCircle className="text-primary w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign in to eduScribe</h2>
          <p className="text-gray-500 mb-8 font-medium">Click below to enter the platform instantly.</p>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
            />
          </div>
          
          {error && <p className="mt-4 text-sm text-red-500 font-bold">{error}</p>}
          
          <p className="mt-8 text-xs text-gray-400 font-medium">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
