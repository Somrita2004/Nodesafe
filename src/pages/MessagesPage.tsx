
import React, { useState, useEffect } from "react";
import { MessageSquare, Send, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/hooks/useAccount";
import MessageList from "@/components/MessageList";
import MessageDetail from "@/components/MessageDetail";
import MessageForm from "@/components/MessageForm";
import { getInboxMessages, getSentMessages } from "@/services/messagingService";
import { Message } from "@/models/message";
import { toast } from "sonner";

const MessagesPage: React.FC = () => {
  const { address } = useAccount();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [recipient, setRecipient] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  
  const fetchMessages = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const inbox = getInboxMessages(address);
      const sent = getSentMessages(address);
      
      setInboxMessages(inbox);
      setSentMessages(sent);
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
  };
  
  const handleRefresh = () => {
    fetchMessages();
    toast.success("Refreshing messages...");
  };
  
  const handleMessageSent = () => {
    fetchMessages();
    setRecipient("");
  };
  
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary/40" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access your messages
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Secure, end-to-end encrypted communication
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
      
      {selectedMessage ? (
        <MessageDetail 
          message={selectedMessage} 
          userAddress={address}
          onBack={() => setSelectedMessage(null)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg overflow-hidden">
              <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6 pt-6">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="inbox" className="flex items-center">
                      <Inbox className="mr-2 h-4 w-4" /> Inbox
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> Sent
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-6">
                  <TabsContent value="inbox" className="m-0">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading messages...</p>
                      </div>
                    ) : (
                      <MessageList 
                        messages={inboxMessages} 
                        onSelectMessage={handleSelectMessage}
                        userAddress={address}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sent" className="m-0">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading messages...</p>
                      </div>
                    ) : (
                      <MessageList 
                        messages={sentMessages} 
                        onSelectMessage={handleSelectMessage}
                        userAddress={address}
                      />
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
          
          <div>
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium">New Message</h2>
              
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
