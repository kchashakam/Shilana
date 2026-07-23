import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Printer, Sparkles, Stethoscope, MapPin, User, Calendar, Pill, AlertTriangle, Star, FileText, Loader2 } from 'lucide-react';
import { Prescription } from '../types';
import { exportSinglePrescriptionPDF } from '../utils/pdfExport';

interface PrescriptionDetailModalProps {
  prescription: Prescription | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onAnalyzeSpecific: (prescription: Prescription) => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  prescription,
  onClose,
  onToggleFavorite,
  onAnalyzeSpecific,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = prescription.image;
    link.download = `Prescription-${prescription.doctorName.replace(/\s+/g, '_')}-${Date.now()}.png`;
    link.click();
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await exportSinglePrescriptionPDF(prescription);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('کێشەیەک ڕوویدا لە دروستکردنی پەڕەی PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formattedDate = new Date(prescription.createdAt).toLocaleDateString('ku-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-400">{prescription.doctorName}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{prescription.specialty}</span>
                {prescription.area && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <MapPin className="w-3 h-3" />
                      {prescription.area}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(prescription.id)}
              className={`p-2 rounded-xl border transition ${
                prescription.isFavorite
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${prescription.isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Main Prescription Image View with Zoom controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">وێنەی ڕاچێتە:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>گەورەکردن</span>
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
                  <span>بچووککردنەوە</span>
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:text-white text-[11px]"
                >
                  سەرەتایی
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-auto p-2 max-h-96 flex items-center justify-center">
              <img
                src={prescription.image}
                alt={prescription.doctorName}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="max-h-88 w-auto object-contain rounded-xl transition-transform duration-200"
              />
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">ناوی نەخۆش:</span>
              <span className="font-bold text-slate-200">{prescription.patientName || 'نادیار'}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1">بەرواری زیادکردن:</span>
              <span className="font-bold text-slate-200">{formattedDate}</span>
            </div>
          </div>

          {/* Transcribed Notes */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-400">نۆت و دەرمانە نوسراوەکان:</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {prescription.notes}
            </p>
          </div>

          {/* Medicines breakdown if available */}
          {prescription.medicines && prescription.medicines.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-400" />
                لیستی دەرمانەکان:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {prescription.medicines.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-400">{idx + 1}. {m.name}</span>
                      {m.dosage && <span className="text-slate-400 mr-2">({m.dosage})</span>}
                    </div>
                    <span className="text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {m.frequency || ''} {m.instructions || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Summary if available */}
          {prescription.aiAnalysis && (
            <div className="bg-cyan-950/40 border border-cyan-800/60 p-4 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                شیکاریی پێشووتری Gemini AI:
              </h3>
              <p className="text-xs text-cyan-100 leading-relaxed">
                {prescription.aiAnalysis.aiSummary}
              </p>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAnalyzeSpecific(prescription);
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>شیکردنەوە بە AI</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>دروستکردنی PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>داگرتنی PDF بۆ پزیشک</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>داگرتنی وێنە</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>چاپکردن</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
