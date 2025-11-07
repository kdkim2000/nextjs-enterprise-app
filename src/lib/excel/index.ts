import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

/**
 * Generate Excel file from JSON data
 */
export async function generateExcelFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  filename: string,
  options?: {
    sheetName?: string;
    columns?: { header: string; key: string; width?: number }[];
    title?: string;
    author?: string;
  }
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = options?.author || 'Enterprise App';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(options?.sheetName || 'Sheet1');

  // Add title if provided
  if (options?.title) {
    worksheet.mergeCells('A1:' + String.fromCharCode(64 + (options?.columns?.length || 5)) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = options.title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;
  }

  // Set columns
  if (options?.columns) {
    worksheet.columns = options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15
    }));

    // Style header row
    const headerRow = worksheet.getRow(options.title ? 2 : 1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
  }

  // Add data
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Auto-filter
  if (options?.columns) {
    // const lastColumn = String.fromCharCode(64 + options.columns.length);
    const headerRowNumber = options.title ? 2 : 1;
    worksheet.autoFilter = {
      from: { row: headerRowNumber, column: 1 },
      to: { row: headerRowNumber, column: options.columns.length }
    };
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Download Excel file
 */
export function downloadExcelFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Parse Excel file to JSON
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export DataGrid data to Excel
 */
export async function exportDataGridToExcel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  columns: { field: string; headerName?: string; width?: number }[],
  filename: string,
  title?: string
): Promise<void> {
  const excelColumns = columns
    .filter((col) => col.field !== '__check__' && col.field !== 'actions')
    .map((col) => ({
      header: col.headerName || col.field,
      key: col.field,
      width: col.width ? col.width / 10 : 15
    }));

  const data = rows.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowData: any = {};
    excelColumns.forEach((col) => {
      rowData[col.key] = row[col.key];
    });
    return rowData;
  });

  const blob = await generateExcelFile(data, filename, {
    columns: excelColumns,
    title: title || filename,
    sheetName: 'Data'
  });

  downloadExcelFile(blob, filename);
}

/**
 * Generate Excel template
 */
export async function generateExcelTemplate(
  columns: { header: string; key: string; example?: string }[],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template');

  // Set columns
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: 20
  }));

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Add example row
  if (columns.some((col) => col.example)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exampleRow: any = {};
    columns.forEach((col) => {
      if (col.example) {
        exampleRow[col.key] = col.example;
      }
    });
    worksheet.addRow(exampleRow);

    // Style example row
    const row2 = worksheet.getRow(2);
    row2.font = { italic: true, color: { argb: 'FF666666' } };
  }

  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  downloadExcelFile(blob, filename);
}
