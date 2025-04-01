
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFiles, getFilesFromPinata } from "@/services/pinataService";
import { getUserFileHashes } from "@/services/web3Service";
import DocumentGrid from "@/components/DocumentGrid";
import FileDropZone from "@/components/FileDropZone";
import { Plus, Search, Shield, Filter } from "lucide-react";
import { toast } from "sonner";

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"all" | "encrypted" | "shared">("all");
  const [verifiedHashes, setVerifiedHashes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load real documents from Pinata
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const files = await getFilesFromPinata();
        if (files && files.length > 0) {
          setDocuments(files);
        }
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("Failed to load your documents");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, []);
  
  useEffect(() => {
    verifyBlockchainStatus();
  }, [documents]);
  
  const verifyBlockchainStatus = async () => {
    try {
      const userHashes = await getUserFileHashes();
      setVerifiedHashes(userHashes);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  const isFileEncrypted = (doc: any) => {
    return (
      doc.name.endsWith('.enc') || 
      doc.name.endsWith('.encrypted') || 
      doc.isEncrypted === true
    );
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (view === "all") return matchesSearch;
    if (view === "encrypted") {
      return matchesSearch && isFileEncrypted(doc);
    }
    // Add more filters as needed
    return matchesSearch;
  });
  
  const documentsWithBlockchainStatus = filteredDocuments.map(doc => ({
    ...doc,
    onBlockchain: verifiedHashes.includes(doc.ipfsHash),
    isEncrypted: isFileEncrypted(doc)
  }));
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Documents</h1>
          <p className="text-muted-foreground">
            Manage and access your decentralized files
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 space-x-2">
          <Button asChild>
            <Link to="/share">
              <Plus className="mr-2 h-4 w-4" /> Upload File
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => setView(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Loading your documents...</p>
            </div>
          ) : documentsWithBlockchainStatus.length > 0 ? (
            <DocumentGrid documents={documentsWithBlockchainStatus} />
          ) : (
            <FileDropZone />
          )}
        </TabsContent>
        
        <TabsContent value="encrypted" className="mt-6">
          {isLoading ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Loading your encrypted files...</p>
            </div>
          ) : documentsWithBlockchainStatus.filter(doc => doc.isEncrypted).length > 0 ? (
            <DocumentGrid documents={documentsWithBlockchainStatus.filter(doc => doc.isEncrypted)} />
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No encrypted files found.</p>
              <Button asChild className="mt-4">
                <Link to="/share">Encrypt & Upload a File</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No shared files found.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsPage;
