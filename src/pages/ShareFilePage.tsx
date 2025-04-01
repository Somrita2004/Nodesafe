
import React, { useState } from "react";
import { Send, FileKey, Copy, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAccount } from "@/hooks/useAccount";
import EncryptedFileUpload from "@/components/EncryptedFileUpload";
import MessageForm from "@/components/MessageForm";
import { toast } from "sonner";

const ShareFilePage: React.FC = () => {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    ipfsHash: string;
    fileName: string;
    fileSize: number;
    password: string;
    salt: string;
  } | null>(null);
  
  const getShareableLink = () => {
    if (!uploadedFileInfo) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/documents/${uploadedFileInfo.ipfsHash}`;
  };
  
  const copyLinkToClipboard = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success("Link copied to clipboard");
    
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };
  
  const handleFileUploaded = (fileInfo: {
    ipfsHash: string;
    fileName: string;
    fileSize: number;
    password: string;
    salt: string;
  }) => {
    setUploadedFileInfo(fileInfo);
    setFileUploaded(true);
  };
  
  const handleMessageSent = () => {
    // Reset form after sending
    setRecipient("");
    setFileUploaded(false);
    setUploadedFileInfo(null);
    
    toast.success("File shared successfully!");
  };
  
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <FileKey className="h-12 w-12 mx-auto mb-4 text-primary/40" />
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Share Files Securely</h1>
          <p className="text-muted-foreground">
            End-to-end encrypted file sharing with password protection
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="message" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="message">Share via Message</TabsTrigger>
          <TabsTrigger value="link">Share via Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="message" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EncryptedFileUpload onFileUploaded={handleFileUploaded} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send to Recipient
                </CardTitle>
                <CardDescription>
                  Send the encrypted file link directly to another user
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
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
                
                {uploadedFileInfo && (
                  <Alert variant="outline" className="bg-green-500/5 border-green-500/20">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>File Ready to Share</AlertTitle>
                    <AlertDescription className="text-sm">
                      {uploadedFileInfo.fileName} ({(uploadedFileInfo.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </AlertDescription>
                  </Alert>
                )}
                
                <MessageForm 
                  sender={address} 
                  recipient={recipient}
                  onMessageSent={handleMessageSent}
                  attachedFile={uploadedFileInfo ? {
                    ipfsHash: uploadedFileInfo.ipfsHash,
                    name: uploadedFileInfo.fileName,
                    size: uploadedFileInfo.fileSize,
                    salt: uploadedFileInfo.salt,
                    isEncrypted: true,
                    password: uploadedFileInfo.password
                  } : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="link" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EncryptedFileUpload onFileUploaded={handleFileUploaded} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Share Link & Password
                </CardTitle>
                <CardDescription>
                  Share the link and password separately for maximum security
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {uploadedFileInfo ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="shareableLink">Shareable Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="shareableLink" 
                          value={getShareableLink()} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={copyLinkToClipboard}
                        >
                          {linkCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="decryptionPassword">Decryption Password</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="decryptionPassword" 
                          value={uploadedFileInfo.password} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(uploadedFileInfo.password);
                            toast.success("Password copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send this password through a separate secure channel
                      </p>
                    </div>
                    
                    <Alert variant="default" className="mt-4">
                      <AlertTitle>Important Security Note</AlertTitle>
                      <AlertDescription className="text-sm">
                        For maximum security, share the link and password through different communication channels.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileKey className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload and encrypt a file first to get a shareable link
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShareFilePage;
