
import React, { useState, useEffect } from "react";
import { Search, Upload, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DocumentGrid from "@/components/DocumentGrid";
import { mockFiles } from "@/services/pinataService";
import { useNavigate } from "react-router-dom";

const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState(mockFiles);
  const [filteredDocuments, setFilteredDocuments] = useState(mockFiles);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would fetch from Pinata
    // For now, using mock data
    setDocuments(mockFiles);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchQuery, documents]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Documents</h1>
          <p className="text-muted-foreground">
            All your securely stored documents in one place
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 flex items-center"
          onClick={() => navigate("/")}
        >
          <Upload className="mr-2 h-4 w-4" /> Upload New
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-8">
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
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <DocumentGrid documents={filteredDocuments} />
    </div>
  );
};

export default DocumentsPage;
