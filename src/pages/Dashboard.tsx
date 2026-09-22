import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Users, Plus, LogOut, PlayCircle, Trash2 } from 'lucide-react';
import CreateClassModal from '../components/CreateClassModal';
import JoinClassModal from '../components/JoinClassModal';
import ProfileModal from '../components/ProfileModal';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isStaff = user?.role === 'staff';

  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    // Load this specific user's joined/created classes from DynamoDB backend
    const fetchRooms = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClasses(data.rooms || []);
        }
      } catch (err) {
        console.error("Failed to fetch rooms from cloud DB", err);
      }
    };
    fetchRooms();

    // Check for pending join
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    const pendingCode = localStorage.getItem('pending_join_code');
    
    if (joinCode || pendingCode) {
      setIsJoinOpen(true);
      if (pendingCode) localStorage.removeItem('pending_join_code');
    }
  }, [user]);

  const handleCreateClass = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        // Optimistically update UI
        setClasses([...classes, { 
          roomCode: result.roomCode, 
          name: result.name, 
          instructorName: user?.name,
          instructorId: user?.id,
          studentsCount: 0 
        }]);
      } else {
        const errData = await res.json();
        alert(`Backend Error: ${errData.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Network Error: ${err.message}`);
    }
  };

  const handleJoinClass = async (code: string, password?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ roomCode: code, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const alreadyJoined = classes.find((c) => c.roomCode === code);
        if (!alreadyJoined) {
          setClasses([...classes, data.room]);
        }
        navigate(`/classroom/${code}`);
      } else {
        alert(data.message || 'Failed to join room');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to cloud DB');
    }
  };

  const handleDeleteClass = async (e: React.MouseEvent, classId: string, roomCode: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this class? This cannot be undone.')) {
      // API call to delete from DynamoDB would go here
      setClasses(classes.filter(c => c.roomCode !== roomCode));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      <CreateClassModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateClass} />
      <JoinClassModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} onJoin={handleJoinClass} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-sm">
                <PlayCircle className="text-white w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-gray-900 tracking-tight">eduScribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                title="Edit Profile"
              >
                <img src={user?.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-primary/20" />
                <div className="hidden sm:flex flex-col pr-2">
                  <span className="text-sm font-bold text-gray-700 leading-tight">{user?.name}</span>
                  {user?.organization && (
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider leading-tight">{user.organization}</span>
                  )}
                </div>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Classes</h1>
          </div>
          {isStaff && (
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          )}
        </div>

        {!isStaff && (
          <div className="mb-10 w-full max-w-2xl">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Join a Classroom</h3>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Enter 6-digit room code..." 
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase tracking-wider"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinClass(e.currentTarget.value.toUpperCase());
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleJoinClass(input.value.toUpperCase());
                  input.value = '';
                }}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classes.map((cls) => (
            <div 
              key={cls.id} 
              tabIndex={0}
              onClick={() => navigate(`/classroom/${cls.roomCode}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/classroom/${cls.roomCode}`);
                }
              }}
              role="button"
              aria-label={`Open class: ${cls.name}`}
              className="bg-white rounded-2xl border border-gray-200 hover:border-primary shadow-sm overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="h-32 bg-gray-100 relative w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20"></div>
                <Video className="w-10 h-10 text-white opacity-50 z-10" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{cls.name}</h3>
                  {user?.id === cls.instructorId && (
                    <button
                      onClick={(e) => handleDeleteClass(e, cls.id, cls.roomCode)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors shrink-0"
                      title="Delete Class"
                      aria-label="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4 truncate">{cls.instructorName}</p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="text-xs font-bold text-primary bg-purple-50 px-2 py-1 rounded">
                    {cls.roomCode}
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{cls.studentsCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isStaff && (
            <div 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-purple-50 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px]"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-400">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-600">Create new class</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
