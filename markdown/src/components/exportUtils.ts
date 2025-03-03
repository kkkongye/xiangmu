// exportUtils.ts
export const exportHTML = (content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'exported_content.html';
    link.click();
  };
  
  import { jsPDF } from 'jspdf';
  
  export const exportPDF = (content: string) => {
    const doc = new jsPDF();
    doc.html(content, {
      callback: () => {
        doc.save('exported_content.pdf');
      },
      x: 10,
      y: 10,
    });
  };
  