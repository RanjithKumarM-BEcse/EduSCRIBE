import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Users, Plus, LogOut, PlayCircle } from 'lucide-react';
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
  // Use relative path for Vercel, fallback to localhost for development
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_URL}/rooms`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(res.data.rooms || []);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };
    if (user) fetchRooms();

    // Check for pending join
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    const pendingCode = localStorage.getItem('pending_join_code');
    
    if (joinCode || pendingCode) {
      setIsJoinOpen(true);
      // Clean up local storage
      if (pendingCode) localStorage.removeItem('pending_join_code');
    }
  }, [user]);

  const handleCreateClass = async (data: any) => {
    try {
      const res = await axios.post(`${API_URL}/rooms`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Add the new room to local state instantly
      setClasses([...classes, { ...res.data, studentsCount: 0, lecturesCount: 0 }]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleJoinClass = async (code: string, password?: string) => {
    try {
      const res = await axios.post(`${API_URL}/rooms/join`, { roomCode: code, password }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/classroom/${code}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join class');
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
              {isStaff ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h1>
            <p className="text-gray-500 text-lg">
              {isStaff ? 'Manage your classrooms and upload accessible lectures.' : 'Join classrooms and watch synchronized transcripts.'}
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <button 
              onClick={() => isStaff ? setIsCreateOpen(true) : setIsJoinOpen(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold shadow-soft hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>{isStaff ? 'Create New Class' : 'Join a Classroom'}</span>
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/classroom/${cls.roomCode}`)}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-soft transition-all border border-gray-100 hover:border-primary/20 cursor-pointer group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl transition-colors ${isStaff ? 'bg-purple-50 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-coral-pink/10 text-secondary group-hover:bg-secondary group-hover:text-white'}`}>
                  <Video className="w-6 h-6" />
                </div>
                <span className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {cls.roomCode}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Instructor: {cls.instructorName || user?.name}</p>
              
              <div className="flex items-center space-x-4 border-t border-gray-50 pt-4">
                <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{cls.students} students</span>
                </div>
                <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                  <PlayCircle className="w-4 h-4 mr-1.5" />
                  <span>{cls.lectures} lectures</span>
                </div>
              </div>
            </div>
          ))}
          
          {classes.length === 0 && (
             <div className="col-span-full py-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">No classrooms yet</h3>
               <p className="text-gray-500 max-w-md mx-auto">
                 {isStaff ? "You haven't created any classes. Click the 'Create New Class' button to get started!" : "You haven't joined any classes yet. Click 'Join a Classroom' and enter your code."}
               </p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
