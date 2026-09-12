import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Upload, ArrowLeft, Video, Clock, Users, Copy, CheckCircle2 } from 'lucide-react';
import UploadLectureModal from '../components/UploadLectureModal';
import { saveVideo } from '../utils/indexedDB';

const ClassroomView: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'staff';

  const [lectures, setLectures] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const fetchRoom = () => {
      const allSaved = JSON.parse(localStorage.getItem('eduscribe_all_classes') || '[]');
      const room = allSaved.find((r: any) => r.roomCode === roomCode);
      if (room) setRoomData(room);

      const savedLectures = JSON.parse(localStorage.getItem(`eduscribe_lectures_${roomCode}`) || '[]');
      setLectures(savedLectures);
    };
    fetchRoom();
  }, [roomCode]);

  const handleUploadComplete = async (title: string, file: File, duration: number, transcript: any[]) => {
    
    const lectureId = Math.random().toString(36).substring(2, 9);
    
    // Save the actual video file to IndexedDB so it survives page refreshes!
    try {
      await saveVideo(lectureId, file);
    } catch (err) {
      console.error("Failed to save video to DB", err);
    }

    const newLecture = {
      id: lectureId,
      title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      videoId: lectureId, 
      transcript 
    };

    const updatedLectures = [...lectures, newLecture];
    setLectures(updatedLectures);
    
    // Save metadata to local storage
    localStorage.setItem(`eduscribe_lectures_${roomCode}`, JSON.stringify(updatedLectures));

    // Update room lecture count
    const allSaved = JSON.parse(localStorage.getItem('eduscribe_all_classes') || '[]');
    const roomIndex = allSaved.findIndex((r: any) => r.roomCode === roomCode);
    if (roomIndex >= 0) {
      allSaved[roomIndex].lecturesCount = (allSaved[roomIndex].lecturesCount || 0) + 1;
      localStorage.setItem('eduscribe_all_classes', JSON.stringify(allSaved));
    }
  };

  const handleViewLecture = (id: string) => {
    navigate(`/classroom/${roomCode}/lecture/${id}`);
  };

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      <UploadLectureModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleUploadComplete} 
      />

            <img src={user?.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold text-gray-700">{user?.name}</span>
         </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Lectures */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Past Lectures</h2>
            {isStaff && (
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Lecture</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {lectures.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No lectures yet</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  {isStaff ? "Upload a video lecture to automatically generate a transcript." : "Your instructor hasn't uploaded any lectures yet."}
                </p>
              </div>
            ) : (
              lectures.map(lecture => (
                <div key={lecture.id} className="bg-white border border-gray-200 hover:border-primary/30 rounded-2xl p-4 flex items-center justify-between transition-all group">
                   <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center">
                         <Video className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900">{lecture.title}</h4>
                         <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{lecture.date}</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleViewLecture(lecture.id)}
                     className="text-primary font-bold text-sm bg-purple-50 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors"
                   >
                     View Transcript
                   </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Room Details */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Room Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Room Code</label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <span className="font-mono font-bold text-gray-900 tracking-wider">{roomCode}</span>
                  <button 
                    onClick={() => copyToClipboard(roomCode || '', 'code')}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Invite Link</label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs text-gray-500 truncate mr-2">{window.location.origin}/join/{roomCode}</span>
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/join/${roomCode}`, 'link')}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
                    title="Copy link"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
               <span className="text-gray-500 font-medium">Students Joined:</span>
               <span className="font-bold text-gray-900 flex items-center">
                 <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                 {roomData?.studentsCount || 0}
               </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ClassroomView;
