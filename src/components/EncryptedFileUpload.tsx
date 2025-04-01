
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shield, Upload, Copy, CheckCircle, Info } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import CryptoJS from 'crypto-js';
import { uploadFileToPinata } from '@/services/pinataService';
import { toast } from 'sonner';

interface EncryptedFileUploadProps {
  onFileUploaded?: (fileInfo: {
    ipfsHash: string;
    fileName: string;
    fileSize: number;
    password: string;
    salt: string;
  }) => void;
}

const EncryptedFileUpload: React.FC<EncryptedFileUploadProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedHash, setUploadedHash] = useState('');
  const [salt, setSalt] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });
  
  const generateRandomPassword = () => {
    setIsGeneratingPassword(true);
    
    try {
      // Generate a secure random password (16 characters)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
      let result = '';
      
      // Use crypto API for more secure random generation
      const randomValues = new Uint8Array(16);
      window.crypto.getRandomValues(randomValues);
      
      randomValues.forEach(val => {
        result += characters.charAt(val % characters.length);
      });
      
      setPassword(result);
    } catch (error) {
      console.error('Error generating password:', error);
      toast.error('Failed to generate a secure password');
    } finally {
      setIsGeneratingPassword(false);
    }
  };
  
  const encryptAndUploadFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    if (!password) {
      toast.error('Please enter or generate a password');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a random salt for encryption
      const randomSalt = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
      setSalt(randomSalt);
      
      // Read the file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Convert ArrayBuffer to WordArray (CryptoJS format)
      const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
      
      // Encrypt the file with AES using the password and salt
      const encrypted = CryptoJS.AES.encrypt(wordArray, password, { 
        salt: CryptoJS.enc.Hex.parse(randomSalt)
      }).toString();
      
      // Convert encrypted string to Blob for uploading
      const encryptedBlob = new Blob([encrypted], { type: 'application/encrypted' });
      
      // Create a File object from the Blob
      const encryptedFile = new File([encryptedBlob], `${file.name}.enc`, { type: 'application/encrypted' });
      
      // Upload encrypted file to IPFS
      const result = await uploadFileToPinata(encryptedFile);
      
      if (result && result.ipfsHash) {
        setUploadedHash(result.ipfsHash);
        
        if (onFileUploaded) {
          onFileUploaded({
            ipfsHash: result.ipfsHash,
            fileName: file.name,
            fileSize: file.size,
            password: password,
            salt: randomSalt
          });
        }
        
        toast.success('File encrypted and uploaded successfully!');
      } else {
        throw new Error('Failed to upload to IPFS');
      }
    } catch (error) {
      console.error('Error encrypting and uploading:', error);
      toast.error('Failed to encrypt and upload the file');
    } finally {
      setIsUploading(false);
    }
  };
  
  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    toast.success('Password copied to clipboard');
    
    setTimeout(() => {
      setPasswordCopied(false);
    }, 3000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Encrypted File Upload
        </CardTitle>
        <CardDescription>
          Files are encrypted with AES-256 before uploading to IPFS
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
            ${file ? 'bg-muted/50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Encryption Password</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={generateRandomPassword}
              disabled={isGeneratingPassword}
              className="text-xs"
            >
              {isGeneratingPassword ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Strong Password'
              )}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input 
              id="password" 
              type="text" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="font-mono"
            />
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={copyPasswordToClipboard}
              disabled={!password}
              size="icon"
            >
              {passwordCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {uploadedHash && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>File Uploaded Successfully</AlertTitle>
            <AlertDescription className="text-xs truncate">
              IPFS Hash: {uploadedHash}
            </AlertDescription>
          </Alert>
        )}
        
        <Alert variant="default" className="bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription className="text-sm">
            1. Your file is encrypted with AES-256 in your browser
            <br />
            2. Only the encrypted version is uploaded to IPFS
            <br />
            3. The encryption password is never sent to any server
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={encryptAndUploadFile}
          disabled={!file || !password || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Encrypting & Uploading...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" /> Encrypt & Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EncryptedFileUpload;
