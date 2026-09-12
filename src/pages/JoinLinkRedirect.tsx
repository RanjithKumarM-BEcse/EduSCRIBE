import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PlayCircle } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

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

        // Try to join automatically
        try {
          const allSaved = JSON.parse(localStorage.getItem('eduscribe_all_classes') || '[]');
          const foundClass = allSaved.find((c: any) => c.roomCode === roomCode);
          
          if (!foundClass) {
             navigate(`/dashboard?join=${roomCode}`);
             return;
          }
          
          if (!foundClass.isPublic) {
             // Requires password, go to dashboard
             navigate(`/dashboard?join=${roomCode}`);
             return;
          }

          const myClassIds = JSON.parse(localStorage.getItem(`eduscribe_my_classes_${user.id}`) || '[]');
          if (!myClassIds.includes(roomCode)) {
            localStorage.setItem(`eduscribe_my_classes_${user.id}`, JSON.stringify([...myClassIds, roomCode]));
            foundClass.studentsCount = (foundClass.studentsCount || 0) + 1;
            localStorage.setItem('eduscribe_all_classes', JSON.stringify(allSaved));
          }
          
          navigate(`/classroom/${roomCode}`);
        } catch (err: any) {
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
