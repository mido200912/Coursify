"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ChevronRight, ChevronLeft, Sparkles, Rocket, Coffee, Search, PenLine, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Programming", "Health & Fitness", "Business", "Marketing", "Design", "Personal Development"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["1 Hour", "3 Hours", "1 Day", "1 Week", "1 Month"];

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Form State
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("1 Hour");
  const [includeVideo, setIncludeVideo] = useState(true);
  const [visibility, setVisibility] = useState("public");

  const handleGenerate = async () => {
    if (!user) return;
    
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, topic, difficulty, duration, includeVideo }),
      });

      if (!response.ok) throw new Error("Failed to generate course");

      const courseData = await response.json();

      // Save to Firestore
      const docRef = await addDoc(collection(db, "courses"), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        category,
        topic,
        difficulty,
        duration,
        includeVideo,
        status: visibility,
        ...courseData // courseName, description, chapters
      });

      router.push(`/course/${docRef.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate course. Check your API key.");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <motion.div 
          animate={{ y: [-20, 20, -20] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mb-8 p-6 bg-indigo-500/10 rounded-full text-indigo-500"
        >
          <Rocket size={64} />
        </motion.div>
         <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">Brewing your masterclass <Coffee size={28} className="text-amber-600" /></h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-center">
          Hang tight! We&apos;re building chapters, writing quizzes, and finding the best learning resources for you...
        </p>
        <div className="w-64 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-8 overflow-hidden">
           <motion.div 
             className="h-full bg-indigo-500"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 15, ease: "linear" }}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <Link href="/dashboard" className="font-black text-xl text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm">C</span>
          Coursify
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center pt-16 px-6">
        <div className="w-full max-w-2xl">
          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 -z-10 -translate-y-1/2" />
            
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= i 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-700"
              }`}>
                {i}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">What are you curious about? <Search size={22} className="text-indigo-500" /></h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Pick a category to get started</p>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`p-4 rounded-xl text-left font-medium transition-all border ${
                          category === cat 
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20" 
                            : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Tell us more <PenLine size={22} className="text-indigo-500" /></h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">The more specific, the better the course</p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">What exactly do you want to learn?</label>
                      <textarea
                        rows={4}
                        placeholder="e.g. How to build a Full-Stack application using Next.js, Firebase, and OpenRouter AI."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Almost there! <Zap size={22} className="text-amber-500" /></h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Fine-tune your preferences</p>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Difficulty Level</label>
                      <div className="flex gap-3">
                        {DIFFICULTIES.map(diff => (
                          <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                              difficulty === diff ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Expected Duration</label>
                      <div className="flex flex-wrap gap-3">
                        {DURATIONS.map(dur => (
                           <button
                             key={dur}
                             onClick={() => setDuration(dur)}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                               duration === dur ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/50" : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                             }`}
                           >
                             {dur}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                         <h4 className="font-semibold text-zinc-900 dark:text-white">Include YouTube Videos?</h4>
                         <p className="text-xs text-zinc-500 dark:text-zinc-400">Match generated chapters with real resources</p>
                      </div>
                      <button 
                        onClick={() => setIncludeVideo(!includeVideo)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${includeVideo ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                      >
                         <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${includeVideo ? "left-7" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                         <h4 className="font-semibold text-zinc-900 dark:text-white">Visibility</h4>
                         <p className="text-xs text-zinc-500 dark:text-zinc-400">Public courses appear in the Community Explore page.</p>
                      </div>
                      <select 
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                         <option value="public">Public</option>
                         <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !category || step === 2 && !topic}
                  className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  <Sparkles size={20} /> Generate Course
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
