import React, { useState, useRef } from 'react';
import { X, UploadCloud, Video, CheckCircle2 } from 'lucide-react';

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, file: File, duration: number, transcript: any[]) => void;
}

const UploadLectureModal: React.FC<UploadLectureModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert("File is too large! Groq Whisper API only accepts files up to 25MB. Please choose a smaller video for the demo.");
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const generateMockTranscript = (title: string, duration: number) => {
    const safeDuration = (duration && !isNaN(duration) && duration > 0) ? duration : 45;
    const step = Math.max(1, safeDuration / 4);
    return [
      { start: 0, end: step, text: `Welcome to ${title}. Let's get started with today's topic.` },
      { start: step, end: step * 2, text: `In this lecture, we'll be covering some fundamental concepts that are crucial for understanding the broader subject matter.` },
      { start: step * 2, end: step * 3, text: `As you watch this video, notice how the AI has automatically transcribed the audio and synchronized it with the video playback.` },
      { start: step * 3, end: safeDuration, text: `This makes it incredibly easy for students to search for specific topics and jump exactly to the moment they need to review.` }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) return;

    if (apiKey) localStorage.setItem('groq_api_key', apiKey);

    setIsUploading(true);
    setProgress(10);
    setStatusText('Processing video...');
    
    try {
      let finalTranscript;
      
      if (apiKey) {
        setStatusText('Uploading to Groq Whisper AI (this may take a minute)...');
        setProgress(30);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-large-v3');
        formData.append('response_format', 'verbose_json');

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || 'Failed to transcribe with Groq');
        }

        setProgress(80);
        setStatusText('Processing AI response...');
        const data = await res.json();
        
        if (data.segments && data.segments.length > 0) {
          finalTranscript = data.segments.map((seg: any) => ({
            start: seg.start,
            end: seg.end,
            text: seg.text.trim()
          }));
        } else {
          throw new Error("No speech detected or empty response from Groq.");
        }
      }

      setProgress(95);
      setStatusText('Synchronizing timestamps...');

      // Get video duration to generate accurate transcript if Groq fails or is not used
      const videoUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.onloadedmetadata = () => {
         const duration = tempVideo.duration;
         
         setProgress(100);
         setStatusText('Complete!');
         
         setTimeout(() => {
           onUpload(title, file, duration, finalTranscript || generateMockTranscript(title, duration));
           URL.revokeObjectURL(videoUrl);
           setIsUploading(false);
           setProgress(0);
           setFile(null);
           setTitle('');
           onClose();
         }, 800);
      };

      // Fallback if metadata fails to load quickly
      setTimeout(() => {
         if (tempVideo.readyState === 0) {
            setProgress(100);
            setStatusText('Complete!');
            setTimeout(() => {
              onUpload(title, file, 45, finalTranscript || generateMockTranscript(title, 45));
              setIsUploading(false);
              setProgress(0);
              setFile(null);
              setTitle('');
              onClose();
            }, 800);
         }
      }, 1000);

    } catch (err: any) {
      alert(`Groq AI Error: ${err.message}\n\nFalling back to mock transcript.`);
      // Proceed with mock transcript
      setProgress(100);
      setStatusText('Complete (using mock)!');
      setTimeout(() => {
        onUpload(title, file, 45, generateMockTranscript(title, 45));
        setIsUploading(false);
        setProgress(0);
        setFile(null);
        setTitle('');
        onClose();
      }, 800);
    }
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
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-xs text-blue-800 flex items-start flex-col">
                 <div className="flex mb-2">
                   <div className="shrink-0 mr-2 mt-0.5" aria-hidden="true">ℹ️</div>
                   <p><b>Optional:</b> Enter a Groq API Key to generate real AI transcripts using Whisper-large-v3. Otherwise, a mock transcript will be used.</p>
                 </div>
                 <input
                   type="password"
                   placeholder="gsk_..."
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   aria-label="Groq API Key"
                   className="w-full px-3 py-2 mt-1 rounded border border-blue-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary"
                 />
              </div>

              <button 
                type="submit"
                disabled={!file || !title}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Upload and Transcribe"
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
