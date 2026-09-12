import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      
      const { user, token } = res.data;
      login(user, token);
      
      if (!user.role) {
        navigate('/role-selection');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error', err);
      const errorMessage = err.response?.data?.message || err.message || 'Authentication failed. Please try again.';
      setError(`Error: ${errorMessage}`);
    }
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

        <div className="w-full flex justify-center hover:scale-[1.02] transition-transform">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed.')}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="continue_with"
          />
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl w-full text-center">
          <p className="text-xs text-gray-500 font-semibold mb-1">HAVING GOOGLE ERRORS?</p>
          <p className="text-xs text-gray-400 mb-2">Copy this exact URL and paste it into Google Cloud's "Authorized JavaScript origins":</p>
          <code className="text-xs font-mono bg-white px-2 py-1 border rounded text-primary block break-all">
            {window.location.origin}
          </code>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-400">
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </p>
    </div>
  );
};

export default Login;
