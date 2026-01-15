/**
 * Excel Export Utility for Inspection Data
 * Uses SheetJS (xlsx) library for Excel file generation
 */

import * as XLSX from 'xlsx';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: (value: unknown) => string | number;
}

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  title?: string;
  subtitle?: string;
  includeTimestamp?: boolean;
}

export interface MultiSheetExportOptions {
  filename: string;
  sheets: Array<{
    name: string;
    columns: ExcelColumn[];
    data: Record<string, unknown>[];
    title?: string;
  }>;
  includeTimestamp?: boolean;
}

/**
 * Format a value based on column type
 */
const formatValue = (value: unknown, column: ExcelColumn): string | number | boolean | Date | null => {
  if (value === null || value === undefined) {
    return '';
  }

  if (column.format) {
    return column.format(value);
  }

  switch (column.type) {
    case 'number':
      return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    case 'date':
      return value instanceof Date ? value : new Date(String(value));
    case 'boolean':
      return Boolean(value);
    default:
      return String(value);
  }
};

/**
 * Export data to Excel file (single sheet)
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const { filename, sheetName = 'Sheet1', columns, data, title, subtitle, includeTimestamp = true } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Prepare header row
  const headers = columns.map((col) => col.header);

  // Prepare data rows
  const rows = data.map((item) =>
    columns.map((col) => formatValue(item[col.key], col))
  );

  // Create sheet data
  const sheetData: (string | number | boolean | Date | null)[][] = [];

  // Add title if provided
  if (title) {
    sheetData.push([title]);
    sheetData.push([]);
  }

  // Add subtitle if provided
  if (subtitle) {
    sheetData.push([subtitle]);
    sheetData.push([]);
  }

  // Add timestamp if requested
  if (includeTimestamp) {
    sheetData.push([`Generated: ${new Date().toLocaleString()}`]);
    sheetData.push([]);
  }

  // Add headers and data
  sheetData.push(headers);
  sheetData.push(...rows);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  const colWidths = columns.map((col) => ({ wch: col.width || 15 }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}

/**
 * Export data to Excel file (multiple sheets)
 */
export function exportToExcelMultiSheet(options: MultiSheetExportOptions): void {
  const { filename, sheets, includeTimestamp = true } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const { name, columns, data, title } = sheet;

    // Prepare header row
    const headers = columns.map((col) => col.header);

    // Prepare data rows
    const rows = data.map((item) =>
      columns.map((col) => formatValue(item[col.key], col))
    );

    // Create sheet data
    const sheetData: (string | number | boolean | Date | null)[][] = [];

    // Add title if provided
    if (title) {
      sheetData.push([title]);
      sheetData.push([]);
    }

    // Add timestamp if requested
    if (includeTimestamp) {
      sheetData.push([`Generated: ${new Date().toLocaleString()}`]);
      sheetData.push([]);
    }

    // Add headers and data
    sheetData.push(headers);
    sheetData.push(...rows);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    const colWidths = columns.map((col) => ({ wch: col.width || 15 }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}

/**
 * Export inspection results to Excel
 */
export function exportInspectionResults(
  inspection: {
    inspection_code: string;
    title: string;
    status: string;
    scheduled_date?: string;
    location?: string;
    inspector_name?: string;
  },
  items: Array<{
    item_code: string;
    item_name: string;
    item_type: string;
    required: boolean;
  }>,
  results: Record<string, { value: string; notes?: string }>,
  locale: string = 'ko'
): void {
  const columns: ExcelColumn[] = [
    { header: locale === 'ko' ? '항목 코드' : 'Item Code', key: 'item_code', width: 12 },
    { header: locale === 'ko' ? '항목명' : 'Item Name', key: 'item_name', width: 30 },
    { header: locale === 'ko' ? '유형' : 'Type', key: 'item_type', width: 10 },
    { header: locale === 'ko' ? '필수' : 'Required', key: 'required', width: 8 },
    { header: locale === 'ko' ? '결과' : 'Result', key: 'value', width: 20 },
    { header: locale === 'ko' ? '비고' : 'Notes', key: 'notes', width: 30 },
  ];

  const data = items.map((item) => ({
    item_code: item.item_code,
    item_name: item.item_name,
    item_type: item.item_type,
    required: item.required ? (locale === 'ko' ? '예' : 'Yes') : (locale === 'ko' ? '아니오' : 'No'),
    value: results[item.item_code]?.value || '',
    notes: results[item.item_code]?.notes || '',
  }));

  const title = `${locale === 'ko' ? '검사 결과' : 'Inspection Results'}: ${inspection.title}`;
  const subtitle = [
    `${locale === 'ko' ? '검사 코드' : 'Code'}: ${inspection.inspection_code}`,
    `${locale === 'ko' ? '상태' : 'Status'}: ${inspection.status}`,
    inspection.scheduled_date ? `${locale === 'ko' ? '예정일' : 'Date'}: ${inspection.scheduled_date}` : '',
    inspection.location ? `${locale === 'ko' ? '위치' : 'Location'}: ${inspection.location}` : '',
    inspection.inspector_name ? `${locale === 'ko' ? '검사자' : 'Inspector'}: ${inspection.inspector_name}` : '',
  ].filter(Boolean).join(' | ');

  exportToExcel({
    filename: `inspection_${inspection.inspection_code}`,
    sheetName: locale === 'ko' ? '검사결과' : 'Results',
    columns,
    data,
    title,
    subtitle,
  });
}

/**
 * Export inspection list to Excel
 */
export function exportInspectionList(
  inspections: Array<{
    inspection_code: string;
    title: string;
    template_name?: string;
    status: string;
    scheduled_date?: string;
    completed_date?: string;
    location?: string;
    inspector_name?: string;
  }>,
  locale: string = 'ko'
): void {
  const columns: ExcelColumn[] = [
    { header: locale === 'ko' ? '검사 코드' : 'Code', key: 'inspection_code', width: 15 },
    { header: locale === 'ko' ? '제목' : 'Title', key: 'title', width: 30 },
    { header: locale === 'ko' ? '템플릿' : 'Template', key: 'template_name', width: 20 },
    { header: locale === 'ko' ? '상태' : 'Status', key: 'status', width: 12 },
    { header: locale === 'ko' ? '예정일' : 'Scheduled', key: 'scheduled_date', width: 12 },
    { header: locale === 'ko' ? '완료일' : 'Completed', key: 'completed_date', width: 12 },
    { header: locale === 'ko' ? '위치' : 'Location', key: 'location', width: 15 },
    { header: locale === 'ko' ? '검사자' : 'Inspector', key: 'inspector_name', width: 15 },
  ];

  exportToExcel({
    filename: 'inspection_list',
    sheetName: locale === 'ko' ? '검사목록' : 'Inspections',
    columns,
    data: inspections,
    title: locale === 'ko' ? '검사 목록' : 'Inspection List',
  });
}

/**
 * Export template items to Excel
 */
export function exportTemplateItems(
  template: {
    template_code: string;
    template_name: string;
    category?: string;
  },
  items: Array<{
    item_code: string;
    item_name: string;
    item_type: string;
    description?: string;
    options?: string;
    required: boolean;
    sort_order: number;
  }>,
  locale: string = 'ko'
): void {
  const columns: ExcelColumn[] = [
    { header: locale === 'ko' ? '순서' : 'Order', key: 'sort_order', width: 8 },
    { header: locale === 'ko' ? '항목 코드' : 'Item Code', key: 'item_code', width: 12 },
    { header: locale === 'ko' ? '항목명' : 'Item Name', key: 'item_name', width: 30 },
    { header: locale === 'ko' ? '유형' : 'Type', key: 'item_type', width: 10 },
    { header: locale === 'ko' ? '설명' : 'Description', key: 'description', width: 40 },
    { header: locale === 'ko' ? '옵션' : 'Options', key: 'options', width: 25 },
    { header: locale === 'ko' ? '필수' : 'Required', key: 'required_text', width: 8 },
  ];

  const data = items.map((item) => ({
    ...item,
    required_text: item.required ? (locale === 'ko' ? '예' : 'Yes') : (locale === 'ko' ? '아니오' : 'No'),
  }));

  exportToExcel({
    filename: `template_${template.template_code}`,
    sheetName: locale === 'ko' ? '체크시트항목' : 'Items',
    columns,
    data,
    title: `${locale === 'ko' ? '템플릿' : 'Template'}: ${template.template_name}`,
    subtitle: template.category ? `${locale === 'ko' ? '카테고리' : 'Category'}: ${template.category}` : undefined,
  });
}

export default {
  exportToExcel,
  exportToExcelMultiSheet,
  exportInspectionResults,
  exportInspectionList,
  exportTemplateItems,
};
