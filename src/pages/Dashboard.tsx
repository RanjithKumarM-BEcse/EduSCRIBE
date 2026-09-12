import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Video, Users, Plus, LogOut, PlayCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const isStaff = user?.role === 'staff';

  const demoClasses = [
    { id: '1', name: 'Introduction to React', code: 'CS301', students: 45, lectures: 12 },
    { id: '2', name: 'Advanced UI Design', code: 'DS402', students: 32, lectures: 8 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                <PlayCircle className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">eduScribe</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={user?.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-primary/20" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isStaff ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h1>
            <p className="text-gray-500">
              {isStaff ? 'Manage your classrooms and upload accessible lectures.' : 'Join classrooms and watch synchronized transcripts.'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-0.5">
              <Plus className="w-5 h-5" />
              <span>{isStaff ? 'Create New Class' : 'Join a Classroom'}</span>
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-xl transition-shadow border border-gray-50 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${isStaff ? 'bg-purple-50 text-primary' : 'bg-coral-pink/10 text-secondary'}`}>
                  <Video className="w-6 h-6" />
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {cls.code}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-6">Instructor: {user?.name}</p>
              
              <div className="flex items-center space-x-4 border-t border-gray-50 pt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1.5 opacity-70" />
                  <span>{cls.students} students</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <PlayCircle className="w-4 h-4 mr-1.5 opacity-70" />
                  <span>{cls.lectures} lectures</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
