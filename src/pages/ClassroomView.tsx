import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PlayCircle, Upload, ArrowLeft, Video, Clock } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const ClassroomView: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'staff';

  const [lectures, setLectures] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    const fetchRoom = () => {
      const allSaved = JSON.parse(localStorage.getItem('eduscribe_all_classes') || '[]');
      const room = allSaved.find((r: any) => r.roomCode === roomCode);
      if (room) setRoomData(room);
    };
    fetchRoom();
  }, [roomCode]);

  const handleUpload = () => {
    // Mock upload for now
    alert('Video Upload Flow would open here. After upload, Groq Whisper transcribes the video!');
  };

  const handleViewLecture = (id: string) => {
    navigate(`/classroom/${roomCode}/lecture/${id}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{roomData?.name || 'Classroom'}</h1>
              <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                <span 
                  onClick={() => copyToClipboard(roomCode || '')}
                  className="font-bold text-primary bg-purple-50 px-2 py-0.5 rounded cursor-pointer hover:bg-purple-100 transition-colors"
                  title="Click to copy room code"
                >
                  Room: {roomCode}
                </span>
                <span>•</span>
                <span 
                  onClick={() => copyToClipboard(`${window.location.origin}/classroom/${roomCode}`)}
                  className="font-semibold text-secondary cursor-pointer hover:underline"
                  title="Click to copy invite link"
                >
                  Copy Invite Link
                </span>
                {roomData?.instructorName && (
                  <>
                    <span>•</span>
                    <span>Instructor: {roomData.instructorName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {isStaff && (
            <button 
              onClick={handleUpload}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-bold shadow-soft transition-transform hover:-translate-y-0.5 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Lecture</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lectures</h2>
        
        <div className="space-y-4">
          {lectures.map((lec) => (
            <div 
              key={lec.id}
              onClick={() => handleViewLecture(lec.id)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{lec.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-3 mt-1">
                    <span className="flex items-center"><Video className="w-3.5 h-3.5 mr-1" /> Video + Transcript</span>
                    <span>•</span>
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {lec.duration}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-400">
                {lec.date}
              </div>
            </div>
          ))}

          {lectures.length === 0 && (
             <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">No lectures uploaded yet</h3>
               <p className="text-gray-500 text-sm max-w-sm mx-auto">
                 {isStaff ? "Click the 'Upload Lecture' button in the top right to upload your first video." : "Wait for your instructor to upload a lecture here."}
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
