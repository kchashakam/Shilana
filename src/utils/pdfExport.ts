import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Prescription } from '../types';

/**
 * Creates an offscreen container, attaches it to DOM, renders HTML,
 * captures canvas with html2canvas, and returns jsPDF instance.
 */
async function generatePdfFromHtml(element: HTMLElement, filename: string) {
  // Append to document body for html2canvas to render
  element.style.position = 'fixed';
  element.style.left = '-9999px';
  element.style.top = '0';
  element.style.width = '794px'; // Standard A4 pixel width at 96 DPI
  element.style.zIndex = '-1000';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multi-page content if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  }
}

/**
 * Export a single prescription as a professional medical report PDF
 */
export async function exportSinglePrescriptionPDF(prescription: Prescription) {
  const container = document.createElement('div');
  container.dir = 'rtl';
  container.className = 'pdf-export-container';
  
  const formattedDate = new Date(prescription.createdAt).toLocaleDateString('ku-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const medsListHtml = prescription.medicines && prescription.medicines.length > 0
    ? prescription.medicines.map((m, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; text-align: right; font-weight: bold; color: #0284c7;">${idx + 1}. ${m.name}</td>
          <td style="padding: 8px; text-align: center;">${m.dosage || '-'}</td>
          <td style="padding: 8px; text-align: center;">${m.frequency || '-'}</td>
          <td style="padding: 8px; text-align: right;">${m.instructions || '-'}</td>
          <td style="padding: 8px; text-align: right; color: #475569;">${m.purpose || '-'}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="padding: 12px; text-align: center; color: #64748b;">${prescription.notes}</td></tr>`;

  container.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 32px; background: #ffffff; color: #1e293b; direction: rtl; text-align: right;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: #0369a1; font-weight: bold;">ڕاپۆرتی پزیشکی ڕاچێتە (Medical Prescription Report)</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">ئەرشیفی ژیری دەستکردی تەندروستی (AI Prescription Analyzer)</p>
        </div>
        <div style="text-align: left; font-size: 12px; color: #64748b;">
          <div>بەرواری دەرهێنان: ${new Date().toLocaleDateString('ku-IQ')}</div>
          <div style="margin-top: 2px; font-weight: bold; color: #0f766e;">کۆدی ڕاچێتە: #${prescription.id.slice(-6)}</div>
        </div>
      </div>

      <!-- Doctor & Patient Summary Box -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 11px; color: #64748b; font-weight: bold;">زانیاری پزیشک:</div>
          <div style="font-size: 16px; font-weight: bold; color: #0369a1; margin-top: 4px;">${prescription.doctorName}</div>
          <div style="font-size: 13px; color: #0284c7; margin-top: 2px;">پسپۆڕی: ${prescription.specialty}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">ناوچە/نۆڕینگە: ${prescription.area || 'سلێمانی'}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #64748b; font-weight: bold;">زانیاری نەخۆش و سەردان:</div>
          <div style="font-size: 15px; font-weight: bold; color: #334155; margin-top: 4px;">ناوی نەخۆش: ${prescription.patientName || 'نادیار'}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">بەرواری ڕاچێتە: ${formattedDate}</div>
        </div>
      </div>

      <!-- Prescribed Medicines Section -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; color: #0f766e; border-right: 4px solid #0d9488; padding-right: 8px; margin-bottom: 12px;">
          💊 لیستی دەرمانە نوسراوەکان (Prescribed Medications)
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px; text-align: right;">ناوی دەرمان</th>
              <th style="padding: 10px; text-align: center;">بڕی ژەم (Dosage)</th>
              <th style="padding: 10px; text-align: center;">چەند جار لە ڕۆژێکدا</th>
              <th style="padding: 10px; text-align: right;">کات و ڕێنمایی</th>
              <th style="padding: 10px; text-align: right;">مەبەستی بەکارهێنان</th>
            </tr>
          </thead>
          <tbody>
            ${medsListHtml}
          </tbody>
        </table>
      </div>

      <!-- Notes & AI Analysis -->
      <div style="margin-bottom: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #15803d; font-weight: bold;">
          📝 نۆتی ڕاچێتە و شیکاریی پزیشکی:
        </h3>
        <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.6; whitespace-line: pre-line;">
          ${prescription.notes}
        </p>
        ${prescription.aiAnalysis?.aiSummary ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #86efac; font-size: 12px; color: #14532d;">
            <strong>پوختەی شیکردنەوەی AI:</strong> ${prescription.aiAnalysis.aiSummary}
          </div>
        ` : ''}
      </div>

      <!-- Attached Prescription Image -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; color: #0369a1; border-right: 4px solid #0284c7; padding-right: 8px; margin-bottom: 12px;">
          🖼️ وێنەی ڕاستەقینەی دەستوخەتی ڕاچێتە (Scanned Image)
        </h2>
        <div style="text-align: center; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; background: #fafafa;">
          <img src="${prescription.image}" style="max-width: 100%; max-height: 450px; object-contain: contain; border-radius: 8px;" alt="وێنەی ڕاچێتە" />
        </div>
      </div>

      <!-- Footer Disclaimer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center;">
        ئەم ڕاپۆرتە بەشێوەیەکی خۆکار بەرهەمهێنراوە لە ئەرشیفی تەندروستی خێزانی. بۆ پێشکەشکردن بە پزیشک یان دەرمانساز.
      </div>

    </div>
  `;

  const safeDoctorName = prescription.doctorName.replace(/[^\w\u0600-\u06FF]/g, '_');
  await generatePdfFromHtml(container, `Prescription_${safeDoctorName}_${Date.now()}.pdf`);
}

/**
 * Export the full prescription archive history as a multi-item summary PDF
 */
export async function exportArchiveHistoryPDF(prescriptions: Prescription[], userEmail?: string) {
  const container = document.createElement('div');
  container.dir = 'rtl';
  container.className = 'pdf-export-container';

  const rowsHtml = prescriptions.map((p, idx) => {
    const dateStr = new Date(p.createdAt).toLocaleDateString('ku-IQ');
    const medsCount = p.medicines?.length || (p.notes ? 1 : 0);

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background: #f8fafc;' : ''}">
        <td style="padding: 10px; font-weight: bold; color: #0284c7;">${idx + 1}. ${p.doctorName}</td>
        <td style="padding: 10px; color: #0d9488;">${p.specialty}</td>
        <td style="padding: 10px; color: #475569;">${p.area || '-'}</td>
        <td style="padding: 10px; font-size: 11px; color: #334155; max-width: 200px; white-space: normal;">${p.notes}</td>
        <td style="padding: 10px; text-align: center; font-size: 11px;">${dateStr}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 32px; background: #ffffff; color: #1e293b; direction: rtl; text-align: right;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; font-size: 22px; color: #0f766e; font-weight: bold;">ڕاپۆرتی گشتی ئەرشیفی ڕاچێتە پزیشکییەکان (Medical History Archive)</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">مێژووی تەندروستی و دەرمانەکانی نەخۆش بۆ پێشکەشکردن بە پزیشکی پسپۆڕ</p>
        </div>
        <div style="text-align: left; font-size: 12px; color: #64748b;">
          <div>کۆی ڕاچێتەکان: <strong>${prescriptions.length} ڕاچێتە</strong></div>
          <div>بەروار: ${new Date().toLocaleDateString('ku-IQ')}</div>
          ${userEmail ? `<div style="margin-top: 2px; color: #0284c7;">ئەژمێر: ${userEmail}</div>` : ''}
        </div>
      </div>

      <!-- Table of Prescriptions -->
      <div style="margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #0f766e; color: #ffffff;">
              <th style="padding: 10px; text-align: right;">ناوی پزیشک</th>
              <th style="padding: 10px; text-align: right;">پسپۆڕی</th>
              <th style="padding: 10px; text-align: right;">شار/شوێن</th>
              <th style="padding: 10px; text-align: right;">کورتەی دەرمان و نۆتەکان</th>
              <th style="padding: 10px; text-align: center;">بەروار</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Detailed Breakdown Cards -->
      <div style="margin-top: 32px;">
        <h2 style="font-size: 16px; color: #0369a1; border-right: 4px solid #0284c7; padding-right: 8px; margin-bottom: 16px;">
          📋 وردەکاری سەرجەم ڕاچێتەکان
        </h2>

        ${prescriptions.map((item, index) => `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px; background: #f8fafc; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #0369a1; font-size: 14px;">#${index + 1} - ${item.doctorName} (${item.specialty})</span>
              <span style="font-size: 11px; color: #64748b;">${new Date(item.createdAt).toLocaleDateString('ku-IQ')}</span>
            </div>
            <div style="font-size: 12px; color: #334155; margin-bottom: 8px;">
              <strong>شوێن:</strong> ${item.area || 'سلێمانی'} | <strong>ناوی نەخۆش:</strong> ${item.patientName || 'نادیار'}
            </div>
            <div style="font-size: 12px; color: #1e293b; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <strong>دەرمانەکان:</strong> ${item.notes}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px;">
        ئەم ڕاپۆرتە خزمەتگوزارییەکی دیجیتاڵییە بۆ ڕێکخستن و پاراستنی مێژووی پزیشکی تەندروستی خێزان.
      </div>

    </div>
  `;

  await generatePdfFromHtml(container, `Medical_History_Archive_${Date.now()}.pdf`);
}
