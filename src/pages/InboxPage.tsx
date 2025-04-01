
import React, { useState, useEffect } from "react";
import { Inbox, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAccount } from "@/hooks/useAccount";
import MessageList from "@/components/MessageList";
import MessageDetail from "@/components/MessageDetail";
import { getInboxMessages, markMessageAsRead } from "@/services/messagingService";
import { Message } from "@/models/message";
import { toast } from "sonner";

const InboxPage: React.FC = () => {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const fetchMessages = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const inboxMessages = getInboxMessages(address);
      setMessages(inboxMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (address) {
      fetchMessages();
    }
  }, [address]);
  
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's not already read
    if (!message.read && message.recipient.toLowerCase() === address?.toLowerCase()) {
      markMessageAsRead(message.id);
      
      // Update the message in the local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      );
    }
  };
  
  const handleRefresh = () => {
    fetchMessages();
    toast.success("Refreshing inbox...");
  };
  
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <Inbox className="h-12 w-12 mx-auto mb-4 text-primary/40" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access your inbox
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Inbox</h1>
          <p className="text-muted-foreground">
            Secure, encrypted messages and shared files
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {selectedMessage ? (
          <MessageDetail 
            message={selectedMessage} 
            userAddress={address}
            onBack={() => setSelectedMessage(null)}
          />
        ) : (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Messages</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : (
              <MessageList 
                messages={messages} 
                onSelectMessage={handleSelectMessage}
                userAddress={address}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
