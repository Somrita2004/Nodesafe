
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  fileName: string;
  onBack?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, fileName, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.integrity = 'sha512-q+4lp0ZtFwdE7Z0Ivy6QQtA7zS0Ut5UJUHjsX3VpZqLRVHr+uRgb3N6N/Uk/HxpyoUmXd/4BDvvid9sKUvxpRw==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.async = true;

    script.onload = () => {
      // Define workerSrc
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Load and render the PDF
      renderPdf(pdfUrl);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [pdfUrl]);

  const renderPdf = async (url: string) => {
    if (!containerRef.current) return;

    try {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      const loadingTask = pdfjsLib.getDocument(url);
      
      const pdf = await loadingTask.promise;
      const container = containerRef.current;
      container.innerHTML = ''; // Clear previous content
      
      // Render each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Create a div for this page
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page mb-4';
        container.appendChild(pageDiv);
        
        // Set viewport
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'mx-auto shadow-md';
        pageDiv.appendChild(canvas);
        
        // Render PDF page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
      }
    } catch (error) {
      console.error('Error rendering PDF:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="text-center p-8">
            <div class="text-red-500 text-xl mb-2">Failed to load PDF</div>
            <p>There was an error loading the PDF file. The file may be corrupted or invalid.</p>
          </div>
        `;
      }
    }
  };

  return (
    <div className="pdf-viewer-container">
      <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h2 className="text-lg font-medium">{fileName}</h2>
        <Button variant="outline" size="sm" asChild>
          <a href={pdfUrl} download={fileName}>
            <Download className="mr-2 h-4 w-4" /> Download
          </a>
        </Button>
      </div>
      <div className="p-4 overflow-auto">
        <div ref={containerRef} className="pdf-container mx-auto max-w-4xl">
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading PDF...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
