
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface PdfViewerProps {
  pdfUrl: string;
  fileName: string;
  onBack?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, fileName, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);

  const renderPdf = async (url: string) => {
    if (!containerRef.current) return;
    
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    setPageCount(0);
    setRenderedPages(0);
    
    try {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      
      // Set proper caching options
      const loadingTask = pdfjsLib.getDocument({
        url: url,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        disableRange: false,
        disableStream: false,
        disableAutoFetch: false
      });
      
      // Track loading progress
      loadingTask.onProgress = (progress: { loaded: number, total: number }) => {
        const percentage = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0;
        setLoadingProgress(percentage);
      };
      
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);
      
      const container = containerRef.current;
      container.innerHTML = ''; // Clear previous content
      
      // Function to render pages sequentially
      const renderPage = async (pageNum: number) => {
        try {
          const page = await pdf.getPage(pageNum);
          
          // Create a div for this page
          const pageDiv = document.createElement('div');
          pageDiv.className = 'pdf-page mb-4';
          container.appendChild(pageDiv);
          
          // Set viewport with a scale that works well for most PDFs
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
          
          setRenderedPages(prev => prev + 1);
          
          // Render next page if there are more
          if (pageNum < pdf.numPages) {
            setTimeout(() => renderPage(pageNum + 1), 10); // Small delay to prevent UI freezing
          } else {
            setLoading(false);
          }
        } catch (pageError) {
          console.error(`Error rendering page ${pageNum}:`, pageError);
          toast.error(`Failed to render page ${pageNum}`);
          setRenderedPages(prev => prev + 1);
          
          // Continue with next page despite error
          if (pageNum < pdf.numPages) {
            setTimeout(() => renderPage(pageNum + 1), 10);
          } else {
            setLoading(false);
          }
        }
      };
      
      // Start rendering from page 1
      renderPage(1);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError('Failed to load PDF document. The file may be corrupted or in an unsupported format.');
      setLoading(false);
      toast.error('Failed to load PDF document');
    }
  };

  useEffect(() => {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.integrity = 'sha512-q+4lp0ZtFwdE7Z0Ivy6QQtA7zS0Ut5UJUHjsX3VpZqLRVHr+uRgb3N6N/Uk/HxpyoUmXd/4BDvvid9sKUvxpRw==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.async = true;

    let workerScript: HTMLScriptElement | null = null;

    script.onload = () => {
      // Define workerSrc
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Load worker script explicitly
      workerScript = document.createElement('script');
      workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      workerScript.integrity = 'sha512-fxAUpefhuHt7z7/kjMJ7nAQmtQzf2mKsf9JFpVLg/ZRNU8OVCQRxQvQZ4aDPy7Ce5ZJpKNn45IXaZ/NeQVRHw==';
      workerScript.crossOrigin = 'anonymous';
      workerScript.referrerPolicy = 'no-referrer';
      workerScript.async = true;
      
      workerScript.onload = () => {
        // Load and render the PDF
        renderPdf(pdfUrl);
      };
      
      document.body.appendChild(workerScript);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (workerScript) {
        document.body.removeChild(workerScript);
      }
    };
  }, [pdfUrl]);

  const handleRetry = () => {
    renderPdf(pdfUrl);
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

      {loading && (
        <div className="p-4 bg-background border-b">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">
              {loadingProgress === 100 ? 
                `Rendering pages (${renderedPages}/${pageCount})` : 
                `Loading PDF (${loadingProgress}%)`
              }
            </div>
          </div>
          <Progress value={pageCount === 0 ? loadingProgress : (renderedPages / pageCount) * 100} className="h-2" />
        </div>
      )}
      
      <div className="p-4 overflow-auto">
        <div ref={containerRef} className="pdf-container mx-auto max-w-4xl">
          {loading && pageCount === 0 && loadingProgress < 20 && (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full rounded-md" />
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
          )}
          
          {error && (
            <div className="text-center p-8 border rounded-lg bg-card">
              <div className="text-red-500 text-xl mb-4">{error}</div>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
