import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, PlayCircle } from 'lucide-react';

const MOCK_TRANSCRIPT = [
  { start: 0, end: 5.5, text: "Welcome everyone to today's lecture on React Components." },
  { start: 5.5, end: 12.0, text: "Components let you split the UI into independent, reusable pieces, and think about each piece in isolation." },
  { start: 12.0, end: 18.5, text: "Conceptually, components are like JavaScript functions. They accept arbitrary inputs called props." },
  { start: 18.5, end: 25.0, text: "And return React elements describing what should appear on the screen." },
  { start: 25.0, end: 30.0, text: "Let's look at an example of a functional component now." }
];

const LectureViewer: React.FC = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handleTranscriptClick = (start: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = start;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const filteredTranscript = MOCK_TRANSCRIPT.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shrink-0 z-10">
        <button onClick={() => navigate(`/classroom/${roomCode}`)} className="p-2 hover:bg-gray-100 rounded-full mr-4 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <PlayCircle className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg">Chapter 1: Components and Props</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Video Player (65%) */}
        <div className="w-full lg:w-[65%] bg-black flex flex-col relative h-full">
          <video 
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
            // Using a dummy video for demonstration
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          />
        </div>

        {/* Right Side: Transcript (35%) */}
        <div className="hidden lg:flex flex-col w-[35%] bg-white border-l border-gray-200 h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center">
              AI Synchronized Transcript
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcript..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredTranscript.map((item, idx) => {
              const isActive = currentTime >= item.start && currentTime < item.end;
              return (
                <div 
                  key={idx}
                  onClick={() => handleTranscriptClick(item.start)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border-l-4 ${
                    isActive 
                      ? 'bg-purple-50 border-primary shadow-sm' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex space-x-3">
                    <span className={`text-xs font-bold mt-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                      {formatTime(item.start)}
                    </span>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {filteredTranscript.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                No matching transcript found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureViewer;
