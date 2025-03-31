
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { sendMessage, encryptMessageContent } from "@/services/messagingService";
import { FileAttachment } from "@/models/message";
import { toast } from "sonner";

interface MessageFormProps {
  sender: string;
  recipient: string;
  onMessageSent?: () => void;
  attachedFile?: {
    ipfsHash: string;
    name: string;
    size: number;
    salt?: string;
    isEncrypted: boolean;
    password?: string;
  };
}

const MessageForm: React.FC<MessageFormProps> = ({ 
  sender, 
  recipient, 
  onMessageSent,
  attachedFile
}) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  
  const handleSendMessage = async () => {
    if (!content.trim() && !attachedFile) {
      toast.error("Please enter a message or attach a file");
      return;
    }
    
    if (!recipient) {
      toast.error("Please enter a recipient address");
      return;
    }
    
    setSending(true);
    
    try {
      // Encrypt message content for E2E encryption
      const encryptedContent = encryptMessageContent(content, recipient);
      
      // Prepare attachments if any
      const attachments: FileAttachment[] = [];
      if (attachedFile) {
        attachments.push({
          ipfsHash: attachedFile.ipfsHash,
          name: attachedFile.name,
          size: attachedFile.size,
          salt: attachedFile.salt,
          isEncrypted: attachedFile.isEncrypted
        });
      }
      
      // Send the message
      const message = sendMessage({
        sender,
        recipient,
        content: encryptedContent,
        attachments
      });
      
      setContent("");
      toast.success("Message sent successfully");
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[100px] resize-none"
        />
        
        {attachedFile && (
          <div className="p-3 bg-muted rounded flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm truncate max-w-[200px]">{attachedFile.name}</span>
            </div>
            {attachedFile.isEncrypted && attachedFile.password && (
              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Password included
              </div>
            )}
          </div>
        )}
        
        <Button
          onClick={handleSendMessage}
          disabled={sending || (!content.trim() && !attachedFile)}
          className="w-full"
        >
          {sending ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Message
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageForm;
