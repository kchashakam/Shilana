import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArchiveList } from './components/ArchiveList';
import { AddPrescriptionForm } from './components/AddPrescriptionForm';
import { AIAnalyzerSection } from './components/AIAnalyzerSection';
import { PrescriptionDetailModal } from './components/PrescriptionDetailModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { AuthModal } from './components/AuthModal';
import { SAMPLE_PRESCRIPTIONS } from './data/sampleData';
import { Prescription } from './types';
import { Shield, Sparkles, Heart, Info, LogIn, Lock } from 'lucide-react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  FirebaseUser 
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'archive' | 'add' | 'scan'>('archive');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraCaptureCallback, setCameraCaptureCallback] = useState<((dataUrl: string) => void) | null>(null);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Synchronization (Firestore for logged in user, localStorage for guest)
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // User is logged in: Subscribe to Firestore collection /users/{uid}/prescriptions
      const userPrescriptionsRef = collection(db, 'users', user.uid, 'prescriptions');
      const unsubscribe = onSnapshot(userPrescriptionsRef, (snapshot) => {
        const docsData: Prescription[] = [];
        snapshot.forEach((docSnap) => {
          docsData.push({ id: docSnap.id, ...docSnap.data() } as Prescription);
        });
        
        // Sort descending by createdAt
        docsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPrescriptions(docsData);
      }, (error) => {
        console.error('Firestore snapshot error:', error);
      });

      return () => unsubscribe();
    } else {
      // Guest mode: load from localStorage or sample
      try {
        const saved = localStorage.getItem('prescriptions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPrescriptions(parsed);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load guest prescriptions', e);
      }
      setPrescriptions(SAMPLE_PRESCRIPTIONS);
    }
  }, [user, authLoading]);

  // Sync to localStorage when in guest mode
  useEffect(() => {
    if (!user && !authLoading) {
      try {
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
      } catch (e) {
        console.error('Failed to save guest prescriptions', e);
      }
    }
  }, [prescriptions, user, authLoading]);

  // Handlers for Save, Delete, Favorite
  const handleSavePrescription = async (newPresc: Prescription) => {
    if (user) {
      try {
        // Save to user's Firestore
        const prescDocRef = doc(db, 'users', user.uid, 'prescriptions', newPresc.id);
        await setDoc(prescDocRef, newPresc);
      } catch (err) {
        console.error('Error saving to Firestore:', err);
      }
    } else {
      // Guest mode
      setPrescriptions((prev) => [newPresc, ...prev]);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (window.confirm('ئایا دڵنیایت لە سڕینەوەی ئەم ڕاچێتەیە لە ئەرشیف؟')) {
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'prescriptions', id));
        } catch (err) {
          console.error('Error deleting from Firestore:', err);
        }
      } else {
        setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      }

      if (selectedPrescription?.id === id) {
        setSelectedPrescription(null);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const target = prescriptions.find((p) => p.id === id);
    if (!target) return;

    const newFavStatus = !target.isFavorite;

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'prescriptions', id), {
          isFavorite: newFavStatus,
        });
      } catch (err) {
        console.error('Error updating favorite in Firestore:', err);
      }
    } else {
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite: newFavStatus } : p))
      );
    }

    if (selectedPrescription?.id === id) {
      setSelectedPrescription((prev) => (prev ? { ...prev, isFavorite: newFavStatus } : null));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleOpenCamera = (onCapture: (dataUrl: string) => void) => {
    setCameraCaptureCallback(() => onCapture);
    setIsCameraOpen(true);
  };

  const handleAnalyzeSpecific = (prescription: Prescription) => {
    setActiveTab('scan');
  };

  const handleRestoreSamples = async () => {
    if (user) {
      // Seed sample prescriptions into user's Firestore
      try {
        for (const sample of SAMPLE_PRESCRIPTIONS) {
          await setDoc(doc(db, 'users', user.uid, 'prescriptions', sample.id), sample);
        }
      } catch (err) {
        console.error('Error seeding sample data:', err);
      }
    } else {
      setPrescriptions(SAMPLE_PRESCRIPTIONS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col" dir="rtl">
      
      {/* Navigation Header */}
      <Navbar
        totalCount={prescriptions.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* Guest Banner if not logged in */}
        {!user && !authLoading && (
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-800/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-900 border border-teal-700 text-teal-300 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  ئەژمێری تایبەتی خۆت دروست بکه!
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  تۆ ئێستا لە دۆخی میواندایت. بچۆ ژوورەوە تا ڕاچێتەکانت لە گەنجینەی ئۆنلاین (Cloud) بە شێوەیەکی دەستگەیشتوو و تایبەت پاشەکەوت ببن.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-950/60 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>تۆمارکردن / چوونەژوورەوە</span>
            </button>
          </div>
        )}

        {/* Banner Quick Tip */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-200">
                شیکردنەوەی خەتی دکتۆر بە Gemini AI
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تەنها وێنەی ڕاچێتەکەت دابنێ؛ ژیری دەستکرد ناو و ژەمەکانی دەرمانەکان بە کوردی ڕوون دەکاتەوە.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              تەواو تایبەت و پارێزراو
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'archive' && (
          <ArchiveList
            prescriptions={prescriptions}
            userEmail={user?.email || undefined}
            onDelete={handleDeletePrescription}
            onToggleFavorite={handleToggleFavorite}
            onSelectPrescription={(p) => setSelectedPrescription(p)}
            onAnalyzeSpecific={handleAnalyzeSpecific}
            onRestoreSamples={handleRestoreSamples}
          />
        )}

        {activeTab === 'scan' && (
          <AIAnalyzerSection
            archive={prescriptions}
            onSaveToArchive={handleSavePrescription}
            onOpenCamera={handleOpenCamera}
          />
        )}

        {activeTab === 'add' && (
          <AddPrescriptionForm
            onSave={(p) => {
              handleSavePrescription(p);
              setActiveTab('archive');
            }}
            onOpenCamera={handleOpenCamera}
          />
        )}

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Prescription Detail Modal */}
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        onToggleFavorite={handleToggleFavorite}
        onAnalyzeSpecific={handleAnalyzeSpecific}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imageDataUrl) => {
          if (cameraCaptureCallback) {
            cameraCaptureCallback(imageDataUrl);
          }
        }}
      />

      {/* Kurdish Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <span>سیستمی زیرەکی ڕاچێتەکان • دروستکراوە بە</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>بۆ تەندروستی خێزانەکەت</span>
          </p>
          <p className="flex items-center gap-1 text-[11px] text-slate-600">
            <Info className="w-3.5 h-3.5" />
            <span>ئەم ئەپڵیکەیشنە یارمەتیدەرە و جێگەی ڕاوێژی تەواوی پزیشک یان دەرمانساز ناگرێتەوە.</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
