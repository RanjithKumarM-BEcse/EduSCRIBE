import React, { useState } from 'react';
import { X, Search, Lock } from 'lucide-react';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string, password?: string) => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const joinCode = urlParams.get('join');
      const pendingCode = localStorage.getItem('pending_join_code');
      if (joinCode) setRoomCode(joinCode.toUpperCase());
      else if (pendingCode) setRoomCode(pendingCode.toUpperCase());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    onJoin(roomCode.toUpperCase(), password.trim() ? password : undefined);
    setRoomCode('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Join a Classroom</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Enter Room Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. CS301X" 
                maxLength={6}
                className="w-full pl-11 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-xl font-bold uppercase tracking-widest text-center"
                required
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-3 mb-2">
              Ask your instructor for the 6-character room code.
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Room Password (if private)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty if public" 
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
          >
            Join Class
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClassModal;
