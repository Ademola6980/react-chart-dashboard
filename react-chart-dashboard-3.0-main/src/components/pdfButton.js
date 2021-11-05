import React from "react"
import JsPdf from "jspdf";
import html2canvas from "html2canvas";
const PDFButton = ({id = 'root'}) => {
    const printDocument = () => {
        const input = document.getElementById(id);
        html2canvas(input)
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new JsPdf({
              orientation : 'landscape'
            });
            const imgProps= pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth() ;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Dashboard-export-${Date.now()}.pdf`);
          })
        ;
      }
    return  (
        <button onClick={printDocument}>
            Generate PDF
        </button>
    )
}
export default PDFButton;