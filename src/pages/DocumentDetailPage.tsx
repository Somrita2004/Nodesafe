
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Share, 
  Link as LinkIcon,
  FileText,
  Calendar,
  HardDrive,
  CheckCircle,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFiles, getIpfsUrl } from "@/services/pinataService";
import { formatFileSize, formatDate, getFileType } from "@/lib/file-utils";
import { toast } from "sonner";
import FileDecryption from "@/components/FileDecryption";

const DocumentDetailPage: React.FC = () => {
  const { ipfsHash } = useParams<{ ipfsHash: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulating API fetch
    const fetchDocument = () => {
      setLoading(true);
      setTimeout(() => {
        const foundDoc = mockFiles.find(file => file.ipfsHash === ipfsHash);
        setDocument(foundDoc || null);
        setLoading(false);
      }, 500);
    };

    fetchDocument();
  }, [ipfsHash]);

  const handleCopyLink = () => {
    if (!document) return;
    
    const fileUrl = getIpfsUrl(document.ipfsHash);
    navigator.clipboard.writeText(fileUrl);
    
    setCopied(true);
    toast.success("Link copied to clipboard");
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-pulse bg-muted rounded-full h-12 w-12 mx-auto mb-4"></div>
          <h1 className="text-2xl font-medium">Loading document details...</h1>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Document not found</h1>
          <p className="text-muted-foreground mb-6">
            The document you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/documents">Back to Documents</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fileType = getFileType(document.name);
  const fileUrl = getIpfsUrl(document.ipfsHash);
  const isEncrypted = document.name.endsWith('.enc') || document.name.endsWith('.encrypted') || document.isEncrypted;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/documents" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">{document.name}</h1>
        <p className="text-muted-foreground">
          Stored on IPFS with hash: {document.ipfsHash.substring(0, 16)}...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center bg-muted/30 min-h-[300px]">
              {isEncrypted ? (
                <div className="text-center">
                  <Lock className="h-20 w-20 mx-auto mb-4 text-purple-500/40" />
                  <h3 className="text-xl font-medium mb-2">Encrypted File</h3>
                  <p className="text-muted-foreground mb-4">
                    This file is encrypted and requires a password to view
                  </p>
                </div>
              ) : fileType === "image" ? (
                <img 
                  src={fileUrl} 
                  alt={document.name} 
                  className="max-w-full max-h-[400px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=Preview+Unavailable";
                  }}
                />
              ) : (
                <div className="text-center">
                  <FileText className="h-20 w-20 mx-auto mb-4 text-primary/40" />
                  <h3 className="text-xl font-medium mb-2">File Preview</h3>
                  <p className="text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  <Button asChild>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      Open File
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <h3 className="font-medium mb-4">IPFS Link</h3>
              <div className="flex items-center">
                <div className="bg-muted p-3 rounded-lg flex-1 flex items-center overflow-hidden">
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mr-2" />
                  <span className="text-sm truncate">{fileUrl}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {isEncrypted && (
            <div className="mt-6">
              <FileDecryption 
                ipfsHash={document.ipfsHash} 
                fileName={document.name}
                salt={document.salt || ""}
              />
            </div>
          )}
        </div>

        <div>
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h3 className="font-medium mb-4">Document Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">File Name</p>
                  <p className="font-medium">{document.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{formatFileSize(document.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDate(document.createdAt)}</p>
                </div>
              </div>

              {isEncrypted && (
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Encryption</p>
                    <p className="font-medium">AES-256 Encrypted</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-medium mb-4">Actions</h3>
            <div className="space-y-3">
              {isEncrypted ? (
                <Button className="w-full justify-start" variant="default">
                  <Lock className="mr-2 h-4 w-4" /> Decrypt File
                </Button>
              ) : (
                <Button className="w-full justify-start" asChild>
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Share className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
