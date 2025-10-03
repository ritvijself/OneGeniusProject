import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a PDF from a referenced DOM element with optimized file size
 * @param {HTMLElement} element - The DOM node to convert to PDF.
 * @param {string} fileName - The name of the output PDF file.
 * @param {Object} options - Configuration options for PDF generation.
 * @returns {Promise<void>}
 */
export const generatePdfFromElement = async (
  element,
  fileName = "report.pdf",
  options = {}
) => {
  if (!element) return;

  const {
    scale = 1.5, // Reduced from 2 to 1.5 (good balance between quality and size)
    quality = 0.92, // JPEG quality (0.92 is nearly indistinguishable from 1.0)
    pdfFormat = "a4",
    orientation = "p",
    compression = true,
    logging = false
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.body.scrollWidth,
      windowHeight: document.body.scrollHeight,
      logging,
      // Use JPEG instead of PNG for better compression
      imageTimeout: 0,
      ignoreElements: (el) => {
        // Optionally ignore certain elements that don't need to be in PDF
        return el.classList.contains('no-print');
      }
    });

    // Use JPEG instead of PNG for better compression
    const imgData = canvas.toDataURL("image/jpeg", quality);

    const pdf = new jsPDF(orientation, "mm", pdfFormat);
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    if (compression) {
      // Enable PDF compression (available in newer versions of jsPDF)
      if (pdf.setCompression) {
        pdf.setCompression(true);
      }
    }

    pdf.save(fileName);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("PDF generation failed.");
  }
};