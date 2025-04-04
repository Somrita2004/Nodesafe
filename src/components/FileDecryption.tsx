
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Download, FileText, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { decryptFile, getMimeType } from "@/services/encryptionService";
import { getIpfsUrl } from "@/services/pinataService";
import { toast } from "sonner";
import PdfViewer from "./PdfViewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileDecryptionProps {
  ipfsHash: string;
  fileName?: string;
  salt?: string;
}

const FileDecryption: React.FC<FileDecryptionProps> = ({ 
  ipfsHash,
  fileName = "Downloaded File",
  salt = ""
}) => {
  const [password, setPassword] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [decryptedObjectUrl, setDecryptedObjectUrl] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<ArrayBuffer | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [decryptedFileName, setDecryptedFileName] = useState(fileName);
  const [decryptionSuccess, setDecryptionSuccess] = useState(false);
  
  // Create refs for direct file viewing
  const fileViewerRef = useRef<HTMLIFrameElement>(null);
  const directViewerRef = useRef<HTMLDivElement>(null);
  
  const handleDecrypt = async (viewMode: 'download' | 'browser' | 'direct' = 'download') => {
    if (!password) {
      setError("Please enter the decryption password");
      return;
    }

    setDecrypting(true);
    setError(null);
    setDownloadProgress(10);
    setDecryptedObjectUrl(null);
    setDecryptedData(null);
    setDecryptionSuccess(false);
    
    try {
      // Fetch the encrypted file from IPFS
      const fileUrl = getIpfsUrl(ipfsHash);
      console.log("Fetching encrypted file from:", fileUrl);
      
      toast.info("Downloading encrypted file...");
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      setDownloadProgress(50);
      
      // Get the encrypted content as text
      const encryptedContent = await response.text();
      console.log("Encrypted content length:", encryptedContent.length);
      
      setDownloadProgress(70);
      toast.info("Decrypting file...");
      
      try {
        // Decrypt the content - enhanced validation in decryptFile will throw if password is wrong
        const decryptedData = await decryptFile(encryptedContent, password, salt);
        console.log("Decryption successful, data size:", decryptedData.byteLength);
        
        setDownloadProgress(90);
        
        // Figure out proper filename
        let downloadFilename = fileName;
        if (downloadFilename.endsWith('.encrypted') || downloadFilename.endsWith('.enc')) {
          downloadFilename = downloadFilename.replace(/\.(encrypted|enc)$/, '');
        }
        
        setDecryptedFileName(downloadFilename);
        setDecryptedData(decryptedData);
        setDecryptionSuccess(true);
        
        // Create a Blob with the appropriate type
        const mimeType = getMimeType(downloadFilename);
        const blob = new Blob([decryptedData], { type: mimeType });
        
        // Create a URL for the blob
        const objectUrl = URL.createObjectURL(blob);
        console.log("Created object URL:", objectUrl);
        setDecryptedObjectUrl(objectUrl);
        
        if (viewMode === 'download') {
          // Trigger download
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("File decrypted and downloaded successfully!");
        }
        else if (viewMode === 'browser') {
          if (mimeType === 'application/pdf') {
            setShowPdfViewer(true);
            toast.success("PDF decrypted successfully");
          } else {
            // For non-PDF files, open in a new tab
            window.open(objectUrl, '_blank');
            toast.success("File opened in a new tab");
          }
        }
        else if (viewMode === 'direct') {
          // Direct viewing in iframe or embedded viewer
          if (directViewerRef.current) {
            // Create appropriate viewer based on file type
            if (mimeType.startsWith('image/')) {
              directViewerRef.current.innerHTML = '';
              const img = document.createElement('img');
              img.src = objectUrl;
              img.className = 'max-w-full h-auto';
              img.alt = downloadFilename;
              directViewerRef.current.appendChild(img);
            }
            else if (mimeType === 'application/pdf') {
              // For PDFs, use iframe
              directViewerRef.current.innerHTML = '';
              const iframe = document.createElement('iframe');
              iframe.src = objectUrl;
              iframe.className = 'w-full h-[500px] border-0';
              iframe.title = downloadFilename;
              directViewerRef.current.appendChild(iframe);
            }
            else if (mimeType.startsWith('text/') || 
                     mimeType === 'application/json' || 
                     mimeType === 'application/xml') {
              // For text files, show in pre tag
              const reader = new FileReader();
              reader.onload = (e) => {
                if (directViewerRef.current && e.target?.result) {
                  directViewerRef.current.innerHTML = '';
                  const pre = document.createElement('pre');
                  pre.className = 'bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-sm';
                  pre.textContent = e.target.result as string;
                  directViewerRef.current.appendChild(pre);
                }
              };
              reader.readAsText(blob);
            }
            else {
              // For other file types, provide download link
              directViewerRef.current.innerHTML = `
                <div class="text-center p-4">
                  <p class="mb-2">This file type (${mimeType}) cannot be previewed directly.</p>
                  <a href="${objectUrl}" download="${downloadFilename}" 
                     class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md">
                    Download File
                  </a>
                </div>
              `;
            }
          }
          toast.success("File decrypted successfully!");
        }
        
        setDownloadProgress(100);
      } catch (error) {
        console.error("Decryption failed:", error);
        setError("Incorrect password or corrupted file. Please try again.");
        toast.error("Failed to decrypt file. Please check your password.");
        setDownloadProgress(0);
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download file";
      setError(errorMessage);
      toast.error("Failed to download encrypted file.");
      setDownloadProgress(0);
    } finally {
      setDecrypting(false);
    }
  };
  
  // Clean up the object URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (decryptedObjectUrl) {
        URL.revokeObjectURL(decryptedObjectUrl);
      }
    };
  }, [decryptedObjectUrl]);
  
  if (showPdfViewer && (decryptedObjectUrl || decryptedData)) {
    return (
      <PdfViewer 
        pdfUrl={decryptedObjectUrl || ''}
        binaryData={decryptedData || undefined} 
        fileName={decryptedFileName}
        onBack={() => setShowPdfViewer(false)}
      />
    );
  }
  
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center mb-3">
        <Lock className="w-5 h-5 text-primary mr-2" />
        <h3 className="font-medium">Decrypt File</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="decryption-password" className="text-sm">
            Decryption Password
          </Label>
          <Input
            id="decryption-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the file password"
            className="mt-1"
            autoComplete="off"
          />
        </div>
        
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => handleDecrypt('download')}
            disabled={decrypting || !password}
            variant="default"
            className="w-full"
          >
            {decrypting ? (
              <>Decrypting...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download
              </>
            )}
          </Button>
          
          <Button
            onClick={() => handleDecrypt('browser')}
            disabled={decrypting || !password}
            variant="outline"
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" /> View in Browser
          </Button>
          
          <Button
            onClick={() => handleDecrypt('direct')}
            disabled={decrypting || !password}
            variant="secondary"
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" /> Direct View
          </Button>
        </div>
        
        {decryptionSuccess && (
          <Alert className="py-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>File successfully decrypted</AlertDescription>
          </Alert>
        )}
        
        {/* Direct file viewer */}
        {decryptedObjectUrl && !showPdfViewer && (
          <div className="pt-3">
            <div 
              ref={directViewerRef}
              className="mt-2 border rounded-md bg-background p-1 min-h-[100px]"
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDecryption;
