import React, { useState } from 'react';
import { X, Lock, Globe } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string, isPublic: boolean, password?: string }) => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, isPublic, password: isPublic ? undefined : password });
    setName('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Class Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Networks CS301" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Privacy Setting</label>
            <div className="flex flex-col space-y-3">
              <label className={`flex items-center p-3 rounded-xl border ${isPublic ? 'border-primary bg-purple-50' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer transition-all`}>
                <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} className="hidden" />
                <Globe className={`w-5 h-5 mr-3 ${isPublic ? 'text-primary' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-bold ${isPublic ? 'text-primary' : 'text-gray-700'}`}>Public</div>
                  <div className="text-xs text-gray-500">Anyone with code can join</div>
                </div>
              </label>
              
              <label className={`flex items-center p-3 rounded-xl border ${!isPublic ? 'border-primary bg-purple-50' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer transition-all`}>
                <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} className="hidden" />
                <Lock className={`w-5 h-5 mr-3 ${!isPublic ? 'text-primary' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-bold ${!isPublic ? 'text-primary' : 'text-gray-700'}`}>Private</div>
                  <div className="text-xs text-gray-500">Requires a password</div>
                </div>
              </label>
            </div>
            
            {!isPublic && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a room password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  required
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
