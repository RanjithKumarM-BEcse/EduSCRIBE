import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, PlayCircle, Video } from 'lucide-react';



const LectureViewer: React.FC = () => {
  const { roomCode, lectureId } = useParams<{ roomCode: string, lectureId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lecture, setLecture] = useState<any>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;
    
    if (!roomCode || !lectureId) return;
    const savedLectures = JSON.parse(localStorage.getItem(`eduscribe_lectures_${roomCode}`) || '[]');
    const found = savedLectures.find((l: any) => l.id === lectureId);
    
    if (found) {
      setLecture(found);
      
      // Load video from IndexedDB
      if (found.videoId) {
        import('../utils/indexedDB').then(({ getVideo }) => {
          getVideo(found.videoId).then((file) => {
            if (file) {
              activeUrl = URL.createObjectURL(file);
              setVideoObjectUrl(activeUrl);
            }
          }).catch(console.error);
        });
      } else if (found.videoUrl) {
         // Fallback for older lectures before IndexedDB
         setVideoObjectUrl(found.videoUrl);
      }
    }
    
    // Cleanup blob url on unmount
    return () => {
       if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [roomCode, lectureId]);

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [lecture]); // depend on lecture so it runs after video is rendered

  const handleTranscriptClick = (start: number) => {
    setCurrentTime(start); // Instantly highlight the clicked block

    if (videoRef.current) {
      // If the video is shorter than the transcript timestamp, don't break
      if (videoRef.current.duration && start > videoRef.current.duration) {
        // Just let it jump to the end of the video
      }
      
      try {
        videoRef.current.currentTime = start;
        videoRef.current.play().catch(() => {}); // ignore autoplay errors
      } catch (e) {
        // ignore DOM exceptions if video is broken
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const transcriptList = lecture?.transcript || [];
  const filteredTranscript = transcriptList.filter((item: any) => 
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
          <h1 className="font-bold text-gray-900 text-lg">{lecture?.title || 'Lecture Viewer'}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Side: Video Player (65%) */}
        <div className="w-full lg:w-[65%] h-[40%] lg:h-full bg-black flex flex-col relative shrink-0">
          {!videoObjectUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-900">
               <Video className="w-12 h-12 mb-4 text-gray-600" />
               <p className="text-gray-400">Loading video...</p>
               <p className="text-xs mt-2 text-gray-500">If this takes too long, the video may be missing from local storage.</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={videoObjectUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>

        {/* Right Side: Transcript (35%) */}
        <div className="flex flex-col w-full lg:w-[35%] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 h-[60%] lg:h-full shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredTranscript.map((item: any, idx: number) => {
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
