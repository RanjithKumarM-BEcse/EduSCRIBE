import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Upload, ArrowLeft, Video, Clock } from 'lucide-react';

const ClassroomView: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'staff';

  const [lectures, setLectures] = useState([
    { id: 'lec_1', title: 'Chapter 1: Components and Props', date: 'Oct 12, 2026', duration: '14:20' },
    { id: 'lec_2', title: 'Chapter 2: State and Lifecycle', date: 'Oct 14, 2026', duration: '22:15' },
  ]);

  const handleUpload = () => {
    // Mock upload for now
    alert('Video Upload Flow would open here. After upload, Groq Whisper transcribes the video!');
  };

  const handleViewLecture = (id: string) => {
    navigate(`/classroom/${roomCode}/lecture/${id}`);
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
              <h1 className="text-xl font-bold text-gray-900">React Advanced Course</h1>
              <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
                <span className="font-bold text-primary bg-purple-50 px-2 py-0.5 rounded">Room: {roomCode}</span>
                <span>•</span>
                <span>Instructor: Ranjith</span>
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
        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
