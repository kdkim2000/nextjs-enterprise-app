import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF from table data
 */
export function generatePDFFromTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter';
    author?: string;
    subject?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: options?.pageSize || 'a4'
  });

  // Set document properties
  if (options?.author) doc.setProperties({ author: options.author });
  if (options?.subject) doc.setProperties({ subject: options.subject });

  // Add title
  if (options?.title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, 20);
  }

  // Prepare table data
  const tableData = data.map((row) => {
    return columns.map((col) => row[col.dataKey] || '');
  });

  // Generate table
  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: tableData,
    startY: options?.title ? 30 : 20,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 30, right: 14, bottom: 20, left: 14 }
  });

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      pageHeight - 10
    );
  }

  // Save PDF
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Generate PDF report with sections
 */
export function generatePDFReport(
  sections: {
    title: string;
    content?: string;
    table?: {
      columns: { header: string; dataKey: string }[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[];
    };
  }[],
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    author?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  if (options?.author) doc.setProperties({ author: options.author });

  let yPosition = 20;

  // Main title
  if (options?.title) {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, yPosition);
    yPosition += 15;
  }

  // Add sections
  sections.forEach((section) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 14, yPosition);
    yPosition += 8;

    // Section content
    if (section.content) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, 180);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 6 + 5;
    }

    // Section table
    if (section.table) {
      const tableData = section.table.data.map((row) => {
        return section.table!.columns.map((col) => row[col.dataKey] || '');
      });

      autoTable(doc, {
        head: [section.table.columns.map((col) => col.header)],
        body: tableData,
        startY: yPosition,
        theme: 'striped',
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2
        },
        margin: { left: 14, right: 14 }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    yPosition += 5;
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Export DataGrid data to PDF
 */
export function exportDataGridToPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  columns: { field: string; headerName?: string }[],
  filename: string,
  title?: string
): void {
  const pdfColumns = columns
    .filter((col) => col.field !== '__check__' && col.field !== 'actions')
    .map((col) => ({
      header: col.headerName || col.field,
      dataKey: col.field
    }));

  generatePDFFromTable(rows, pdfColumns, filename, {
    title: title || filename,
    orientation: pdfColumns.length > 5 ? 'landscape' : 'portrait',
    author: 'Enterprise App'
  });
}

/**
 * Generate PDF from HTML content
 */
export function generatePDFFromHTML(
  htmlContent: string,
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }
): void {
  const doc = new jsPDF({
    orientation: options?.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let yPosition = 20;

  if (options?.title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, yPosition);
    yPosition += 15;
  }

  // Convert HTML to plain text (simplified)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(textContent, 180);

  lines.forEach((line: string) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, 14, yPosition);
    yPosition += 6;
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
