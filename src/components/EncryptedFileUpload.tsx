
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Shield, Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize } from "@/lib/file-utils";
import { uploadFileToPinata } from "@/services/pinataService";
import { encryptFile, generateSecurePassword } from "@/services/encryptionService";
import { toast } from "sonner";

interface EncryptedFileUploadProps {
  onUploadComplete?: (fileUrl: string, ipfsHash: string, encryptionInfo?: {
    password: string;
    salt: string;
    name: string;
  }) => void;
}

const EncryptedFileUpload: React.FC<EncryptedFileUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [salt, setSalt] = useState("");
  const [encryptedFileName, setEncryptedFileName] = useState("");
  const [useEncryption, setUseEncryption] = useState(true);
  const [useRandomPassword, setUseRandomPassword] = useState(true);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setIpfsHash(null);
      
      // Generate a random password when a file is selected
      if (useRandomPassword) {
        setPassword(generateSecurePassword());
      }
    }
  }, [useRandomPassword]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 70 ? 70 : newProgress;
        });
      }, 200);

      // Read file as ArrayBuffer
      const fileArrayBuffer = await selectedFile.arrayBuffer();
      
      let uploadedFile: Blob;
      let fileSalt = "";
      
      // Encrypt file if encryption is enabled
      if (useEncryption) {
        setUploadProgress(75);
        const { encryptedData, salt } = await encryptFile(fileArrayBuffer, password);
        fileSalt = salt;
        setSalt(salt);
        
        // Convert encrypted string to Blob
        const encryptedBlob = new Blob([encryptedData], { type: 'application/encrypted' });
        uploadedFile = encryptedBlob;
        
        // Create an encrypted file name
        const encFileName = `${selectedFile.name}.encrypted`;
        setEncryptedFileName(encFileName);
      } else {
        uploadedFile = new Blob([fileArrayBuffer]);
      }

      // Create a File object from the Blob
      const fileToUpload = new File(
        [uploadedFile], 
        useEncryption ? `${selectedFile.name}.encrypted` : selectedFile.name, 
        { type: useEncryption ? 'application/encrypted' : selectedFile.type }
      );

      // Upload to Pinata
      setUploadProgress(85);
      const result = await uploadFileToPinata(fileToUpload);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result && result.fileUrl) {
        const hash = result.ipfsHash || result.fileUrl.split('/').pop() || '';
        setIpfsHash(hash);
        
        toast.success("File uploaded to IPFS successfully!");
        
        if (onUploadComplete) {
          onUploadComplete(
            result.fileUrl, 
            hash,
            useEncryption ? {
              password,
              salt: fileSalt,
              name: selectedFile.name
            } : undefined
          );
        }
      } else {
        throw new Error("Upload failed - no file URL returned");
      }
    } catch (error) {
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

  const removeFile = () => {
    setSelectedFile(null);
    setIpfsHash(null);
    setUploadProgress(0);
    setPassword(useRandomPassword ? generateSecurePassword() : "");
    setSalt("");
  };

  const toggleRandomPassword = () => {
    setUseRandomPassword(!useRandomPassword);
    if (!useRandomPassword) {
      setPassword(generateSecurePassword());
    } else {
      setPassword("");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-4 flex items-center space-x-2">
        <Checkbox 
          id="useEncryption" 
          checked={useEncryption} 
          onCheckedChange={(checked) => setUseEncryption(checked === true)} 
        />
        <Label htmlFor="useEncryption" className="cursor-pointer">Enable encryption</Label>
      </div>

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

          {useEncryption && (
            <div className="space-y-3 mb-4 p-3 bg-muted/30 rounded-md">
              <div className="flex items-center">
                <Lock className="w-4 h-4 text-primary mr-2" />
                <p className="text-sm font-medium">Encryption Settings</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useRandomPassword" 
                  checked={useRandomPassword} 
                  onCheckedChange={() => toggleRandomPassword()} 
                />
                <Label htmlFor="useRandomPassword" className="cursor-pointer text-sm">
                  Use random password
                </Label>
              </div>
              
              <div className="relative">
                <Label htmlFor="password" className="text-xs block mb-1">
                  Password (will not be stored)
                </Label>
                <div className="flex items-center">
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={useRandomPassword}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    type="button" 
                    onClick={handleCopyPassword}
                    className="absolute right-0 h-full px-3"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {useRandomPassword ? "A secure random password has been generated" : "Choose a strong password"}
                </p>
              </div>
            </div>
          )}

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 75
                  ? "Preparing file..."
                  : uploadProgress < 85
                  ? "Encrypting file..."
                  : uploadProgress < 100
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
                {useEncryption && (
                  <div className="text-xs mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Keep your password safe!</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Anyone with this password can decrypt your file.
                    </p>
                  </div>
                )}
              </div>
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
              {useEncryption ? "Encrypt & Upload" : "Upload to IPFS"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EncryptedFileUpload;
