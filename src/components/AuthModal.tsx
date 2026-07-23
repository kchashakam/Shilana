import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  googleProvider, 
  signInWithPopup 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('تکایە ئیمەیڵ و وشەی تێپەڕ بنووسە.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('وشەی تێپەڕەکان وەک یەک نین.');
      return;
    }

    if (password.length < 6) {
      setError('وشەی تێپەڕ دەبێت لانی کەم ٦ پیت یان ژمارە بێت.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccess('بەسەرکەوتوویی چوویتە ژوورەوە!');
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setSuccess('ژمارەی ئەژمێری نوێ بەسەرکەوتوویی دروستکرا!');
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'کێشەیەک ڕوویدا لە کاتی هەوڵدان بۆ چوونەژوورەوە.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'ئیمەیڵ یان وشەی تێپەڕ هەڵەیە.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'فۆرماتی ئیمەیڵەکە دروست نییە.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess('بەسەرکەوتوویی بە ئیمەیڵی گووگڵ چوویتە ژوورەوە!');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('کێشەیەک ڕوویدا لە چوونەژوورەوە بە گووگڵ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Background glow decorative */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-400">
                {mode === 'login' ? 'چوونەژوورەوە بۆ ئەژمێر' : 'دروستکردنی ئەژمێری نوێ'}
              </h3>
              <p className="text-xs text-slate-400">
                ئەرشیفە ڕاچێتەکانت بەشێوەیەکی تایبەت بپارێزە
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800/80 text-rose-300 p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              ئیمەیڵ (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              وشەی تێپەڕ (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition dir-ltr text-right"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                دووبارەکردنەوەی وشەی تێپەڕ
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition dir-ltr text-right"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold p-3.5 rounded-2xl transition duration-200 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>چوونەژوورەوە</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>دروستکردنی ئەژمێر</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 absolute">یان</span>
        </div>

        {/* Google Sign in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold p-3 rounded-2xl transition flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>چوونەژوورەوە بە گووگڵ (Google)</span>
        </button>

        {/* Switch Mode Footer */}
        <div className="pt-2 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              ئەژمێرت نییە؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-emerald-400 font-bold hover:underline ml-1"
              >
                تۆمارکردنی نوێ
              </button>
            </p>
          ) : (
            <p>
              پێشتر ئەژمێرت هەبووە؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-emerald-400 font-bold hover:underline ml-1"
              >
                بچۆ ژوورەوە
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
