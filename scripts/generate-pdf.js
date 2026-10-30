const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const mdPath = path.join(__dirname, '..', 'docs', 'security-architecture.md');
  const outPathRoot = path.join(__dirname, '..', 'Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf');
  const outPathDocs = path.join(__dirname, '..', 'docs', 'Memoria_Seguridad_Ionic_Garcia_Carrasco.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('No se encuentra docs/security-architecture.md');
    process.exit(1);
  }

  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(requiredHeight) {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  }

  function drawHeaderFooter() {
    doc.saveGraphicsState();
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 155);
    doc.text('Enterprise Analytics Platform | Memoria de Arquitectura de Seguridad (Lab_Guards)', margin, 28);
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 34, pageWidth - margin, 34);

    const pageNum = doc.internal.getNumberOfPages();
    doc.text(`Página ${pageNum}`, pageWidth - margin - 40, pageHeight - 24);
    doc.text('Mateo García Carrasco — DAM 2 — Des. de Interfaces 0488', margin, pageHeight - 24);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    doc.restoreGraphicsState();
  }

  drawHeaderFooter();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trimEnd();
    const line = rawLine.trim();

    if (!line) {
      y += 8;
      continue;
    }

    if (line.startsWith('# ')) {
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(20, 35, 70);
      const text = line.replace(/^#\s+/, '');
      const wrapped = doc.splitTextToSize(text, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 20 + 8;
    } else if (line.startsWith('## ')) {
      checkPageBreak(38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 58, 138);
      const text = line.replace(/^##\s+/, '');
      const wrapped = doc.splitTextToSize(text, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 16 + 6;
    } else if (line.startsWith('### ')) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(45, 60, 90);
      const text = line.replace(/^###\s+/, '');
      const wrapped = doc.splitTextToSize(text, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 14 + 4;
    } else if (line.startsWith('```')) {
      // Code block start/end
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 80);
      y += 4;
    } else if (line.startsWith('|')) {
      // Markdown table row
      checkPageBreak(16);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(40, 50, 70);
      const cleanLine = line.replace(/\s+/g, ' ');
      doc.text(cleanLine, margin, y);
      y += 12;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 45, 55);
      const text = '• ' + line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '');
      const wrapped = doc.splitTextToSize(text, maxWidth - 12);
      doc.text(wrapped, margin + 10, y);
      y += wrapped.length * 13 + 3;
    } else {
      checkPageBreak(16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 45, 55);
      const cleanText = line.replace(/\*\*/g, '').replace(/`/g, '');
      const wrapped = doc.splitTextToSize(cleanText, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 13 + 3;
    }
  }

  const pdfData = doc.output();
  fs.writeFileSync(outPathRoot, Buffer.from(pdfData, 'binary'));
  fs.writeFileSync(outPathDocs, Buffer.from(pdfData, 'binary'));
  console.log('PDF generado exitosamente en:');
  console.log(' - ' + outPathRoot);
  console.log(' - ' + outPathDocs);
}

generatePdf();
