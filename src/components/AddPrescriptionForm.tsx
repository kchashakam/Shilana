import React, { useState } from 'react';
import { User, MapPin, Stethoscope, FileText, Upload, Camera, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Prescription } from '../types';

interface AddPrescriptionFormProps {
  onSave: (prescription: Prescription) => void;
  onOpenCamera: (onCapture: (imageDataUrl: string) => void) => void;
}

const COMMON_SPECIALTIES = [
  'دڵ و بۆریەکانی خوێن',
  'منداڵان و گەشەی منداڵ',
  'هەناو و کۆئەندامی هەرس',
  'ئافرەتان و لەدایکبوون',
  'پێست و جوانکاری',
  'دەمار و مێشک',
  'عەنتەر و گوێ و لووت',
  'ئێسک و جومگەکان',
  'ددان و شاوڵ'
];

export const AddPrescriptionForm: React.FC<AddPrescriptionFormProps> = ({ onSave, onOpenCamera }) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [area, setArea] = useState('');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('قەبارەی وێنەکە لە 10 مێگابایت گەورەترە. تکایە وێنەیەکی بچووکتر دیاری بکە.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    onOpenCamera((capturedDataUrl) => {
      setImagePreview(capturedDataUrl);
      setErrorMsg('');
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setErrorMsg('تکایە ناوی دکتۆر بنووسە.');
      return;
    }
    if (!notes.trim()) {
      setErrorMsg('تکایە نۆتەکان یان دەقاوای دەرمانەکان پڕبکەرەوە.');
      return;
    }
    if (!imagePreview) {
      setErrorMsg('تکایە وێنەی ڕاچێتەکە دیاری بکە یان وێنەیەکی بگرە.');
      return;
    }

    const newPrescription: Prescription = {
      id: 'presc-' + Date.now(),
      doctorName: doctorName.trim().startsWith('د.') ? doctorName.trim() : `د. ${doctorName.trim()}`,
      specialty: specialty.trim() || 'پزیشکی گشتی',
      area: area.trim() || 'سلێمانی',
      patientName: patientName.trim() || 'نەخۆش',
      notes: notes.trim(),
      image: imagePreview,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    onSave(newPrescription);
    setSuccessMsg('ڕاچێتەکە بە سەرکەوتوویی لە ئەرشیفدا پاشەکەوت کرا!');
    
    // Reset fields
    setDoctorName('');
    setSpecialty('');
    setArea('');
    setPatientName('');
    setNotes('');
    setImagePreview(null);
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-base">
              ➕
            </span>
            زیادکردنی ڕاچێتەی نوێ بۆ ئەرشیف
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            زانیارییەکانی ڕاچێتە و وێنەکەی داخڵ بکە تا بۆ هەمیشە لە ئەرشیفی تەندروستیتدا بپارێزرێت.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Doctor Name & Patient Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              ناوی دکتۆر / پزیشک *
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="نموونە: د. ئارام حەمەعەلی"
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              ناوی نەخۆش
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="نموونە: هێمن فاروق"
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition"
            />
          </div>
        </div>

        {/* Specialty & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              پسپۆڕی (دڵ، منداڵان، هەناو...)
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="پسپۆڕی پزیشک بنووسە..."
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
            />
            {/* Quick Specialty Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_SPECIALTIES.slice(0, 5).map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSpecialty(spec)}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl transition"
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              ناوچە / گەڕەک / نیشانی نۆڕینگە
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="نموونە: سلێمانی - سەرچنار / تەلاڕی پزیشکی"
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm transition"
            />
          </div>
        </div>

        {/* Prescription Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            نۆت و نووسینی دەقاوای دەرمانەکان *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="ناوی دەرمانەکان، ژەمەکان یان هەر ڕێنماییەکی دکتۆر بنووسە..."
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
          />
        </div>

        {/* Image Attachment Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              وێنەی ڕاچێتەکە *
            </span>
            <span className="text-[11px] text-slate-500">پشتیگیری JPG, PNG, WEBP دەکات</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File Upload Box */}
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 hover:bg-slate-950 rounded-2xl cursor-pointer transition text-center group">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 mb-1 transition" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-300">
                دیاریکردنی وێنە لە ئامێرەکەتەوە
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">یان ڕایبکێشە بۆ ئێرە</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Camera Capture Box */}
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-950 rounded-2xl transition text-center group"
            >
              <Camera className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 mb-1 transition" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-300">
                وێنەگرتنی ڕاستەوخۆ بە کامێرا
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">بە کامێرای موبایل یان کۆمپیوتەر</span>
            </button>
          </div>

          {/* Image Preview Box */}
          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center group">
              <img
                src={imagePreview}
                alt="پێشبینینی وێنەی ڕاچێتە"
                className="max-h-56 w-auto object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 left-2 bg-rose-600/90 text-white text-xs px-2.5 py-1 rounded-lg opacity-90 hover:opacity-100 transition shadow"
              >
                سڕینەوەی وێنە
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold p-4 rounded-2xl transition duration-200 shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 text-base"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>پاشەکەوتکردن لە ئەرشیف</span>
        </button>

      </form>
    </div>
  );
};
