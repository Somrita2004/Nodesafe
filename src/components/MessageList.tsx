
import React from "react";
import { Message } from "@/models/message";
import { formatDistanceToNow } from "date-fns";
import { File, Paperclip, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIpfsUrl } from "@/services/pinataService";

interface MessageListProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  userAddress: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onSelectMessage,
  userAddress
}) => {
  if (messages.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4 bg-muted rounded-full p-3 inline-block">
          <File className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No messages found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            !message.read && message.recipient.toLowerCase() === userAddress.toLowerCase()
              ? "bg-primary/5 border-primary/20"
              : "bg-card hover:bg-muted/50"
          }`}
          onClick={() => onSelectMessage(message)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium truncate max-w-[200px]">
              {message.recipient.toLowerCase() === userAddress.toLowerCase() 
                ? `From: ${message.sender.substring(0, 6)}...${message.sender.substring(message.sender.length - 4)}`
                : `To: ${message.recipient.substring(0, 6)}...${message.recipient.substring(message.recipient.length - 4)}`
              }
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {message.attachments && message.attachments.length > 0 && (
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground truncate max-w-[250px]">
                {message.attachments && message.attachments.length > 0
                  ? `File: ${message.attachments[0].name}`
                  : "Message"}
              </span>
            </div>
            
            <div className="flex items-center">
              {!message.read && message.recipient.toLowerCase() === userAddress.toLowerCase() && (
                <Badge variant="outline" className="ml-2 text-xs">New</Badge>
              )}
              {message.read && message.recipient.toLowerCase() !== userAddress.toLowerCase() && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
