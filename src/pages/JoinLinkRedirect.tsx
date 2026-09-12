import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PlayCircle } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const JoinLinkRedirect: React.FC = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const attemptJoin = async () => {
      try {
        if (!user) {
          // Store intent and redirect to login
          localStorage.setItem('pending_join_code', roomCode || '');
          navigate('/');
          return;
        }

        // Try to join automatically (only works if public)
        try {
          await axios.post(`${API_URL}/rooms/join`, { roomCode }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          navigate(`/classroom/${roomCode}`);
        } catch (err: any) {
          // If it fails (e.g., requires password), send them to dashboard with a query param
          navigate(`/dashboard?join=${roomCode}`);
        }
      } catch (e) {
        navigate('/dashboard');
      }
    };
    attemptJoin();
  }, [roomCode, user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse mb-6">
        <PlayCircle className="text-white w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Joining Classroom...</h2>
    </div>
  );
};

export default JoinLinkRedirect;
