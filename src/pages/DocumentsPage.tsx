
import React, { useState, useEffect } from "react";
import { Search, Upload, Filter, RefreshCw, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DocumentGrid from "@/components/DocumentGrid";
import { getFilesFromPinata, isPinataConfigured } from "@/services/pinataService";
import { getUserFileHashes, checkFileExists } from "@/services/web3Service";
import WalletConnect from "@/components/WalletConnect";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Array<{ipfsHash: string; name: string; size: number; createdAt: string; onBlockchain?: boolean;}>>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Array<{ipfsHash: string; name: string; size: number; createdAt: string; onBlockchain?: boolean;}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOnlyBlockchain, setShowOnlyBlockchain] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      // Check if Pinata is configured first
      if (!isPinataConfigured()) {
        toast.error("Pinata API credentials not configured. Please configure it first.");
        navigate("/");
        return;
      }

      const files = await getFilesFromPinata();
      setDocuments(files);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBlockchainStatus = async () => {
    if (documents.length === 0) return;
    
    setIsVerifying(true);
    try {
      // Get all hashes from the blockchain
      const blockchainHashes = await getUserFileHashes();
      
      // Create a lookup set for O(1) search
      const hashesSet = new Set(blockchainHashes);
      
      // Update documents with blockchain status
      const updatedDocs = documents.map(doc => ({
        ...doc,
        onBlockchain: hashesSet.has(doc.ipfsHash)
      }));
      
      setDocuments(updatedDocs);
      toast.success("Blockchain verification complete");
    } catch (error) {
      console.error("Error verifying blockchain status:", error);
      toast.error("Failed to verify blockchain status");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      // Verify blockchain status when documents are loaded
      verifyBlockchainStatus();
    }
  }, [documents.length]);

  useEffect(() => {
    let filtered = documents;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by blockchain status if enabled
    if (showOnlyBlockchain) {
      filtered = filtered.filter(doc => doc.onBlockchain);
    }
    
    setFilteredDocuments(filtered);
  }, [searchQuery, documents, showOnlyBlockchain]);

  const handleRefresh = () => {
    fetchDocuments();
    toast.success("Refreshing document list...");
  };

  const toggleBlockchainFilter = () => {
    setShowOnlyBlockchain(!showOnlyBlockchain);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Documents</h1>
          <p className="text-muted-foreground">
            All your securely stored documents in one place
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button 
            className="flex items-center"
            onClick={() => navigate("/")}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload New
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Document List</h2>
          <WalletConnect />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant={showOnlyBlockchain ? "default" : "outline"}
            className="flex items-center"
            onClick={toggleBlockchainFilter}
          >
            <Shield className="mr-2 h-4 w-4" /> 
            {showOnlyBlockchain ? "Showing Blockchain Files" : "Show Blockchain Files"}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={verifyBlockchainStatus}
            disabled={isVerifying}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying ? "animate-spin" : ""}`} /> 
            Verify Blockchain
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your documents...</p>
        </div>
      ) : (
        <DocumentGrid documents={filteredDocuments} />
      )}
    </div>
  );
};

export default DocumentsPage;
