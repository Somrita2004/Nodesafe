
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
  
  const handleDecrypt = async () => {
    if (!password) {
      setError("Please enter the decryption password");
      return;
    }

    setDecrypting(true);
    setError(null);
    
    try {
      // Fetch the encrypted file from IPFS
      const fileUrl = getIpfsUrl(ipfsHash);
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      // Get the encrypted content as text
      const encryptedContent = await response.text();
      
      // Decrypt the content
      const decryptedData = await decryptFile(encryptedContent, password, salt);
      
      // Create a download link for the decrypted file
      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.encrypted') 
        ? fileName.substring(0, fileName.length - 10) 
        : fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("File decrypted successfully!");
    } catch (error) {
      console.error("Decryption error:", error);
      setError(error instanceof Error ? error.message : "Failed to decrypt file");
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
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
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
