/**
 * Excel Export Utility
 * Uses xlsx library to export data to Excel
 */

import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row?: any) => string;
}

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param columns - Column definitions
 * @param filename - Output filename (without extension)
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string = 'export'
) {
  // Prepare data for export
  const exportData = data.map((row) => {
    const exportRow: any = {};
    columns.forEach((col) => {
      const value = row[col.key];
      exportRow[col.label] = col.format ? col.format(value, row) : value ?? '';
    });
    return exportRow;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Auto-size columns
  const maxWidth = columns.reduce((acc, col) => {
    const maxLength = Math.max(
      col.label.length,
      ...data.map((row) => {
        const val = row[col.key];
        const str = col.format ? col.format(val) : String(val ?? '');
        return str.length;
      })
    );
    return Math.max(acc, maxLength);
  }, 10);

  worksheet['!cols'] = columns.map(() => ({ wch: Math.min(maxWidth, 50) }));

  // Download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export table data with custom columns
 * @param data - Array of objects
 * @param visibleColumns - Array of column keys to include
 * @param allColumns - All available column definitions
 * @param filename - Output filename
 */
export function exportTableData(
  data: any[],
  visibleColumns: string[],
  allColumns: ExportColumn[],
  filename: string = 'export'
) {
  const columnsToExport = allColumns.filter((col) =>
    visibleColumns.includes(col.key)
  );
  exportToExcel(data, columnsToExport, filename);
}
