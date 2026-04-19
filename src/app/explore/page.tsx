"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Compass, BookOpen, Search, Sparkles, LogIn, Menu, X, ArrowRight, Globe, Users } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const BrandLogo = () => (
  <Link href="/" className="flex items-center group cursor-pointer">
    <img 
      src="/images/logo/logo-light.png" 
      className="h-10 md:h-12 w-auto block dark:hidden transition-all duration-300" 
      alt="Coursify Logo" 
    />
    <img 
      src="/images/logo/logo-dark.png" 
      className="h-10 md:h-12 w-auto hidden dark:block transition-all duration-300" 
      alt="Coursify Logo" 
    />
  </Link>
);

export default function ExplorePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("status", "==", "public"));
        const snapshots = await getDocs(q);
        setCourses(snapshots.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching public courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] font-sans selection:bg-cyan-500/20 overflow-x-hidden">
      {/* Navbar Integration */}
      <nav className="bg-white/60 dark:bg-[#09090b]/60 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
               <Link href="/dashboard" className="text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-full hover:scale-105 transition-transform">
                 My Dashboard
               </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-full hover:scale-105 transition-transform">
                <LogIn size={16} /> Sign In
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-[#09090b] z-40 p-6 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-6">
              {user ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b border-zinc-100 dark:border-zinc-800 pb-4 flex justify-between items-center">
                  My Dashboard <ArrowRight size={20} />
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4 flex justify-between items-center">
                  Sign In <LogIn size={20} />
                </Link>
              )}
              <Link href="/create" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20">
                Generate New Course
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-6 transition-all animate-slide-up">
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Community Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
            Discover Public Knowledge.
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Browse high-quality learning paths generated by thousands of users across the globe.
          </p>
          
          {/* Search Bar */}
          <div className="relative group max-w-xl mx-auto">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
               <Search size={20} className="text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
             </div>
             <input 
               type="text"
               placeholder="Search by topic, keyword, or category..."
               className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-900 dark:text-white font-medium"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-zinc-200 dark:bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-white/10">
            <div className="w-20 h-20 bg-zinc-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">No courses found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-sm mb-8 leading-relaxed">
              Try adjusting your search terms or be the first to publish a public course!
            </p>
            <Link href="/create" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
               Generate New Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <Link 
                key={course.id} 
                href={`/course/${course.id}`}
                className="group relative bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-blue-500 text-white p-2 rounded-xl shadow-lg">
                      <Compass size={18} />
                   </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1 mb-6 border border-blue-500/10">
                   {course.category}
                </div>
                
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.courseName}
                </h3>
                
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-8">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-white/5">
                   <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                      <BookOpen size={16} className="text-blue-500" />
                      <span>{course.chapters?.length || 0} Modules</span>
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                      {course.difficulty || "Beginner"}
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
