"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { 
  ArrowRight, Sparkles, PlayCircle, FileText, CheckCircle2, 
  MessageSquare, Compass, BrainCircuit, Zap, GraduationCap, 
  Bot, Star, BookOpen, ArrowUpRight, Menu, X 
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

// --- Components ---

const BrandLogo = () => (
  <Link href="/" className="flex items-center group cursor-pointer">
    <img 
      src="/images/logo/logo-light.png" 
      className="h-16 md:h-24 w-auto block dark:hidden transition-all duration-300 group-hover:scale-105" 
      alt="Coursify Logo" 
    />
    <img 
      src="/images/logo/logo-dark.png" 
      className="h-16 md:h-24 w-auto hidden dark:block transition-all duration-300 group-hover:scale-105" 
      alt="Coursify Logo" 
    />
  </Link>
);

// --- Hooks ---

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed", "opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    
    const children = element.querySelectorAll(".reveal-item");
    children.forEach((child) => observer.observe(child));
    
    return () => observer.disconnect();
  }, []);
  
  return ref;
}

// --- Data ---

const PLATFORM_FEATURES = [
  { icon: BrainCircuit, title: "AI Curriculum Engine", desc: "Describe your learning goals, and the engine architects a comprehensive, multi-chapter syllabus instantly.", theme: "cyan" },
  { icon: PlayCircle, title: "Smart Video Curation", desc: "Chapters auto-embed the highest-rated YouTube tutorials perfectly matched to the context.", theme: "blue" },
  { icon: CheckCircle2, title: "Interactive Quizzes", desc: "Targeted MCQ assessments generated per chapter to reinforce retention with immediate feedback.", theme: "amber" },
  { icon: FileText, title: "PDF Exports", desc: "Download beautifully formatted, print-ready documents of your generated courses.", theme: "slate" },
  { icon: MessageSquare, title: "Community Notes", desc: "Collaborate, leave insights, and ask questions with other learners on the same topic.", theme: "cyan" },
  { icon: Compass, title: "Public Directory", desc: "Publish your generated courses or explore thousands of high-quality, community-made masterclasses.", theme: "blue" },
];

const THEME_MAP: Record<string, string> = {
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

// --- Page Component ---

export default function LandingPage() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const featuresRef = useScrollReveal();
  const stepsRef = useScrollReveal();
  const chatRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] font-sans selection:bg-cyan-500/20 overflow-x-hidden">
      
      <nav className="bg-white/60 dark:bg-[#09090b]/60 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />
          <div className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Directory</Link>
            <ThemeToggle />
            {user ? (
               <Link href="/dashboard" className="text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 rounded-full hover:scale-105 transition-transform">
                 Go to Dashboard
               </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                  Get Started
                </Link>
              </div>
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
              <Link href="/explore" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4 flex justify-between items-center">
                Explore Courses <Compass size={20} />
              </Link>
              {user ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b border-zinc-100 dark:border-zinc-800 pb-4 flex justify-between items-center">
                  My Dashboard <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4 flex justify-between items-center">
                    Sign In <ArrowRight size={20} />
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="bg-indigo-600 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-8">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Powered by Gemini AI</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                Generate structured <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">courses</span> in seconds.
              </h1>

              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Coursify instantly transforms any topic into a multi-chapter syllabus complete with curated videos, notes, and AI-generated assessments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={user ? "/dashboard" : "/create"} className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  {user ? "Go to Dashboard" : "Start Learning"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/explore" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white rounded-xl font-semibold hover:bg-zinc-200 dark:hover:bg-white/10 transition-all">
                  <Compass size={18} /> Explore Library
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5"><Zap size={16} className="text-amber-500" /> Instant</span>
                <span className="flex items-center gap-1.5"><Star size={16} className="text-cyan-500" /> Free Tier</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-blue-500" /> All Levels</span>
              </div>
            </div>

            {/* Dashboard Visualizer */}
            <div className="relative hidden lg:block perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 rounded-3xl blur-2xl transform rotate-3" />
              
              <div className="relative bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#18181b]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="mx-auto bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/5 rounded-md px-24 py-1">
                    <span className="text-[10px] text-zinc-400 font-mono">coursify.app/learn/system-design</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                      <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="h-4 w-1/3 bg-zinc-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-1/4 bg-zinc-100 dark:bg-white/5 rounded" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {["System Architecture Basics", "Scalability Patterns", "Database Sharding"].map((ch, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20" : "bg-zinc-50 dark:bg-white/5 border-transparent"}`}>
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-cyan-600 text-white" : "bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"}`}>
                          0{i + 1}
                        </div>
                        <span className={`text-sm font-medium ${i === 0 ? "text-cyan-800 dark:text-cyan-300" : "text-zinc-600 dark:text-zinc-400"}`}>{ch}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-32 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden group">
                     <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                       <PlayCircle size={24} className="text-zinc-800 dark:text-white" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-zinc-200/50 dark:border-white/5 bg-zinc-50 dark:bg-[#0f0f11]">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10s", label: "Avg. Generation Time" },
              { value: "Unlimited", label: "Topics Supported" },
              { value: "Smart", label: "AI Video Curation" },
              { value: "100%", label: "Free Core Features" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-zinc-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6" ref={featuresRef}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-700 ease-out">
              <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
                Designed for deep focus.
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                A unified workspace that brings together AI generation, video learning, and knowledge testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLATFORM_FEATURES.map((feature, i) => {
                const themeClasses = THEME_MAP[feature.theme];
                return (
                  <div
                    key={i}
                    className="reveal-item opacity-0 translate-y-8 transition-all duration-700 ease-out group p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#121214] hover:border-zinc-300 dark:hover:border-white/10"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${themeClasses}`}>
                      <feature.icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="py-24 px-6 bg-zinc-50 dark:bg-[#0f0f11] border-y border-zinc-200/50 dark:border-white/5 overflow-hidden" ref={chatRef}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-item opacity-0 translate-y-8 transition-all duration-700 ease-out">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                Contextual AI
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">
                Never get stuck. <br/>
                <span className="text-zinc-400 dark:text-zinc-500">Your personal tutor is here.</span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Every course is equipped with a context-aware AI assistant. It knows exactly what chapter you are on, ready to clarify concepts, provide code snippets, or test your knowledge.
              </p>
              <Link href="/create" className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-semibold hover:gap-3 transition-all group">
                Experience it now <ArrowUpRight size={18} className="text-cyan-500" />
              </Link>
            </div>

            <div className="reveal-item opacity-0 translate-y-8 transition-all duration-700 ease-out delay-150">
              <div className="relative bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/5 flex items-center gap-3 bg-zinc-50/50 dark:bg-black/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Coursify Bot</h4>
                    <p className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Online</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                      How does a Load Balancer actually work?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-blue-600/10 text-blue-900 dark:text-blue-100 border border-blue-600/20 px-4 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] leading-relaxed">
                      Think of it like a traffic cop at a busy intersection. It distributes incoming network traffic across multiple servers to ensure no single server bears too much demand. This improves responsiveness and availability of applications.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-6">
              Start building your knowledge base.
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10">
              Join thousands of learners generating personalized, highly-focused educational content.
            </p>
            <Link href={user ? "/dashboard" : "/create"} className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
              {user ? "Back to Dashboard" : "Generate Your First Course"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
        {/* Team Section */}
        <section className="py-24 px-6 relative overflow-hidden bg-zinc-50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-6">
                  <Star size={14} className="text-blue-500 fill-blue-500" />
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Meet the Creators</span>
                </div>
                <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Crafted by passionate developers.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Mohamed Elsayed", role: "Fullstack Developer", initial: "M", color: "from-blue-500 to-cyan-500" },
                { name: "Asmaa Mostafa", role: "App Developer", initial: "A", color: "from-purple-500 to-pink-500" },
                { name: "Bishoy Osama", role: "Frontend Developer", initial: "B", color: "from-indigo-500 to-blue-500" }
              ].map((member, i) => (
                <div key={i} className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-[2rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-black mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                    {member.initial}
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">{member.name}</h3>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/50 dark:border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <BrandLogo />
          </div>
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} Coursify. Built for modern learners.</p>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}