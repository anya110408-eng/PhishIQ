import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Mail,
  Lock,
  LogOut,
  UserPlus,
  LogIn,
  Sparkles,
  ShieldCheck,
  User,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import {
  auth,
  googleProvider
} from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [mode, setMode] = useState<"login" | "signup" | "account">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setMode("account");
    } else {
      setMode("login");
    }
    setErrorMsg("");
    setSuccessMsg("");
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim()) {
        await updateProfile(userCred.user, { displayName: displayName.trim() });
      }
      setSuccessMsg("Account created and signed in successfully!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg("Signed in with Google!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Google Sign-In was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await signInAnonymously(auth);
      setSuccessMsg("Signed in as Guest Analyst!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Guest sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setSuccessMsg("Logged out successfully.");
      setMode("login");
    } catch (err: any) {
      setErrorMsg("Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono-code space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 tracking-wider uppercase">
                {mode === "account" ? "Security Account" : mode === "login" ? "Analyst Sign In" : "Register New Account"}
              </h3>
              <p className="text-[11px] text-slate-400">
                PhishIQ SOC Authentication Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* View 1: Active Account Details & Switcher */}
        {mode === "account" && currentUser && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/80 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : "A"}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-100">
                    {currentUser.displayName || (currentUser.isAnonymous ? "Guest Security Analyst" : "Authenticated Analyst")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser.email || (currentUser.isAnonymous ? "Anonymous Session ID: " + currentUser.uid.substring(0, 8) : "Registered User")}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-cyan-400">
                <span>STATUS: ACTIVE AUTHENTICATED</span>
                <span>UID: {currentUser.uid.substring(0, 10)}...</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => setMode("signup")}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-cyan-400" />
                Register Another / Additional Account
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 shadow"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Account
              </button>
            </div>
          </div>
        )}

        {/* View 2: Sign In Form */}
        {mode === "login" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@sec-firm.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase">OR SIGN IN WITH</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Google
              </button>
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Guest Mode
              </button>
            </div>

            <div className="pt-2 text-center text-xs">
              <span className="text-slate-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign Up / Create Account
              </button>
            </div>
          </form>
        )}

        {/* View 3: Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Full Name / Analyst Alias
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Rivera (SOC Lead)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Register New Account
            </button>

            <div className="pt-2 text-center text-xs">
              <span className="text-slate-400">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
