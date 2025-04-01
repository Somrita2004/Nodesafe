
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Download, FileText } from "lucide-react";
import { decryptFile } from "@/services/encryptionService";
import { getIpfsUrl } from "@/services/pinataService";
import { toast } from "sonner";

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
  
  const handleDecrypt = async () => {
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
      
      // Decrypt the content
      const decryptedData = await decryptFile(encryptedContent, password, salt);
      console.log("Decryption successful, data size:", decryptedData.byteLength);
      
      setDownloadProgress(90);
      
      // Create a download link for the decrypted file
      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      
      // Figure out proper filename
      let downloadFilename = fileName;
      if (downloadFilename.endsWith('.encrypted') || downloadFilename.endsWith('.enc')) {
        downloadFilename = downloadFilename.replace(/\.(encrypted|enc)$/, '');
      }
      
      // Create a temporary anchor and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadProgress(100);
      toast.success("File decrypted successfully!");
    } catch (error) {
      console.error("Decryption error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to decrypt file";
      setError(errorMessage);
      toast.error("Failed to decrypt file. Please check your password.");
    } finally {
      setDecrypting(false);
    }
  };
  
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
        
        <Button
          onClick={handleDecrypt}
          disabled={decrypting || !password}
          className="w-full"
        >
          {decrypting ? (
            <>Decrypting...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Decrypt & Download
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileDecryption;
