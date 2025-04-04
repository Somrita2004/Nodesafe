
import React, { useState } from "react";
import { Message } from "@/models/message";
import { formatDate } from "@/lib/file-utils";
import { Paperclip, Download, ArrowLeft, Lock, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIpfsUrl } from "@/services/pinataService";
import { decryptMessageContent } from "@/services/messagingService";
import FileDecryption from "./FileDecryption";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AesEncryptionDemo from "./AesEncryptionDemo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MessageDetailProps {
  message: Message;
  userAddress: string;
  onBack: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ 
  message, 
  userAddress,
  onBack
}) => {
  const [showDecryption, setShowDecryption] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptionAttempted, setDecryptionAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState("message");
  
  // Decrypt message content if recipient
  const isRecipient = message.recipient.toLowerCase() === userAddress.toLowerCase();
  let decryptedContent = message.content;
  
  try {
    if (isRecipient && !decryptionAttempted) {
      try {
        decryptedContent = decryptMessageContent(message.content, userAddress);
        setDecryptionAttempted(true);
      } catch (e) {
        console.error("Message decryption error:", e);
        setError("Failed to decrypt message content");
        setDecryptionAttempted(true);
      }
    }
  } catch (e) {
    console.error("Message decryption setup error:", e);
  }
  
  const hasAttachment = message.attachments && message.attachments.length > 0;
  const attachment = hasAttachment ? message.attachments[0] : null;
  
  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="message">Message</TabsTrigger>
          <TabsTrigger value="encryption-demo">
            <Shield className="mr-2 h-4 w-4" /> AES Encryption Demo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="message">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm">
                  {isRecipient ? "From" : "To"}: <span className="font-medium">
                    {isRecipient ? message.sender : message.recipient}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(message.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              {error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="whitespace-pre-wrap">{decryptedContent}</div>
              )}
            </div>
            
            {hasAttachment && attachment && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Attachments</h3>
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                    {attachment.isEncrypted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDecryption(!showDecryption)}
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        {showDecryption ? "Hide Decryption" : "Decrypt"}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(getIpfsUrl(attachment.ipfsHash), '_blank')}
                      >
                        <Download className="mr-1 h-3 w-3" /> Download
                      </Button>
                    )}
                  </div>
                  
                  {showDecryption && attachment.isEncrypted && (
                    <div className="mt-3">
                      <FileDecryption 
                        ipfsHash={attachment.ipfsHash}
                        fileName={attachment.name}
                        salt={attachment.salt || ""}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="encryption-demo">
          <AesEncryptionDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageDetail;
