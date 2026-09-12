import React, { useState } from 'react';
import { X, Lock, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { user } = useAuth();
  const [className, setClassName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    
    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    onCreate({
      name: className,
      instructorName: user?.name,
      isPublic,
      roomCode
    });
    
    setClassName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Create New Class</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">Class Name</label>
            <input 
              type="text" 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Advanced UI Design" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Taken by (Instructor)</label>
            <input 
              type="text" 
              value={user?.name || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">Privacy Setting</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isPublic ? 'border-primary bg-purple-50 text-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
              >
                <Globe className={`w-6 h-6 mb-2 ${isPublic ? 'text-primary' : 'text-gray-400'}`} />
                <span className="font-bold text-sm">Public</span>
                <span className="text-xs text-center mt-1 opacity-70">Anyone with code can join instantly</span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${!isPublic ? 'border-secondary bg-coral-pink/10 text-secondary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
              >
                <Lock className={`w-6 h-6 mb-2 ${!isPublic ? 'text-secondary' : 'text-gray-400'}`} />
                <span className="font-bold text-sm">Private</span>
                <span className="text-xs text-center mt-1 opacity-70">Requires your approval to join</span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
          >
            Create Classroom
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
