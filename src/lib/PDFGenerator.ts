import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await (html2canvas as any)(element, {
      scale: 2, // Higher quality
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
    });

    const imgData = canvas.toDataURL('image/png', 0.8);
    // Create PDF with exactly the canvas dimensions in pixels
    const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
