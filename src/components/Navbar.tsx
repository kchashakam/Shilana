import React from 'react';
import { Stethoscope, Sparkles, FolderArchive, ShieldCheck, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  totalCount: number;
  activeTab: 'archive' | 'add' | 'scan';
  setActiveTab: (tab: 'archive' | 'add' | 'scan') => void;
  user: FirebaseUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  totalCount, 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenAuth, 
  onLogout 
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3 text-right">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/30 shrink-0">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-l from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                ئەرشیف و شیکەرەوەی ڕاچێتە
              </h1>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>سیستمی زیرەکی ڕاچێتە پزیشکییەکان</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ئەرشیفی بەکارهێنەر
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs & User Auth */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          
          <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'archive'
                  ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>ئەرشیف</span>
              <span className="bg-emerald-950 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-bold border border-emerald-800/50">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'scan'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>سکان بە AI</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <span className="text-base font-bold">+</span>
              <span>زیادکردن</span>
            </button>
          </nav>

          {/* User Auth Profile Button */}
          <div className="shrink-0">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate text-slate-300" dir="ltr">
                    {user.email || 'بەکارهێنەر'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  title="دەچوونە دەرەوە"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">دەرچوون</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>چوونەژوورەوە / تۆمارکردن</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
