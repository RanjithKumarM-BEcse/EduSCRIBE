import React, { useState, useRef } from 'react';
import { X, UploadCloud, Video, CheckCircle2 } from 'lucide-react';

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, file: File, duration: number) => void;
}

const UploadLectureModal: React.FC<UploadLectureModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        // Auto-fill title from filename, removing extension
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return;

    setIsUploading(true);
    setStatusText('Uploading video securely...');
    
    // Simulate upload and AI processing
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress > 40 && currentProgress < 70) {
        setStatusText('Transcribing audio with Groq Whisper AI...');
      } else if (currentProgress >= 70 && currentProgress < 95) {
        setStatusText('Synchronizing timestamps...');
      }
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setStatusText('Complete!');
        
        setTimeout(() => {
          // Get video duration to generate accurate transcript
          const videoUrl = URL.createObjectURL(file);
          const tempVideo = document.createElement('video');
          tempVideo.src = videoUrl;
          tempVideo.onloadedmetadata = () => {
             onUpload(title, file, tempVideo.duration);
             URL.revokeObjectURL(videoUrl);
          };
          // Fallback if metadata fails to load quickly
          setTimeout(() => {
             if (tempVideo.readyState === 0) {
                onUpload(title, file, 45); // default to 45s
             }
          }, 500);
          
          setIsUploading(false);
          setProgress(0);
          setFile(null);
          setTitle('');
          onClose();
        }, 800);
      }
      
      setProgress(Math.min(currentProgress, 100));
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Upload Lecture</h2>
          {!isUploading && (
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {!isUploading ? (
            <>
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Lecture Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to React Hooks" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Video File</label>
                
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all text-primary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 mb-1">Click to select video</span>
                    <span className="text-xs text-gray-500">MP4, WebM, or OGG (Max 2GB)</span>
                  </div>
                ) : (
                  <div className="border border-primary/30 bg-purple-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-xs text-blue-800 flex items-start">
                 <div className="shrink-0 mr-2 mt-0.5">ℹ️</div>
                 <p><b>Demo Mode:</b> Video uploads are stored entirely in your browser's local memory to prevent server errors. They will disappear if you refresh the page, but transcripts will persist.</p>
              </div>

              <button 
                type="submit"
                disabled={!file || !title}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload & Transcribe
              </button>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 relative mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" fill="transparent" stroke="#F3F4F6" strokeWidth="8" />
                  <circle 
                    cx="40" cy="40" r="36" fill="transparent" stroke="#6C47FF" strokeWidth="8" 
                    strokeDasharray="226" 
                    strokeDashoffset={226 - (progress / 100) * 226} 
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {progress === 100 ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{statusText}</h3>
              <p className="text-sm text-gray-500">Please do not close this window.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadLectureModal;
