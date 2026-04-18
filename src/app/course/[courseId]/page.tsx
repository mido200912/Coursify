"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, PlayCircle, Clock, ChevronLeft, Bot, Send, X, CheckCircle2, ChevronRight, Check, Download, MessageSquare, LogOut } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "@/components/layout/ThemeToggle"; 

interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

interface Chapter {
  title: string;
  about: string;
  duration: string;
  youtubeQuery?: string;
  quizzes?: Quiz[];
}

interface CourseData {
  courseName: string;
  description: string;
  chapters: Chapter[];
  userId: string;
  includeVideo: boolean;
}

export default function CourseViewer() {
  const { courseId } = useParams();
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [chapterVideos, setChapterVideos] = useState<Record<number, { videoId: string | null, fetching: boolean, exactDuration?: string }>>({});
  const usedVideosTracker = useRef<Set<string>>(new Set());

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [isContentExpanded, setIsContentExpanded] = useState<boolean>(false);

  // Notes State
  const [chapterNotes, setChapterNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Progress State
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);

  const fetchNotes = async () => {
    if (!courseId) return;
    try {
      const q = query(
        collection(db, "courses", courseId as string, "notes"), 
        where("chapterIndex", "==", activeChapterIndex)
      );
      const snags = await getDocs(q);
      const notesData = snags.docs.map(d => ({ id: d.id, ...d.data() } as any));
      notesData.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setChapterNotes(notesData);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  useEffect(() => {
    setSelectedAnswers({});
    setQuizScore(null);
    setShowQuiz(false);
    setIsContentExpanded(false);
    fetchNotes();
  }, [activeChapterIndex, courseId]);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user || !courseId) return;
    try {
      await addDoc(collection(db, "courses", courseId as string, "notes"), {
         userId: user.uid,
         userName: user.email?.split('@')[0] || "User",
         text: newNote,
         chapterIndex: activeChapterIndex,
         parentId: replyingTo, // Link reply to parent note
         createdAt: serverTimestamp()
      });
      setNewNote("");
      setReplyingTo(null);
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleChapterProgress = (index: number) => {
    const isCompleted = completedChapters.includes(index);
    let newCompleted;
    if (isCompleted) {
      newCompleted = completedChapters.filter(i => i !== index);
    } else {
      newCompleted = [...completedChapters, index];
    }
    setCompletedChapters(newCompleted);
    localStorage.setItem(`progress_${courseId}`, JSON.stringify(newCompleted));
  };

  useEffect(() => {
    if (courseId) {
      const saved = localStorage.getItem(`progress_${courseId}`);
      if (saved) setCompletedChapters(JSON.parse(saved));
    }
  }, [courseId]);

  const progressPercentage = Math.round((completedChapters.length / (course?.chapters?.length || 1)) * 100);

  const handleDownloadPDF = async () => {
    // Rely on native print dialog configured for print CSS
    // Extremely robust for Tailwind modern colors (lab/oklch)
    window.print();
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !course) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          courseContext: {
             courseName: course.courseName,
             description: course.description,
             activeChapter: course.chapters[activeChapterIndex]
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !authLoading) {
       router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || typeof courseId !== "string") return;
      try {
        const docRef = doc(db, "courses", courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data() as CourseData);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to load course", err);
      }
    };
    fetchCourse();
  }, [courseId, router]);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!course || !course.includeVideo) return;
      
      const chapter = course.chapters[activeChapterIndex];
      if (!chapter) return;
      
      // If we already fetched or are currently fetching this chapter's video, skip
      if (chapterVideos[activeChapterIndex]) return;

      setChapterVideos(prev => ({ ...prev, [activeChapterIndex]: { videoId: null, fetching: true } }));
      
      try {
        const queryStr = chapter.youtubeQuery || `${chapter.title} ${course.courseName} tutorial`;
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(queryStr)}`);
        
        if (res.ok) {
          const data = await res.json();
          const videos: {videoId: string, duration: string}[] = data.videos || [];
          
          let chosenVideo = videos[0] || null;
          // Try to pick a video that hasn't been used yet to prevent repeating
          for (const vid of videos) {
            if (!usedVideosTracker.current.has(vid.videoId)) {
              chosenVideo = vid;
              break;
            }
          }
          
          if (chosenVideo) {
            usedVideosTracker.current.add(chosenVideo.videoId);
          }
          
          setChapterVideos(prev => ({ 
            ...prev, 
            [activeChapterIndex]: { 
               videoId: chosenVideo?.videoId || null, 
               fetching: false,
               exactDuration: chosenVideo?.duration
            } 
          }));
        } else {
          setChapterVideos(prev => ({ ...prev, [activeChapterIndex]: { videoId: null, fetching: false } }));
        }
      } catch (error) {
        console.error(error);
        setChapterVideos(prev => ({ ...prev, [activeChapterIndex]: { videoId: null, fetching: false } }));
      }
    };

    fetchVideo();
  }, [activeChapterIndex, course, chapterVideos]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
        <div className="animate-pulse flex items-center gap-2">
          <BookOpen className="animate-bounce" /> Loading Masterclass...
        </div>
      </div>
    );
  }

  if (!course.chapters || !Array.isArray(course.chapters) || course.chapters.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white p-6">
        <BookOpen className="mb-4 opacity-20" size={64} />
        <h2 className="text-2xl font-bold mb-2">Structure Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md">
          The AI failed to generate chapters in the expected format. Please try generating the course again.
        </p>
        <Link href="/create" className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
          Create New Course
        </Link>
      </div>
    );
  }

  const activeChapter = course.chapters[activeChapterIndex] || course.chapters[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 font-sans print:bg-white print:text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl h-auto md:h-screen sticky top-0 overflow-y-auto shrink-0 flex flex-col print:hidden">
         <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <Link href="/" className="mb-8 block">
               <img src="/images/logo/logo-light.png" className="h-12 w-auto block dark:hidden" alt="Coursify" />
               <img src="/images/logo/logo-dark.png" className="h-12 w-auto hidden dark:block" alt="Coursify" />
            </Link>
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition">
              <ChevronLeft size={16} /> Dashboard
            </Link>
           <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight mb-2">
             {course.courseName}
           </h2>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4">
             {course.description}
           </p>
           
           <div className="space-y-1.5 px-0.5 mb-2">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
               <span>Path Progress</span>
               <span>{progressPercentage}%</span>
             </div>
             <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                 style={{ width: `${progressPercentage}%` }}
               />
             </div>
           </div>
        </div>

        <div className="p-4 flex-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-2">Path Chapters</h3>
          <div className="space-y-2">
            {course.chapters.map((chapter, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapterIndex(idx)}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                  activeChapterIndex === idx 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20 shadow-sm" 
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeChapterIndex === idx ? "bg-indigo-200 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm leading-tight">{chapter.title || `Chapter ${idx + 1}`}</div>
                    {completedChapters.includes(idx) && (
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs flex items-center gap-1 opacity-70">
                    <Clock size={12} /> {chapterVideos[idx]?.exactDuration || chapter.duration}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 mt-auto">
           <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Settings</span>
              <ThemeToggle />
           </div>
           <button
             onClick={() => logout()}
             className="flex w-full items-center gap-3 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-bold text-sm"
           >
             <LogOut size={18} /> Logout
           </button>
         </div>
      </aside>

      {/* Main Content Viewer */}
      <main className="flex-1 max-h-screen overflow-y-auto print:max-h-none print:overflow-visible">
        <div className="max-w-4xl mx-auto p-6 md:p-12 print:p-0 print:m-0">
           <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8 print:border-none">
              <div className="flex justify-between items-start mb-4 print:hidden">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full">
                    Chapter {activeChapterIndex + 1}
                 </div>
                 <button 
                    onClick={handleDownloadPDF} 
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                 >
                   <Download size={14} /> Download PDF Summary
                 </button>
              </div>
              <div id="chapter-content" className="p-4 bg-transparent rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                    {activeChapter.title || "Untitled Chapter"}
                  </h1>
                  <button 
                    onClick={() => toggleChapterProgress(activeChapterIndex)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 shrink-0 ${
                      completedChapters.includes(activeChapterIndex)
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-green-500/50 hover:text-green-600"
                    }`}
                  >
                    {completedChapters.includes(activeChapterIndex) ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />}
                    {completedChapters.includes(activeChapterIndex) ? "Done!" : "Mark as Done"}
                  </button>
                </div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400 prose dark:prose-invert max-w-none prose-indigo relative">
                   {/* Treating chapter 'about' as markdown using ReactMarkdown */}
                   <div className={`${!isContentExpanded ? "max-h-[300px] overflow-hidden" : ""} relative transition-all duration-500`}>
                     <ReactMarkdown>
                        {activeChapter.about}
                     </ReactMarkdown>
                   </div>
                   
                   {isContentExpanded && (
                     <div className="flex justify-center mt-6 print:hidden">
                       <button
                         onClick={() => {
                           setIsContentExpanded(false);
                           document.getElementById('chapter-content')?.scrollIntoView({ behavior: 'smooth' });
                         }}
                         className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors"
                       >
                         Show less
                       </button>
                     </div>
                   )}
                   
                   {!isContentExpanded && (
                     <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent flex items-end justify-center pb-4 print:hidden">
                       <button
                         onClick={() => setIsContentExpanded(true)}
                         className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-1 transition-all"
                       >
                         Read full lesson
                       </button>
                     </div>
                   )}
                </div>
              </div>
           </div>

           {course.includeVideo && (
             <div className="mt-8 print:hidden">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                 <PlayCircle className="text-indigo-500" /> Video Resource
               </h3>
               
               <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative shadow-2xl">
                 {chapterVideos[activeChapterIndex]?.fetching ? (
                   <div className="animate-pulse flex flex-col items-center text-zinc-500">
                     <PlayCircle size={48} className="mb-4 opacity-50" />
                     <span>Finding best educational video...</span>
                   </div>
                 ) : chapterVideos[activeChapterIndex]?.videoId ? (
                   <iframe
                     width="100%"
                     height="100%"
                     src={`https://www.youtube.com/embed/${chapterVideos[activeChapterIndex].videoId}?autoplay=0&rel=0`}
                     title="YouTube video player"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   ></iframe>
                 ) : (
                   <div className="text-zinc-500 text-center px-4">
                     <p>Could not find an exact video resource for this chapter.</p>
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* Community Notes Section (Moved under Video) */}
           <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm print:hidden">
             <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
               <MessageSquare className="text-indigo-500" /> Community Notes
             </h3>
             
             <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
               {chapterNotes.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-zinc-500 py-10 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 border-dashed">
                   <MessageSquare size={32} className="mb-3 opacity-20" />
                   <p className="font-medium text-zinc-800 dark:text-zinc-200">No notes yet</p>
                   <p className="text-sm">Be the first to share an insight for this chapter!</p>
                 </div>
               ) : (
                 chapterNotes.filter(n => !n.parentId).map(note => (
                    <div key={note.id} className="space-y-3">
                      <div className="flex gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 rounded-2xl transition group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/30">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-lg">
                          {(note.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-zinc-900 dark:text-white capitalize truncate">{note.userName}</span>
                            {note.createdAt && (
                              <span className="text-xs text-zinc-400">• {new Date(note.createdAt.toMillis()).toLocaleDateString()}</span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none inline-block max-w-full overflow-hidden">{note.text}</p>
                          <div className="mt-2 text-right">
                             <button 
                               onClick={() => setReplyingTo(note.id)}
                               className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition"
                             >
                               Reply
                             </button>
                          </div>
                          
                          {/* Nested Replies */}
                          <div className="mt-4 space-y-3 ml-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
                            {chapterNotes.filter(r => r.parentId === note.id).map(reply => (
                               <div key={reply.id} className="flex gap-3 py-1">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-zinc-300 dark:bg-zinc-700 text-[10px]">
                                    {(reply.userName || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-0.5">
                                       <span className="font-bold text-[11px] text-zinc-900 dark:text-white capitalize truncate">{reply.userName}</span>
                                     </div>
                                     <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-xl rounded-tl-none border border-zinc-100 dark:border-zinc-800/30 inline-block max-w-full overflow-hidden">{reply.text}</p>
                                  </div>
                               </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
               )}
             </div>

             {replyingTo && (
                <div className="mb-3 flex items-center justify-between bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <MessageSquare size={12} /> Replying to comment...
                  </span>
                  <button onClick={() => setReplyingTo(null)} className="text-indigo-400 hover:text-indigo-600 transition"><X size={14} /></button>
                </div>
              )}
              <form onSubmit={handleAddNote} className="flex gap-2">
               <input 
                 type="text"
                 placeholder="Share a note, tip, or thought..."
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white"
               />
               <button 
                 type="submit"
                 disabled={!newNote.trim()}
                 className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50"
               >
                 Post
               </button>
             </form>
           </div>

           {/* Quiz Section (Moved to end) */}
           {activeChapter.quizzes && activeChapter.quizzes.length > 0 && (
             <div className="mt-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm print:hidden">
               <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                 <CheckCircle2 className="text-indigo-500" /> Chapter Quiz
               </h3>

               {!showQuiz ? (
                  <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-100 dark:border-zinc-800/50">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-indigo-300 dark:text-indigo-900/50" />
                    <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">Test Your Knowledge</h4>
                    <p className="text-zinc-500 max-w-sm mx-auto mb-8 text-sm">Take a short quiz to reinforce what you've learned. The questions are specifically crafted from this chapter.</p>
                    <button 
                       onClick={() => setShowQuiz(true)}
                       className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-500/30"
                    >
                      Start Quiz ({activeChapter.quizzes.length} Questions)
                    </button>
                  </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="space-y-8">
                     {activeChapter.quizzes.map((quiz, qIndex) => (
                       <div key={qIndex} className="p-5 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                         <p className="font-semibold text-lg text-zinc-800 dark:text-zinc-200 mb-4">{qIndex + 1}. {quiz.question}</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {quiz.options.map((opt, oIndex) => {
                             const isSelected = selectedAnswers[qIndex] === opt;
                             const isCorrect = quizScore !== null && quiz.answer === opt;
                             const isWrong = quizScore !== null && isSelected && quiz.answer !== opt;

                             let borderClass = "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600";
                             let bgClass = "bg-white dark:bg-zinc-900";
                             let textClass = "text-zinc-600 dark:text-zinc-400";
                             
                             if (isSelected) {
                                borderClass = "border-indigo-500 ring-1 ring-indigo-500";
                                bgClass = "bg-indigo-50 dark:bg-indigo-500/10";
                                textClass = "text-indigo-700 dark:text-indigo-300 font-medium";
                             }

                             if (quizScore !== null) {
                                if (isCorrect) {
                                  borderClass = "border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-500/10";
                                  textClass = "text-green-700 dark:text-green-300 font-medium";
                                } else if (isWrong) {
                                  borderClass = "border-red-500 bg-red-50 dark:bg-red-500/10 opacity-70";
                                  textClass = "text-red-700 dark:text-red-300 line-through";
                                } else if (!isCorrect) {
                                  borderClass = "border-zinc-200 dark:border-zinc-800 opacity-50";
                                }
                             }

                             return (
                               <button
                                 key={oIndex}
                                 disabled={quizScore !== null}
                                 onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIndex]: opt }))}
                                 className={`text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${borderClass} ${bgClass}`}
                               >
                                  <span className={textClass}>{opt}</span>
                                  {quizScore !== null && isCorrect && <Check size={16} className="text-green-500" />}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                     {quizScore === null ? (
                       <button 
                         onClick={() => {
                            let score = 0;
                            activeChapter.quizzes!.forEach((q, i) => {
                              if (selectedAnswers[i] === q.answer) score++;
                            });
                            setQuizScore(score);
                         }}
                         disabled={Object.keys(selectedAnswers).length < activeChapter.quizzes.length}
                         className="bg-indigo-600 w-full md:w-auto text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         Submit Answers
                       </button>
                     ) : (
                       <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                         <div className="flex-1 w-full bg-zinc-100 dark:bg-zinc-800/80 p-5 rounded-2xl flex items-center justify-between">
                           <div>
                             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Final Score</p>
                             <p className="text-3xl font-black text-zinc-900 dark:text-white">
                               {quizScore} <span className="text-xl text-zinc-400">/ {activeChapter.quizzes.length}</span>
                             </p>
                           </div>
                           <div className="text-right">
                             <p className={`font-bold text-lg ${quizScore === activeChapter.quizzes.length ? "text-green-500" : quizScore >= activeChapter.quizzes.length / 2 ? "text-indigo-500" : "text-amber-500"}`}>
                               {quizScore === activeChapter.quizzes.length ? "Perfect! 🏆" : quizScore >= activeChapter.quizzes.length / 2 ? "Good Job! 👍" : "Needs Review 📚"}
                             </p>
                           </div>
                         </div>
                         <button 
                            onClick={() => { setQuizScore(null); setSelectedAnswers({}); setShowQuiz(false); }}
                            className="px-6 py-4 w-full md:w-auto rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-700 dark:text-zinc-300"
                         >
                           Retry Quiz
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>
      </main>

      {/* Floating AI Chat */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
          >
            <Bot size={28} />
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[500px] max-h-[80vh]">
            <div className="p-4 bg-indigo-600 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 font-bold">
                 <Bot size={20} /> Course AI Assistant
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
              {chatMessages.length === 0 ? (
                <div className="text-center text-zinc-500 dark:text-zinc-400 mt-10 text-sm">
                  <Bot size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Ask me anything about <b>{course.courseName}</b>!</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none"}`}>
                       <div className="prose dark:prose-invert prose-sm max-w-none">
                         <ReactMarkdown>{msg.content}</ReactMarkdown>
                       </div>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs rounded-bl-none animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                className="flex items-center gap-2 relative"
              >
                <input 
                  type="text"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-zinc-900 dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full disabled:opacity-50"
                >
                  <Send size={14} className={chatInput.trim() ? "translate-x-[-1px]" : ""} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
