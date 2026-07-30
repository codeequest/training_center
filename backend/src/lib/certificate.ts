import PDFDocument from 'pdfkit';
import type { Response } from 'express';

export interface CertificateData {
  serialNumber: string;
  studentName: string;
  courseTitle: string;
  durationHours: number;
  teacherName?: string | null;
  issuedAt: Date;
  endDate: Date;
}

const BRAND = '#0F766E';
const INK = '#111827';
const MUTED = '#6B7280';

/** Génère l'attestation de fin de formation et l'écrit directement dans la réponse HTTP. */
export function streamCertificate(res: Response, data: CertificateData): void {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="attestation-${data.serialNumber}.pdf"`
  );
  doc.pipe(res);

  const { width, height } = doc.page;

  // Cadre décoratif
  doc.rect(0, 0, width, 14).fill(BRAND);
  doc.rect(0, height - 14, width, 14).fill(BRAND);
  doc.lineWidth(1.5).strokeColor(BRAND).rect(38, 38, width - 76, height - 76).stroke();

  doc
    .fillColor(BRAND)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('CENTRE DE FORMATION', 0, 78, { align: 'center', characterSpacing: 3 });

  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(34)
    .text('Attestation de formation', 0, 118, { align: 'center' });

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(13)
    .text('Certificate of completion', 0, 160, { align: 'center' });

  doc
    .fillColor(MUTED)
    .fontSize(12)
    .text('Ce document atteste que', 0, 208, { align: 'center' });

  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(28)
    .text(data.studentName, 0, 232, { align: 'center' });

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(12)
    .text('a suivi avec succès la formation', 0, 276, { align: 'center' });

  doc
    .fillColor(BRAND)
    .font('Helvetica-Bold')
    .fontSize(21)
    .text(data.courseTitle, 0, 300, { align: 'center' });

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);

  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(12)
    .text(
      `Durée : ${data.durationHours} heures  •  Session achevée le ${fmt(data.endDate)}`,
      0,
      338,
      { align: 'center' }
    );

  // Pied de page : signature et référence de vérification
  const footerY = height - 132;
  doc.lineWidth(0.8).strokeColor('#D1D5DB');
  doc.moveTo(110, footerY).lineTo(310, footerY).stroke();
  doc.moveTo(width - 310, footerY).lineTo(width - 110, footerY).stroke();

  doc
    .fillColor(MUTED)
    .fontSize(10)
    .text(data.teacherName ?? 'Le formateur', 110, footerY + 8, { width: 200, align: 'center' })
    .text('Formateur', 110, footerY + 24, { width: 200, align: 'center' });

  doc
    .text('Le directeur', width - 310, footerY + 8, { width: 200, align: 'center' })
    .text('Centre de Formation', width - 310, footerY + 24, { width: 200, align: 'center' });

  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(
      `Référence de vérification : ${data.serialNumber}  •  Délivrée le ${fmt(data.issuedAt)}`,
      0,
      height - 62,
      { align: 'center' }
    );

  doc.end();
}
