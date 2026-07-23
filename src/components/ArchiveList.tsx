import React, { useState } from 'react';
import { Search, Filter, Star, Eye, Trash2, Sparkles, MapPin, Stethoscope, Calendar, Pill, FileText, Download, RotateCcw, Loader2 } from 'lucide-react';
import { Prescription, FilterCategory } from '../types';
import { exportArchiveHistoryPDF, exportSinglePrescriptionPDF } from '../utils/pdfExport';

interface ArchiveListProps {
  prescriptions: Prescription[];
  userEmail?: string;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectPrescription: (prescription: Prescription) => void;
  onAnalyzeSpecific: (prescription: Prescription) => void;
  onRestoreSamples: () => void;
}

export const ArchiveList: React.FC<ArchiveListProps> = ({
  prescriptions,
  userEmail,
  onDelete,
  onToggleFavorite,
  onSelectPrescription,
  onAnalyzeSpecific,
  onRestoreSamples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [isExportingArchive, setIsExportingArchive] = useState(false);
  const [exportingItemId, setExportingItemId] = useState<string | null>(null);

  // Extract unique specialties for dropdown
  const uniqueSpecialties = Array.from(
    new Set(prescriptions.map((p) => p.specialty).filter(Boolean))
  );

  // Filtering logic
  const filtered = prescriptions.filter((item) => {
    // Category match
    if (category === 'favorites' && !item.isFavorite) return false;

    // Specialty match
    if (selectedSpecialty !== 'all' && item.specialty !== selectedSpecialty) return false;

    // Search query match
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const docMatch = item.doctorName.toLowerCase().includes(query);
      const specMatch = item.specialty.toLowerCase().includes(query);
      const areaMatch = item.area.toLowerCase().includes(query);
      const notesMatch = item.notes.toLowerCase().includes(query);
      const patientMatch = item.patientName?.toLowerCase().includes(query);
      const medsMatch = item.medicines?.some((m) => m.name.toLowerCase().includes(query));

      return docMatch || specMatch || areaMatch || notesMatch || patientMatch || medsMatch;
    }

    return true;
  });

  // Sort: recent first
  const sortedList = [...filtered].sort((a, b) => {
    if (category === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Export handlers
  const handleExportArchive = async () => {
    if (sortedList.length === 0) return;
    try {
      setIsExportingArchive(true);
      await exportArchiveHistoryPDF(sortedList, userEmail);
    } catch (err) {
      console.error('Failed to export archive PDF', err);
      alert('کێشەیەک ڕوویدا لە دروستکردنی پەڕەی PDFی ئەرشیفەکە.');
    } finally {
      setIsExportingArchive(false);
    }
  };

  const handleExportSingle = async (prescription: Prescription, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setExportingItemId(prescription.id);
      await exportSinglePrescriptionPDF(prescription);
    } catch (err) {
      console.error('Failed to export single prescription PDF', err);
      alert('کێشەیەک ڕوویدا لە دروستکردنی پەڕەی PDF');
    } finally {
      setExportingItemId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
        
        {/* Top Header Row with PDF Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-200">
              ئەرشیفی ڕاچێتەکان ({sortedList.length})
            </h2>
            {searchTerm && (
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-lg">
                ئەنجامی گەڕان
              </span>
            )}
          </div>

          <button
            onClick={handleExportArchive}
            disabled={isExportingArchive || sortedList.length === 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 shrink-0"
            title="دەرکردنی سەرجەم ڕاچێتەکان وەک راپۆرتی PDF بۆ پزیشک"
          >
            {isExportingArchive ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>دروستکردنی ڕاپۆرت...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>داگرتنی ئەرشیفەکە بە PDF (ڕاپۆرتی پزیشکی)</span>
              </>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕان لە ئەرشیفدا (ناوی دکتۆر، دەرمان، پسپۆڕی، ناوچە...)"
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg hover:text-white"
            >
              پاکی بکەرەوە
            </button>
          )}
        </div>

        {/* Categories & Specialty Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          
          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              هەموو ڕاچێتەکان ({prescriptions.length})
            </button>

            <button
              onClick={() => setCategory('favorites')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                category === 'favorites'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>دڵخوازەکان ({prescriptions.filter((p) => p.isFavorite).length})</span>
            </button>

            <button
              onClick={() => setCategory('recent')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === 'recent'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              نوێترینەکان
            </button>
          </div>

          {/* Specialty Select */}
          {uniqueSpecialties.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">هەموو پسپۆڕییەکان</option>
                {uniqueSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Prescription List Cards */}
      {sortedList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto text-2xl">
            🗂️
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-300">هیچ ڕاچێتەیەک نه‌دۆزرایەوە</h3>
            <p className="text-xs text-slate-500">
              تکایە گەڕانەکەت بگۆڕە یان ڕاچێتەی نوێ پاشەکەوت بکە.
            </p>
          </div>
          {prescriptions.length === 0 && (
            <button
              onClick={onRestoreSamples}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>هێنانەوەی ڕاچێتە نموونەیییەکان</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedList.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('ku-IQ', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 sm:p-5 transition duration-200 shadow-xl flex flex-col justify-between space-y-4 group"
              >
                {/* Header & Doctor Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-emerald-400 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                        {item.doctorName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] font-semibold bg-slate-950 text-teal-300 border border-slate-800 px-2.5 py-0.5 rounded-lg">
                          {item.specialty}
                        </span>
                        {item.area && (
                          <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-slate-800/60">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {item.area}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-2 rounded-xl border transition ${
                        item.isFavorite
                          ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                      title={item.isFavorite ? 'لادان لە دڵخوازەکان' : 'زیادکردن بۆ دڵخوازەکان'}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Notes & Medicines Preview */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      <strong className="text-emerald-400">نۆت/دەرمان: </strong>
                      {item.notes}
                    </p>
                    {item.patientName && (
                      <p className="text-[11px] text-slate-500">
                        ناوی نەخۆش: <span className="text-slate-300">{item.patientName}</span>
                      </p>
                    )}
                  </div>

                  {/* Image Preview Thumbnail */}
                  <div
                    onClick={() => onSelectPrescription(item)}
                    className="relative cursor-pointer rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-36 group-hover:border-slate-700 transition flex items-center justify-center"
                  >
                    <img
                      src={item.image}
                      alt={item.doctorName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-4 h-4" />
                        سەیرکردنی گەورەکراو
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Date */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formattedDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleExportSingle(item, e)}
                      disabled={exportingItemId === item.id}
                      className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition disabled:opacity-50"
                      title="داگرتنی وەک PDF بۆ پێشکەشکردن بە پزیشک"
                    >
                      {exportingItemId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => onAnalyzeSpecific(item)}
                      className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition"
                      title="شیکردنەوەی خێرا بە AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>شیکردنەوە بە AI</span>
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition hover:bg-rose-950/40"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
