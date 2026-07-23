import React, { useState } from 'react';
import { Sparkles, Camera, Upload, Pill, CheckCircle2, AlertTriangle, RefreshCw, FilePlus, ChevronRight, Stethoscope, User, MapPin } from 'lucide-react';
import { Prescription, AIAnalysisResult } from '../types';

interface AIAnalyzerSectionProps {
  archive: Prescription[];
  onSaveToArchive: (prescription: Prescription) => void;
  onOpenCamera: (onCapture: (imageDataUrl: string) => void) => void;
}

export const AIAnalyzerSection: React.FC<AIAnalyzerSectionProps> = ({ archive, onSaveToArchive, onOpenCamera }) => {
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('قەبارەی وێنەکە زیاترە لە 10 مێگابایت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanImage(reader.result as string);
        setErrorMsg('');
        setAnalysisResult(null);
        setSavedSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    onOpenCamera((capturedDataUrl) => {
      setScanImage(capturedDataUrl);
      setErrorMsg('');
      setAnalysisResult(null);
      setSavedSuccess(false);
    });
  };

  const runAnalysis = async () => {
    if (!scanImage) {
      setErrorMsg('تکایە سەرەتا وێنەی ڕاچێتە نوێیەکە هەڵبژێرە یان وێنەیەکی بگرە.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setAnalysisResult(null);
    setSavedSuccess(false);

    try {
      // Prepare simplified archive context for Gemini comparison
      const archiveContext = archive.map((item) => ({
        doctorName: item.doctorName,
        specialty: item.specialty,
        area: item.area,
        notes: item.notes,
      }));

      const res = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: scanImage,
          mimeType: scanImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          archiveContext,
          userNotes: userNote,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'کێشەیەک ڕوویدا لە کاتی پەیوەندیکردن بە Gemini AI.');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'کێشەیەک ڕوویدا لە شیکردنەوەی ڕاچێتەکەدا. تکایە دووبارە هەوڵبدەرەوە.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalyzedPrescription = () => {
    if (!scanImage || !analysisResult) return;

    // Build prescription notes string from identified medicines
    const medsNotes = analysisResult.medicines && analysisResult.medicines.length > 0
      ? analysisResult.medicines.map(m => `${m.name} (${m.dosage || ''}) - ${m.frequency || ''} - ${m.instructions || ''}`).join(' | ')
      : analysisResult.aiSummary;

    const newPrescription: Prescription = {
      id: 'presc-' + Date.now(),
      doctorName: analysisResult.doctorName.startsWith('د.') ? analysisResult.doctorName : `د. ${analysisResult.doctorName}`,
      specialty: analysisResult.specialty || 'پزیشکی گشتی',
      area: analysisResult.area || 'سلێمانی',
      notes: medsNotes,
      image: scanImage,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      medicines: analysisResult.medicines,
      aiAnalysis: analysisResult,
    };

    onSaveToArchive(newPrescription);
    setSavedSuccess(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            شیکەرەوەی ڕاچێتە بە Gemini AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            وێنەی ڕاچێتە نوێیەکە دابنێ تا AI خەتەکە بخوێنێتەوە، بەراوردی بکات بە ئەرشیفەکەت، و ناو و ژەمی دەرمانەکان بە کوردی ڕوون بکاتەوە.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Image Selector */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/70 hover:bg-slate-950 rounded-2xl cursor-pointer transition text-center group">
            <Upload className="w-7 h-7 text-cyan-400 group-hover:scale-110 transition mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">هەڵبژاردنی وێنەی ڕاچێتە</span>
            <span className="text-[10px] text-slate-400 mt-0.5">لە ئامێرەکەتەوە</span>
            <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleCameraCapture}
            className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/70 hover:bg-slate-950 rounded-2xl transition text-center group"
          >
            <Camera className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">وێنەگرتن بە کامێرا</span>
            <span className="text-[10px] text-slate-400 mt-0.5">بە کامێرای ڕاستەوخۆ</span>
          </button>
        </div>

        {/* User extra note input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            تێبینی یان پرسیاری تایبەت بۆ AI (ئارەزوومەندانە):
          </label>
          <input
            type="text"
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="نموونە: ئایا ئەم دەرمانە بۆ زەخت دەبێت؟ یان ئەم خەتە لە هی دکتۆر عومەر دەچێت؟"
            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Selected Image Preview & Scan Action */}
        {scanImage && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={scanImage}
                alt="وێنەی دیاریکراو"
                className="w-full sm:w-44 h-36 object-contain rounded-xl bg-slate-900 border border-slate-800"
              />
              <div className="flex-1 space-y-2 text-right">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60 inline-block">
                  ✓ وێنە ئامادەیە بۆ شیکردنەوە
                </span>
                <p className="text-xs text-slate-400">
                  کرتە لە دوگمەی خوارەوە بکە تا Gemini API وێنەکە و ئەرشیفەکەت بەراورد بکات.
                </p>
                <button
                  onClick={() => {
                    setScanImage(null);
                    setAnalysisResult(null);
                  }}
                  className="text-xs text-rose-400 hover:underline inline-block mt-1"
                >
                  گۆڕینی وێنە
                </button>
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-bold p-4 rounded-2xl transition duration-200 shadow-xl flex items-center justify-center gap-2.5 text-base"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>ژیری دەستکرد خەریکی شیکردنەوە و بەراوردکارییە...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>🔍 ناردن بۆ Gemini AI و شیکردنەوە</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className="bg-slate-950 border border-cyan-800/80 rounded-3xl p-5 sm:p-6 space-y-5 animate-fadeIn shadow-2xl">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-lg font-bold text-cyan-300">ئەنجامی شیکردنەوەی Gemini AI</h3>
            </div>
            {analysisResult.confidenceScore && (
              <span className="text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
                دڵنیایی AI: {analysisResult.confidenceScore}%
              </span>
            )}
          </div>

          {/* Doctor & Specialty Info Recognized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                ناوی پزیشک
              </span>
              <span className="font-bold text-sm text-emerald-300">{analysisResult.doctorName}</span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                پسپۆڕی
              </span>
              <span className="font-bold text-sm text-teal-300">{analysisResult.specialty}</span>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                ناوچە / شوێن
              </span>
              <span className="font-bold text-sm text-amber-300">{analysisResult.area || 'دیاری نەکراو'}</span>
            </div>
          </div>

          {/* Handwriting Match Comparison */}
          {analysisResult.handwritingMatch && (
            <div className="bg-cyan-950/40 border border-cyan-800/50 p-3.5 rounded-2xl text-xs sm:text-sm text-cyan-200 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-cyan-300 mb-0.5">بەراوردی خەتی دەست لەگەڵ ئەرشیف:</strong>
                <span>{analysisResult.handwritingMatch}</span>
              </div>
            </div>
          )}

          {/* Identified Medicines Table/List */}
          {analysisResult.medicines && analysisResult.medicines.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                دەرمانە دۆزراوەکان ({analysisResult.medicines.length}):
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {analysisResult.medicines.map((med, i) => (
                  <div key={i} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-400 text-sm">{i + 1}. {med.name}</span>
                      {med.dosage && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md mr-2">{med.dosage}</span>}
                      {med.purpose && <p className="text-xs text-slate-400 mt-1">مەبەست: {med.purpose}</p>}
                    </div>
                    <div className="text-right sm:text-left bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs text-cyan-300">
                      <div><strong>ژەم:</strong> {med.frequency || 'نادیار'}</div>
                      <div><strong>ڕێنمایی:</strong> {med.instructions || 'نییە'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary Text */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
            <strong className="block text-emerald-400">📝 پوختەی شیکاری AI:</strong>
            <p className="leading-relaxed whitespace-pre-line">{analysisResult.aiSummary}</p>
          </div>

          {/* Warnings list if any */}
          {analysisResult.warnings && analysisResult.warnings.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl space-y-2">
              <strong className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                ڕێنمایی و هۆشداریی گرنگی تەندروستی:
              </strong>
              <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-1">
                {analysisResult.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action: Save to Archive */}
          <div className="pt-2">
            {savedSuccess ? (
              <div className="bg-emerald-950 border border-emerald-700 text-emerald-300 p-3.5 rounded-2xl text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>ئەم ڕاچێتەیە پاشەکەوت کرا لە لیستی ئەرشیفەکەتدا!</span>
              </div>
            ) : (
              <button
                onClick={handleSaveAnalyzedPrescription}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-950/50"
              >
                <FilePlus className="w-5 h-5" />
                <span>پاشەکەوتکردنی ئەم ئەنجامە لە ئەرشیفی ڕاچێتەکاندا</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
