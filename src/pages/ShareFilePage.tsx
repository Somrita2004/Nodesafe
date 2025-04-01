
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Copy, CloudUpload, FileText, Eye, EyeOff, Send, Loader2 } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import EncryptedFileUpload from "@/components/EncryptedFileUpload";
import PinataConfigForm from "@/components/PinataConfigForm";
import { isPinataConfigured } from "@/services/pinataService";
import { sendMessage } from "@/services/messagingService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FileAttachment } from "@/models/message";

interface EncryptedFileInfo {
  ipfsHash: string;
  fileName: string;
  fileSize: number;
  password: string;
  salt: string;
}

const ShareFilePage: React.FC = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [encryptedFileInfo, setEncryptedFileInfo] = useState<EncryptedFileInfo | null>(null);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkPinataConfig();
  }, []);

  const checkPinataConfig = () => {
    setIsConfigured(isPinataConfigured());
  };

  const handleConfigured = () => {
    setShowConfigForm(false);
    checkPinataConfig();
    toast.success("Pinata configured successfully!");
  };

  const handleFileUploaded = (fileInfo: EncryptedFileInfo) => {
    setEncryptedFileInfo(fileInfo);
  };

  const copyToClipboard = (text: string, type: "hash" | "password" = "hash") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 3000);
    } else {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    }
    toast.success(`${type === "hash" ? "IPFS Hash" : "Password"} copied to clipboard`);
  };

  const handleSendMessage = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!encryptedFileInfo) {
      toast.error("No file uploaded");
      return;
    }

    if (!recipient) {
      toast.error("Please enter a recipient address");
      return;
    }

    setSending(true);
    try {
      // Create a FileAttachment object from the encrypted file info
      const fileAttachment: FileAttachment = {
        ipfsHash: encryptedFileInfo.ipfsHash,
        name: encryptedFileInfo.fileName,
        size: encryptedFileInfo.fileSize,
        salt: encryptedFileInfo.salt,
        isEncrypted: true
      };

      // Send message with the file attachment
      await sendMessage({
        sender: address,
        recipient: recipient,
        content: message || "Shared an encrypted file with you",
        attachments: [fileAttachment]
      });

      toast.success("Encrypted file shared successfully!");
      setEncryptedFileInfo(null);
      setRecipient("");
      setMessage("");
      navigate("/messages");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Share Encrypted File</h1>
          <p className="text-muted-foreground">
            Share files securely with end-to-end encryption
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-6">Upload & Encrypt</h2>
            
            {!isConfigured ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                <div className="flex justify-center mb-4">
                  <CloudUpload className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-medium mb-2">Pinata API Not Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Please configure your Pinata API credentials to enable file uploading
                </p>
                <Button variant="default" onClick={() => setShowConfigForm(true)}>
                  Configure Pinata
                </Button>
              </div>
            ) : (
              <>
                {encryptedFileInfo ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-green-800">File Encrypted Successfully</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Your file is now encrypted and stored on IPFS
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fileName">File Name</Label>
                        <div className="flex items-center mt-1.5 border rounded-md p-2 bg-muted/50">
                          <FileText className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">{encryptedFileInfo.fileName}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="ipfsHash">IPFS Hash</Label>
                        <div className="flex items-center mt-1.5">
                          <Input 
                            id="ipfsHash" 
                            value={encryptedFileInfo.ipfsHash} 
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(encryptedFileInfo.ipfsHash)}
                            className="ml-2"
                          >
                            {hashCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Decryption Password</Label>
                        <div className="flex items-center mt-1.5">
                          <Input 
                            id="password" 
                            value={encryptedFileInfo.password} 
                            readOnly
                            className="font-mono text-xs"
                            type={showPassword ? "text" : "password"}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(encryptedFileInfo.password, "password")}
                            className="ml-1"
                          >
                            {passwordCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-6">
                      <Label className="mb-2 block">Share via Message</Label>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Enter recipient address (0x...)" 
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                        />
                        
                        <Textarea 
                          placeholder="Add a message (optional)" 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={3}
                        />
                        
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!recipient || sending}
                          className="w-full"
                        >
                          {sending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" /> Send Encrypted File
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EncryptedFileUpload onFileUploaded={handleFileUploaded} />
                )}
              </>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">How It Works</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Encryption</h3>
                  <p className="text-muted-foreground mt-1">
                    Your file is encrypted with AES-256 in your browser before uploading
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium">IPFS Storage</h3>
                  <p className="text-muted-foreground mt-1">
                    The encrypted file is stored on IPFS, a decentralized storage network
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Secure Sharing</h3>
                  <p className="text-muted-foreground mt-1">
                    Share the IPFS link and password securely through the app messaging
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Security Note:</span> The encryption password is never stored on any server. Make sure the recipient has the password to decrypt the file.
              </p>
            </div>
          </div>
          
          {showConfigForm && (
            <div className="mt-6">
              <PinataConfigForm onConfigured={handleConfigured} />
              <Button 
                variant="ghost" 
                onClick={() => setShowConfigForm(false)}
                className="mt-4"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareFilePage;
