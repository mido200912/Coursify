"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, BookOpen, PlusCircle, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Authenticating...</div>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6">
            <Link href="/" className="flex items-center">
              <img src="/images/logo/logo-light.png" className="h-12 md:h-16 w-auto block dark:hidden transition-transform hover:scale-105" alt="Coursify" />
              <img src="/images/logo/logo-dark.png" className="h-12 md:h-16 w-auto hidden dark:block transition-transform hover:scale-105" alt="Coursify" />
            </Link>
          </div>
          <nav className="px-4 space-y-2 mt-4">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
              <BookOpen size={20} /> My Courses
            </Link>
            <Link href="/explore" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
              <Globe size={20} /> Explore
            </Link>
            <Link href="/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-medium transition-colors">
              <PlusCircle size={20} /> Create New
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center justify-between mb-4 px-2">
             <span className="text-sm font-medium truncate max-w-[150px]">{user.email}</span>
             <ThemeToggle />
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 xl:p-12 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
