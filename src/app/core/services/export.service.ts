import { Injectable } from '@angular/core';
import { Record } from '../models/record.model';

/**
 * @class ExportService
 * @description Servicio de exportación robusta de datos empresariales en formatos
 * PDF (jsPDF + autoTable) y CSV con soporte UTF-8 BOM para Excel.
 *
 * @remarks
 * - PDF: Utiliza jsPDF con plugin autoTable para generar informes tabulados
 *   con diseño corporativo, encabezados y paginación.
 * - CSV: Incluye BOM UTF-8 (\\uFEFF) para compatibilidad con Microsoft Excel
 *   y manejo correcto de caracteres especiales españoles (tildes, ñ, etc.).
 * - Ambos formatos descargan el archivo automáticamente al navegador.
 *
 * @example
 * ```typescript
 * this.exportService.exportToCsv(records, 'registros_2026');
 * this.exportService.exportToPdf(records, 'Informe Analítico Q3');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta registros a un archivo CSV con soporte UTF-8 BOM para Excel.
   *
   * @param {Record[]} records - Registros a exportar.
   * @param {string} [filename='registros_export'] - Nombre del archivo sin extensión.
   */
  exportToCsv(records: Record[], filename: string = 'registros_export'): void {
    if (!records || records.length === 0) {
      console.warn('[ExportService] No hay registros para exportar a CSV');
      return;
    }

    /** Definir las cabeceras en español */
    const headers = [
      'ID', 'Título', 'Descripción', 'Categoría', 'Estado',
      'Importe (€)', 'SKU', 'Cliente', 'Email Cliente', 'Región',
      'Etiquetas', 'Fuente', 'Fecha Creación', 'Última Actualización'
    ];

    /** Mapear datos a filas CSV */
    const rows = records.map(r => [
      r.id,
      this.escapeCsvField(r.title),
      this.escapeCsvField(r.description),
      r.category,
      r.status,
      r.amount.toString(),
      r.sku,
      this.escapeCsvField(r.clientName),
      r.clientEmail,
      r.region,
      r.tags.join('; '),
      r.source,
      this.formatDate(r.createdAt),
      this.formatDate(r.updatedAt)
    ]);

    /** Construir CSV con BOM UTF-8 para Excel */
    const BOM = '\uFEFF';
    const csvContent = BOM +
      headers.join(';') + '\n' +
      rows.map(row => row.join(';')).join('\n');

    /** Descargar */
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
  }

  /**
   * Exporta registros a un informe PDF con diseño corporativo usando jsPDF + autoTable.
   *
   * @param {Record[]} records - Registros a exportar.
   * @param {string} [title='Informe de Registros Empresariales'] - Título del informe.
   * @param {string} [filename='informe_registros'] - Nombre del archivo sin extensión.
   */
  async exportToPdf(
    records: Record[],
    title: string = 'Informe de Registros Empresariales',
    filename: string = 'informe_registros'
  ): Promise<void> {
    if (!records || records.length === 0) {
      console.warn('[ExportService] No hay registros para exportar a PDF');
      return;
    }

    /** Importación dinámica para reducir el bundle size inicial */
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    /** Diseño corporativo — cabecera */
    doc.setFillColor(15, 23, 42); // #0f172a — Dark Navy
    doc.rect(0, 0, 297, 35, 'F');

    doc.setTextColor(248, 250, 252); // #f8fafc
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Enterprise Analytics — Generado: ${this.formatDate(new Date().toISOString())}`, 14, 25);

    /** Resumen estadístico */
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    doc.text(`Total registros: ${records.length} | Importe total: ${totalAmount.toLocaleString('es-ES')} EUR`, 14, 31);

    /** Tabla de datos con autoTable */
    const tableHeaders = [
      'Título', 'Categoría', 'Estado', 'Importe (€)',
      'SKU', 'Cliente', 'Región', 'Actualización'
    ];

    const tableData = records.map(r => [
      r.title.substring(0, 35) + (r.title.length > 35 ? '...' : ''),
      r.category,
      r.status,
      r.amount.toLocaleString('es-ES'),
      r.sku,
      r.clientName.substring(0, 20) + (r.clientName.length > 20 ? '...' : ''),
      r.region,
      this.formatDate(r.updatedAt)
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241], // #6366f1 — Indigo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59], // #1e293b
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249] // #f1f5f9
      },
      columnStyles: {
        3: { halign: 'right' }
      },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: (data: any) => {
        /** Pie de página con número de página */
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          297 / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );
      }
    });

    /** Descargar el PDF */
    doc.save(`${filename}.pdf`);
  }

  /**
   * Escapa un campo para formato CSV (comillas dobles si contiene separadores).
   *
   * @private
   * @param {string} field - Campo a escapar.
   * @returns {string} Campo escapado.
   */
  private escapeCsvField(field: string): string {
    if (!field) return '';
    if (field.includes(';') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Formatea una fecha ISO 8601 a formato legible español.
   *
   * @private
   * @param {string} isoDate - Fecha en formato ISO.
   * @returns {string} Fecha formateada (dd/MM/yyyy HH:mm).
   */
  private formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Descarga un archivo en el navegador creando un Blob y un enlace temporal.
   *
   * @private
   * @param {string} content - Contenido del archivo.
   * @param {string} filename - Nombre del archivo.
   * @param {string} mimeType - Tipo MIME del archivo.
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
