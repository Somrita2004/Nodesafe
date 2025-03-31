
import React, { useState } from "react";
import { Lock, Shield, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAccount } from "@/hooks/useAccount";
import EncryptedFileUpload from "@/components/EncryptedFileUpload";
import MessageForm from "@/components/MessageForm";
import { toast } from "sonner";

const ShareFilePage: React.FC = () => {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    ipfsHash: string;
    fileUrl: string;
    name: string;
    size: number;
    password?: string;
    salt?: string;
    isEncrypted: boolean;
  } | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  
  const handleUploadComplete = (fileUrl: string, ipfsHash: string, encryptionInfo?: {
    password: string;
    salt: string;
    name: string;
  }) => {
    const fileData = {
      ipfsHash,
      fileUrl,
      name: encryptionInfo?.name || "Unnamed File",
      size: 0, // We don't have the size info at this point
      password: encryptionInfo?.password,
      salt: encryptionInfo?.salt,
      isEncrypted: !!encryptionInfo
    };
    
    setUploadedFile(fileData);
    
    // Generate a share link
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/documents/${ipfsHash}`;
    setShareLink(shareUrl);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  const handleMessageSent = () => {
    toast.success("Message with encrypted file sent successfully!");
    setUploadedFile(null);
    setRecipient("");
    setShareLink("");
  };
  
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary/40" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to share encrypted files
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share Encrypted Files</h1>
        <p className="text-muted-foreground">
          Upload, encrypt, and securely share your files
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Upload & Encrypt</h2>
            {!uploadedFile ? (
              <EncryptedFileUpload onUploadComplete={handleUploadComplete} />
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      File encrypted and uploaded successfully!
                    </p>
                  </div>
                  <p className="text-xs mt-1 text-green-700 dark:text-green-300">
                    {uploadedFile.name}
                  </p>
                  
                  {uploadedFile.isEncrypted && uploadedFile.password && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center mb-1">
                        <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                          Decryption Password
                        </p>
                      </div>
                      <div className="flex items-center">
                        <code className="text-xs bg-yellow-100 dark:bg-yellow-800/30 px-2 py-1 rounded mr-2 flex-1 overflow-x-auto">
                          {uploadedFile.password}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (uploadedFile.password) {
                              navigator.clipboard.writeText(uploadedFile.password);
                              toast.success("Password copied to clipboard");
                            }
                          }}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-300">
                        Save this password. The recipient will need it to decrypt the file.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="shareLink" className="text-sm">Share Link</Label>
                  <div className="flex mt-1">
                    <Input
                      id="shareLink"
                      value={shareLink}
                      readOnly
                      className="flex-1 rounded-r-none"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="rounded-l-none"
                      variant={linkCopied ? "success" : "default"}
                    >
                      {linkCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setShareLink("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Upload Another File
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">Share via Message</h2>
            
            <div>
              <Label htmlFor="recipient" className="text-sm">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="mt-1"
              />
            </div>
            
            <MessageForm 
              sender={address} 
              recipient={recipient}
              onMessageSent={handleMessageSent}
              attachedFile={uploadedFile || undefined}
            />
            
            {!uploadedFile && (
              <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground">
                <p className="mb-2">Upload a file first to share it securely.</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Files are encrypted before uploading</li>
                  <li>Recipient needs the password to decrypt</li>
                  <li>Messages are end-to-end encrypted</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareFilePage;
