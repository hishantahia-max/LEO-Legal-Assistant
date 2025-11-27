
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for "Failed to fetch dynamically imported module" error.
// PDF.js v5+ is strict about ESM. We must use the .mjs worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

export class LocalOcrService {
  /**
   * Extracts text from an image, PDF, or text file.
   * @param file The file to process
   * @param maxPages Number of pages to process for PDFs (default 3, max 5)
   */
  async extractText(file: File, maxPages: number = 3): Promise<string> {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      return this.processPdf(file, maxPages);
    } else if (fileType.startsWith('image/')) {
      return this.processImage(file);
    } else if (fileType === 'text/plain') {
      return this.processText(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Please upload PDF, Image (JPG/PNG), or Text files.`);
    }
  }

  private async processText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private async processImage(file: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        // logger: (m) => console.log(m), // Optional: logging
      });
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image.');
    }
  }

  private async processPdf(file: File, maxPages: number): Promise<string> {
    let pdf: any = null;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      
      pdf = await loadingTask.promise;
      
      let fullText = '';
      const effectiveMaxPages = Math.min(Math.max(1, maxPages), 5);
      const numPages = Math.min(pdf.numPages, effectiveMaxPages);

      for (let i = 1; i <= numPages; i++) {
        let page = null;
        try {
          page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) throw new Error('Canvas context not available');

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png');
          });
          
          if (blob) {
             const result = await Tesseract.recognize(blob, 'eng');
             fullText += result.data.text + '\n';
          }
        } catch (pageError) {
          console.warn(`Error processing page ${i}:`, pageError);
        } finally {
          // Explicit cleanup for the page to prevent memory leaks
          if (page && page.cleanup) page.cleanup();
        }
      }

      return fullText;
    } catch (error: any) {
      console.error('PDF Processing Error:', error);
      throw new Error(error.message || 'Failed to process PDF.');
    } finally {
      // Ensure the PDF document is destroyed to free resources and prevent memory leaks
      if (pdf) {
        try { await pdf.destroy(); } catch (e) { console.error("Error destroying PDF document:", e); }
      }
    }
  }
}

export const ocrService = new LocalOcrService();
