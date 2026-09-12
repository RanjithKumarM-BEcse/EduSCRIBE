import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, PlayCircle, Video, Pencil, Check } from 'lucide-react';



const LectureViewer: React.FC = () => {
  const { roomCode, lectureId } = useParams<{ roomCode: string, lectureId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lecture, setLecture] = useState<any>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const saveEdit = (originalIndex: number) => {
    if (!lecture) return;
    const newTranscript = [...lecture.transcript];
    newTranscript[originalIndex].text = editValue;
    const newLecture = { ...lecture, transcript: newTranscript };
    setLecture(newLecture);

    const savedLectures = JSON.parse(localStorage.getItem(`eduscribe_lectures_${roomCode}`) || '[]');
    const index = savedLectures.findIndex((l: any) => l.id === lectureId);
    if (index >= 0) {
      savedLectures[index] = newLecture;
      localStorage.setItem(`eduscribe_lectures_${roomCode}`, JSON.stringify(savedLectures));
      // Dispatch custom event for cross-tab syncing in the same app if we wanted, 
      // but standard 'storage' event fires across tabs naturally!
    }
    setEditingIndex(null);
  };

  useEffect(() => {
    let activeUrl: string | null = null;
    
    const loadLecture = () => {
      if (!roomCode || !lectureId) return;
      const savedLectures = JSON.parse(localStorage.getItem(`eduscribe_lectures_${roomCode}`) || '[]');
      const found = savedLectures.find((l: any) => l.id === lectureId);
      
      if (found) {
        setLecture(found);
        
        // Load video from IndexedDB only if we haven't loaded it yet
        if (found.videoId && !videoObjectUrl) {
          import('../utils/indexedDB').then(({ getVideo }) => {
            getVideo(found.videoId).then((file) => {
              if (file) {
                activeUrl = URL.createObjectURL(file);
                setVideoObjectUrl(activeUrl);
              }
            }).catch(console.error);
          });
        } else if (found.videoUrl && !videoObjectUrl) {
           setVideoObjectUrl(found.videoUrl);
        }
      }
    };

    loadLecture();

    // Cross-tab synchronization! (The "instantly on everyone else's screen" feature)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `eduscribe_lectures_${roomCode}`) {
        loadLecture(); // Reload instantly if another tab edits it
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup blob url on unmount
    return () => {
       window.removeEventListener('storage', handleStorageChange);
       if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [roomCode, lectureId]);

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [lecture]); // depend on lecture so it runs after video is rendered

  const handleTranscriptClick = (start: number) => {
    setCurrentTime(start); // Instantly highlight the clicked block

    if (videoRef.current) {
      // If the video is shorter than the transcript timestamp, don't break
      if (videoRef.current.duration && start > videoRef.current.duration) {
        // Just let it jump to the end of the video
      }
      
      try {
        videoRef.current.currentTime = start;
        videoRef.current.play().catch(() => {}); // ignore autoplay errors
      } catch (e) {
        // ignore DOM exceptions if video is broken
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<number[]>([]);
  const [semanticError, setSemanticError] = useState('');

  const transcriptList = lecture?.transcript || [];

  // Semantic Search Effect
  useEffect(() => {
    if (searchMode !== 'semantic' || !searchQuery.trim()) {
      setSemanticResults([]);
      setSemanticError('');
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSemanticSearching(true);
      setSemanticError('');
      
      const apiKey = localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        // MOCK SEMANTIC SEARCH FOR DEMOS WITHOUT API KEY
        setTimeout(() => {
           const query = searchQuery.toLowerCase();
           const matchTimes: number[] = [];
           
           // Simple mock semantic engine based on keywords
           transcriptList.forEach((t: any) => {
             const text = t.text.toLowerCase();
             // Simulate AI understanding meaning instead of exact words
             if (
               (query.includes('math') && text.includes('formula')) ||
               (query.includes('hello') && text.includes('welcome')) ||
               (query.includes('important') && text.includes('crucial')) ||
               (query.includes('find') && text.includes('search'))
             ) {
                matchTimes.push(t.start);
             } else if (text.includes(query)) {
                matchTimes.push(t.start);
             }
           });

           if (matchTimes.length > 0) {
              setSemanticResults(matchTimes);
           } else {
              setSemanticResults([-1]);
           }
           setIsSemanticSearching(false);
        }, 1200); // simulate network delay
        return;
      }

      try {
        const transcriptText = transcriptList.map((t: any) => `[START:${t.start}] ${t.text}`).join('\n');
        
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: 'You are a semantic search engine. You are given a transcript with [START:timestamp] tags. Find ALL segments that semantically match or answer the user\'s query. Return ONLY a comma-separated list of the START timestamps (e.g. "12.5, 45.0"). If none match, return "NONE". Do not include any other text.'
              },
              {
                role: 'user',
                content: `Transcript:\n${transcriptText}\n\nQuery: ${searchQuery}`
              }
            ],
            temperature: 0,
            max_tokens: 100
          })
        });

        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        const content = data.choices[0].message.content.trim();
        
        if (content === 'NONE') {
          setSemanticResults([-1]); // denotes no results
        } else {
          const times = content.split(',').map((s: string) => parseFloat(s.trim())).filter((n: number) => !isNaN(n));
          setSemanticResults(times);
        }
      } catch (err) {
        setSemanticError('Search failed.');
      } finally {
        setIsSemanticSearching(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchMode, transcriptList]);

  const filteredTranscript = transcriptList.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    if (searchMode === 'exact') {
      return item.text.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      if (semanticResults.length === 0 || semanticResults.includes(-1)) return false;
      return semanticResults.includes(item.start);
    }
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shrink-0 z-10">
        <button onClick={() => navigate(`/classroom/${roomCode}`)} className="p-2 hover:bg-gray-100 rounded-full mr-4 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <PlayCircle className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg">{lecture?.title || 'Lecture Viewer'}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Side: Video Player (65%) */}
        <div className="w-full lg:w-[65%] h-[40%] lg:h-full bg-black flex flex-col relative shrink-0">
          {!videoObjectUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-900">
               <Video className="w-12 h-12 mb-4 text-gray-600" />
               <p className="text-gray-400">Loading video...</p>
               <p className="text-xs mt-2 text-gray-500">If this takes too long, the video may be missing from local storage.</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={videoObjectUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>

        {/* Right Side: Transcript (35%) */}
        <div className="flex flex-col w-full lg:w-[35%] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 h-[60%] lg:h-full shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-900 flex items-center">
                AI Transcript
              </h2>
              <div className="flex bg-gray-200 p-0.5 rounded-lg">
                <button 
                  onClick={() => setSearchMode('exact')}
                  className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${searchMode === 'exact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Exact
                </button>
                <button 
                  onClick={() => setSearchMode('semantic')}
                  className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${searchMode === 'semantic' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Semantic
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSemanticSearching ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className={`h-4 w-4 ${searchMode === 'semantic' ? 'text-primary' : 'text-gray-400'}`} />
                )}
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode === 'semantic' ? "Ask a question about the video..." : "Search exact words..."} 
                className={`w-full pl-10 pr-4 py-2 rounded-xl border outline-none transition-all text-sm ${
                  searchMode === 'semantic' 
                    ? 'border-purple-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-purple-50/30' 
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {semanticError && <p className="text-xs text-red-500 mt-2 font-medium">{semanticError}</p>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredTranscript.map((item: any, idx: number) => {
              // We need the original index in `lecture.transcript` to save properly, not the filtered index
              const originalIndex = lecture?.transcript?.findIndex((t: any) => t.start === item.start);
              const isActive = currentTime >= item.start && currentTime < item.end;
              const isEditing = editingIndex === originalIndex;

              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl transition-all border-l-4 group ${
                    isActive 
                      ? 'bg-purple-50 border-primary shadow-sm' 
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex space-x-3 w-full">
                    <span 
                      onClick={() => !isEditing && handleTranscriptClick(item.start)}
                      className={`text-xs font-bold mt-1 cursor-pointer hover:underline ${isActive ? 'text-primary' : 'text-gray-400'}`}
                    >
                      {formatTime(item.start)}
                    </span>
                    
                    <div className="flex-1 relative">
                      {isEditing ? (
                        <div className="flex flex-col space-y-2">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full text-sm leading-relaxed p-2 border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => saveEdit(originalIndex)}
                              className="px-3 py-1 text-xs bg-primary text-white font-bold rounded-md flex items-center space-x-1 hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group/text relative">
                          <p 
                            onClick={() => handleTranscriptClick(item.start)}
                            className={`text-sm leading-relaxed cursor-pointer ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                          >
                            {item.text}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIndex(originalIndex);
                              setEditValue(item.text);
                            }}
                            title="Correct this transcript"
                            className="absolute -top-1 -right-1 p-1.5 bg-white text-gray-400 hover:text-primary shadow-sm border border-gray-100 rounded-lg opacity-0 group-hover/text:opacity-100 transition-all z-10"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredTranscript.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                {searchMode === 'semantic' && isSemanticSearching 
                  ? 'AI is analyzing the transcript...' 
                  : searchQuery 
                    ? 'No matching transcript found.' 
                    : 'No transcript available.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureViewer;
