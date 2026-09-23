import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Upload, ArrowLeft, Video, Clock, Users, Copy, CheckCircle2, Trash2 } from 'lucide-react';
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
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/rooms/${roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRoomData(data.room);
          setLectures(data.lectures || []);
        }
      } catch (err) {
        console.error("Failed to fetch room data from AWS", err);
      }
    };
    fetchRoom();
  }, [roomCode]);

  const handleUploadComplete = async (title: string, file: File, duration: number, transcript: any[]) => {
    
    const lectureId = Math.random().toString(36).substring(2, 9);
    let s3Url = null;

    // Try to upload to S3 first if configured
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });

      if (res.ok) {
        const { url, publicUrl } = await res.json();
        const uploadRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });
        
        if (uploadRes.ok) {
          s3Url = publicUrl;
        }
      }
    } catch (err) {
      console.log("S3 upload not configured or failed, falling back to local DB");
    }
    
    if (!s3Url) {
      // Save the actual video file to IndexedDB so it survives page refreshes!
      try {
        await saveVideo(lectureId, file);
      } catch (err) {
        console.error("Failed to save video to DB", err);
      }
    }

    const newLecture = {
      id: lectureId,
      title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      videoId: lectureId, 
      videoUrl: s3Url, // Use S3 URL if available
      transcript 
    };

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/rooms/${roomCode}/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLecture)
      });
    } catch (err) {
      console.error("Failed to save lecture to AWS", err);
    }

    const updatedLectures = [...lectures, newLecture];
    setLectures(updatedLectures);

    setIsUploadOpen(false);
  };

  const handleDeleteLecture = async (lectureId: string, videoUrl?: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lecture?")) return;

    // Remove from UI state
    const updatedLectures = lectures.filter(l => l.id !== lectureId);
    setLectures(updatedLectures);

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/rooms/${roomCode}/lectures/${lectureId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to delete lecture from AWS", err);
    }

    // Try to delete from S3
    if (videoUrl) {
      try {
        const urlObj = new URL(videoUrl);
        const key = urlObj.pathname.substring(1); // removes leading '/'
        const token = localStorage.getItem('token');
        await fetch('/api/s3/delete', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key })
        });
      } catch (err) {
        console.error("Failed to delete from S3", err);
      }
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

      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <PlayCircle className="text-white w-5 h-5" aria-hidden="true" />
               </div>
               <span className="font-bold text-xl text-gray-900">eduScribe</span>
            </div>
            <span className="text-gray-300 font-light text-xl px-2">/</span>
            <span className="font-bold text-gray-700">{roomData?.name || 'Classroom'}</span>
         </div>
         <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <img src={user?.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold text-gray-700">{user?.name}</span>
         </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col lg:flex-row gap-8">
        
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
                    <div className="flex items-center space-x-3">
                       {isStaff && (
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteLecture(lecture.id, lecture.videoUrl);
                           }}
                           className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                           title="Delete Lecture"
                           aria-label="Delete Lecture"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleViewLecture(lecture.id);
                         }}
                         className="text-primary font-bold text-sm bg-purple-50 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors"
                       >
                         View Transcript
                       </button>
                    </div>
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
