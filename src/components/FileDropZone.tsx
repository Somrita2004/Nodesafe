
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/file-utils";
import { uploadFileToPinata } from "@/services/pinataService";
import { storeFileHash } from "@/services/web3Service";
import { toast } from "sonner";

interface FileDropZoneProps {
  onUploadComplete?: (fileUrl: string, ipfsHash: string) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [storingOnChain, setStoringOnChain] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setIpfsHash(null); // Reset hash when new file is selected
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);

    try {
      const result = await uploadFileToPinata(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result && result.fileUrl) {
        // Extract the IPFS hash from the URL
        const hash = result.ipfsHash || result.fileUrl.split('/').pop() || '';
        setIpfsHash(hash);
        
        toast.success("File uploaded to IPFS successfully!");
        if (onUploadComplete) {
          setTimeout(() => {
            onUploadComplete(result.fileUrl, hash);
          }, 1000); // Short delay to show the 100% progress
        }
      } else {
        throw new Error("Upload failed - no file URL returned");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error("Upload failed. Please check your Pinata API credentials.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleStoreOnBlockchain = async () => {
    if (!ipfsHash) return;
    
    setStoringOnChain(true);
    try {
      const success = await storeFileHash(ipfsHash);
      if (success) {
        toast.success("File hash stored on blockchain successfully!");
      }
    } finally {
      setStoringOnChain(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIpfsHash(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            className={`w-12 h-12 mb-4 ${
              isDragActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <p className="text-lg font-medium mb-1">
            {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <Button variant="outline" size="sm">
            Select File
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-5 bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <File className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="font-medium text-sm truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!uploading && !ipfsHash && (
              <button
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100
                  ? "Uploading to IPFS..."
                  : "Upload complete!"}
              </p>
            </div>
          ) : ipfsHash ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    File uploaded to IPFS
                  </p>
                </div>
                <p className="text-xs mt-1 text-green-600 dark:text-green-300 break-all">
                  IPFS Hash: {ipfsHash}
                </p>
              </div>
              <Button 
                className="w-full"
                onClick={handleStoreOnBlockchain}
                disabled={storingOnChain}
              >
                {storingOnChain ? "Storing on Blockchain..." : "Store on Blockchain"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={removeFile}
              >
                Upload Another File
              </Button>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full">
              Upload to IPFS
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
