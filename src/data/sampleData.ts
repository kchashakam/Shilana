import { Prescription } from '../types';

// Helper to generate realistic SVG prescription images as Data URLs for sample items
function generateSamplePrescriptionSvg(doctorName: string, specialty: string, meds: string[]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#fcfbf7; font-family:'Segoe UI', sans-serif;">
    <rect width="600" height="800" fill="#fefdfa"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="#0ea5e9" stroke-width="2" rx="10"/>
    <rect x="30" y="30" width="540" height="110" fill="#f0f9ff" rx="8"/>
    
    <!-- Header -->
    <text x="300" y="65" text-anchor="middle" font-size="22" font-weight="bold" fill="#0369a1">د. ${doctorName}</text>
    <text x="300" y="92" text-anchor="middle" font-size="15" fill="#0284c7">پسپۆڕی ${specialty}</text>
    <text x="300" y="115" text-anchor="middle" font-size="12" fill="#64748b">سلێمانی - شەقامی ئۆرزدی / تەلارى پزیشكییەکان</text>
    <line x1="40" y1="150" x2="560" y2="150" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4"/>
    
    <!-- Patient Info -->
    <text x="540" y="180" text-anchor="end" font-size="14" font-weight="bold" fill="#334155">ناوی نەخۆش: ڕێبین عومەر</text>
    <text x="100" y="180" text-anchor="start" font-size="14" fill="#64748b">بەروار: 2026/05/14</text>
    <line x1="40" y1="200" x2="560" y2="200" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Rx Symbol -->
    <text x="50" y="260" font-size="48" font-weight="bold" fill="#0284c7" font-family="Georgia, serif">Rx</text>
    
    <!-- Cursive / Handwritten style medical prescriptions -->
    <g font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#1e293b">
      ${meds.map((med, idx) => `
        <text x="120" y="${300 + idx * 70}">${idx + 1}. ${med}</text>
        <line x1="120" y1="${320 + idx * 70}" x2="500" y2="${320 + idx * 70}" stroke="#94a3b8" stroke-width="1" opacity="0.4"/>
      `).join('')}
    </g>

    <!-- Footer Stamp -->
    <circle cx="480" cy="680" r="45" fill="none" stroke="#0284c7" stroke-width="2" opacity="0.6"/>
    <text x="480" y="675" text-anchor="middle" font-size="10" fill="#0284c7" font-weight="bold">مۆری دکتۆر</text>
    <text x="480" y="690" text-anchor="middle" font-size="9" fill="#0284c7">سلێمانی</text>
    
    <text x="300" y="750" text-anchor="middle" font-size="11" fill="#94a3b8">سیستمی ڕاچێتەی ئەلیکترۆنی پزیشکی</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'sample-1',
    doctorName: 'د. پشتیوان ئەحمەد',
    specialty: 'دڵ و بۆریەکانی خوێن',
    area: 'سلێمانی - سەرچنار',
    patientName: 'کامەران مستەفا',
    notes: 'Amlodipine 5mg (1x daily morning) - Atorvastatin 20mg (1x daily night) - Aspirin 81mg',
    createdAt: '2026-06-10T10:30:00.000Z',
    isFavorite: true,
    image: generateSamplePrescriptionSvg('پشتیوان ئەحمەد', 'دڵ و بۆریەکانی خوێن', [
      'Amlodipine 5mg - Tab i/d morning',
      'Atorvastatin 20mg - Tab i/d night',
      'Aspirin 81mg - Tab i/d after meal'
    ]),
    medicines: [
      { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'ڕۆژانە 1 دەنک', instructions: 'بەیانیان دوای نان', purpose: 'ڕێکخستنی پەستانی خوێن' },
      { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'ڕۆژانە 1 دەنک', instructions: 'شەوان پێش خەوتن', purpose: 'دابەزاندنی چەوری خوێن' },
      { name: 'Aspirin 81mg', dosage: '81mg', frequency: 'ڕۆژانە 1 دەنک', instructions: 'دوای ژەمی نیوەڕۆ', purpose: 'تەنککردنەوەی خوێن' }
    ]
  },
  {
    id: 'sample-2',
    doctorName: 'د. ڕۆژا عەلی',
    specialty: 'منداڵان و گەشەی منداڵ',
    area: 'هەولێر - 100 مەتری',
    patientName: 'ژینیا سەباح',
    notes: 'Amoxicillin Syrup 250mg/5ml (5ml 3x daily) - Paracetamol Drops - Vitamin D3',
    createdAt: '2026-07-01T14:15:00.000Z',
    isFavorite: false,
    image: generateSamplePrescriptionSvg('ڕۆژا عەلی', 'منداڵان و گەشەی منداڵ', [
      'Amoxicillin Syrup 250mg - 5ml t.i.d (8 hours)',
      'Paracetamol Syrup 120mg - 5ml p.r.n for fever',
      'Vitamin D3 Drops - 4 drops daily'
    ]),
    medicines: [
      { name: 'Amoxicillin Syrup', dosage: '250mg/5ml', frequency: '3 جار لە ڕۆژێکدا (هەر 8 کاتژمێر جارێک)', instructions: 'دوای نان بۆ ماوەی 7 ڕۆژ', purpose: 'دژەبەکتریای هەوکردنی قورگ' },
      { name: 'Paracetamol Syrup', dosage: '120mg/5ml', frequency: 'کاتی پێویست (تا)', instructions: 'هەر 6 کاتژمێر جارێک ئەگەر تای هەبوو', purpose: 'دابەزاندنی تا و ئازار' }
    ]
  },
  {
    id: 'sample-3',
    doctorName: 'د. بڕوا حەمەشەریف',
    specialty: 'هەناو و کۆئەندامی هەرس',
    area: 'دهۆک - سەنتەری شار',
    patientName: 'ئازاد عوسمان',
    notes: 'Omeprazole 20mg (1x before breakfast) - Gaviscon Syrup (after meals) - Spasmo-Canulase',
    createdAt: '2026-07-15T09:00:00.000Z',
    isFavorite: true,
    image: generateSamplePrescriptionSvg('بڕوا حەمەشەریف', 'هەناو و کۆئەندامی هەرس', [
      'Omeprazole 20mg cap - 1x b.d.f (before breakfast)',
      'Gaviscon Antacid Liquid - 10ml t.i.d after meals',
      'Buscopan 10mg - 1x tab when required'
    ]),
    medicines: [
      { name: 'Omeprazole 20mg', dosage: '20mg', frequency: '1 كبسول بەیانیان', instructions: '30 خولەک پێش نانی بەیانی', purpose: 'کەمکردنەوەی ترشەلۆکی گەدە' },
      { name: 'Gaviscon Liquid', dosage: '10ml', frequency: '3 جار لە ڕۆژێکدا', instructions: 'ڕاستەوخۆ دوای ژەمەکان', purpose: 'چارەسەری دڵەکزێ و ڕەفڵەکس' }
    ]
  }
];
