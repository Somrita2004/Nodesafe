
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Download, FileText, Eye } from "lucide-react";
import { decryptFile } from "@/services/encryptionService";
import { getIpfsUrl } from "@/services/pinataService";
import { toast } from "sonner";
import PdfViewer from "./PdfViewer";

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
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [decryptedFileName, setDecryptedFileName] = useState(fileName);
  
  const handleDecrypt = async (shouldOpenInBrowser = false) => {
    if (!password) {
      setError("Please enter the decryption password");
      return;
    }

    setDecrypting(true);
    setError(null);
    setDownloadProgress(10);
    
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
        // Decrypt the content
        const decryptedData = await decryptFile(encryptedContent, password, salt);
        console.log("Decryption successful, data size:", decryptedData.byteLength);
        
        setDownloadProgress(90);
        
        // Figure out proper filename
        let downloadFilename = fileName;
        if (downloadFilename.endsWith('.encrypted') || downloadFilename.endsWith('.enc')) {
          downloadFilename = downloadFilename.replace(/\.(encrypted|enc)$/, '');
        }
        
        setDecryptedFileName(downloadFilename);
        
        // Create a Blob with the appropriate type
        const mimeType = getMimeType(downloadFilename);
        const blob = new Blob([decryptedData], { type: mimeType || 'application/octet-stream' });
        
        // Create a URL for the blob
        const objectUrl = URL.createObjectURL(blob);
        console.log("Created object URL:", objectUrl);
        
        // Save the URL for in-browser viewing
        setDecryptedObjectUrl(objectUrl);
        
        if (shouldOpenInBrowser) {
          if (mimeType === 'application/pdf') {
            // For PDFs, use our custom PDF viewer
            setShowPdfViewer(true);
            toast.success("PDF decrypted successfully");
          } else {
            // For other file types, just open in a new tab
            window.open(objectUrl, '_blank');
            toast.success("File opened in a new tab");
          }
        } else {
          // Create a download link and trigger the download
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = downloadFilename;
          document.body.appendChild(a);
          
          // Use a small delay to ensure the browser has time to process the blob
          setTimeout(() => {
            a.click();
            
            // Clean up the download element
            setTimeout(() => {
              document.body.removeChild(a);
            }, 100);
          }, 100);
          
          toast.success("File decrypted and downloaded successfully!");
        }
        
        setDownloadProgress(100);
      } catch (error) {
        console.error("Decryption failed:", error);
        setError("Incorrect password or corrupted file. Please try again.");
        toast.error("Failed to decrypt file. Please check your password.");
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to download file";
      setError(errorMessage);
      toast.error("Failed to download encrypted file.");
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
  
  // Helper function to determine MIME type based on file extension
  const getMimeType = (filename: string): string | null => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'html': 'text/html',
      'htm': 'text/html',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'json': 'application/json',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
    };
    
    return extension && extension in mimeTypes ? mimeTypes[extension] : null;
  };
  
  if (showPdfViewer && decryptedObjectUrl) {
    return (
      <PdfViewer 
        pdfUrl={decryptedObjectUrl} 
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
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleDecrypt(false)}
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
            onClick={() => handleDecrypt(true)}
            disabled={decrypting || !password}
            variant="outline"
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" /> View in Browser
          </Button>
        </div>
        
        {decryptedObjectUrl && !showPdfViewer && (
          <div className="pt-2">
            <a 
              href={decryptedObjectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline flex items-center"
            >
              <FileText className="h-4 w-4 mr-1" /> View decrypted file
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDecryption;
