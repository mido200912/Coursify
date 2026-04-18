"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, UserPlus, AlertCircle, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/20 dark:bg-violet-500/10 mix-blend-multiply blur-[128px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-fuchsia-500/20 dark:bg-fuchsia-500/10 mix-blend-multiply blur-[128px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-lg font-black text-zinc-900 dark:text-white hover:opacity-80 transition">
            <span className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm">C</span>
            Coursify
          </Link>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2 flex items-center justify-center gap-2">Join Coursify <Sparkles size={24} className="text-amber-500" /></h1>
          <p className="text-zinc-500 dark:text-zinc-400">Your learning era starts here</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                placeholder="Make it strong"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-zinc-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {loading ? "Creating..." : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
          <span className="px-4 text-xs text-zinc-400 font-medium">OR</span>
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already a member?{" "}
          <Link href="/login" className="font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Sign in instead →
          </Link>
        </p>
      </div>
    </div>
  );
}
