"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { PlusCircle, BookText, Trash2, Globe, Lock, MoreVertical } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "courses"), where("userId", "==", user.uid));
        const snapshots = await getDocs(q);
        setCourses(snapshots.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this course?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const toggleStatus = async (e: React.MouseEvent, courseId: string, currentStatus: string) => {
    e.preventDefault();
    const newStatus = currentStatus === "public" ? "private" : "public";
    try {
      await updateDoc(doc(db, "courses", courseId), { status: newStatus });
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">Your Library <BookText size={28} className="text-blue-500" /></h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">All your courses, managed and organized.</p>
        </div>
        <Link 
          href="/create"
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
        >
          <PlusCircle size={20} />
          Create New
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[3rem] bg-zinc-50/50 dark:bg-white/5">
          <BookText className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-6" />
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-300">Start your journey</h3>
          <p className="text-zinc-500 dark:text-zinc-500 mt-2 text-center max-w-sm mb-8 leading-relaxed">
            Ready to learn something new? Let AI craft your personalized curriculum in seconds.
          </p>
          <Link href="/create" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
             Generate My First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Link 
              key={course.id} 
              href={`/course/${course.id}`}
              className="group block bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate pr-10">
                  {course.courseName}
                </h3>
                <button 
                  onClick={(e) => handleDelete(e, course.id)}
                  className="absolute top-8 right-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-8">
                {course.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-white/5">
                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {course.chapters?.length || 0} Modules
                 </div>
                 
                 <button 
                   onClick={(e) => toggleStatus(e, course.id, course.status)}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                     course.status === "public" 
                       ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20" 
                       : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400 border border-zinc-200 dark:border-white/10"
                   }`}
                 >
                   {course.status === "public" ? <Globe size={14} /> : <Lock size={14} />}
                   {course.status === "public" ? "Public" : "Private"}
                 </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
