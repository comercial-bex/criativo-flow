/**
 * Lazy loading wrapper for jsPDF and html2canvas
 * Reduces initial bundle size by ~500KB
 */

export const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
};

export const loadHtml2Canvas = async () => {
  const html2canvas = await import('html2canvas');
  return html2canvas.default || html2canvas;
};

export const loadAutoTable = async () => {
  await import('jspdf-autotable');
};

export const generatePDF = async (element: HTMLElement, filename: string) => {
  const [jsPDF, html2canvasModule] = await Promise.all([
    loadJsPDF(),
    loadHtml2Canvas()
  ]);
  
  const html2canvas = typeof html2canvasModule === 'function' ? html2canvasModule : (html2canvasModule as any).default;
  
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};
