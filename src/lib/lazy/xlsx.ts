/**
 * Lazy loading wrapper for XLSX library
 * Reduces initial bundle size by ~400KB
 */

export const loadXLSX = async () => {
  const XLSX = await import('xlsx');
  return XLSX.default || XLSX;
};

export const exportToExcel = async (data: any[], filename: string) => {
  const XLSX = await loadXLSX();
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
