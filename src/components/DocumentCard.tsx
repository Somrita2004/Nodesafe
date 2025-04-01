
import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Image, 
  File, 
  Video, 
  Music, 
  Archive, 
  ExternalLink,
  Shield,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate, getFileType } from "@/lib/file-utils";
import { storeFileHash } from "@/services/web3Service";

interface DocumentCardProps {
  ipfsHash: string;
  name: string;
  size: number;
  createdAt: string;
  onBlockchain?: boolean;
  isEncrypted?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  ipfsHash,
  name,
  size,
  createdAt,
  onBlockchain = false,
  isEncrypted = false
}) => {
  const fileType = getFileType(name);
  const [isStoring, setIsStoring] = React.useState(false);
  
  const renderIcon = () => {
    if (isEncrypted) {
      return <Lock className="h-10 w-10 text-purple-500" />;
    }
    
    switch (fileType) {
      case "document":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "image":
        return <Image className="h-10 w-10 text-green-500" />;
      case "video":
        return <Video className="h-10 w-10 text-red-500" />;
      case "audio":
        return <Music className="h-10 w-10 text-purple-500" />;
      case "archive":
        return <Archive className="h-10 w-10 text-yellow-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

  const handleStoreOnBlockchain = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsStoring(true);
    try {
      await storeFileHash(ipfsHash);
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start space-x-3">
          {renderIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg truncate" title={name}>
                {name}
                {isEncrypted && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full px-2 py-0.5 inline-flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </span>
                )}
              </h3>
              {onBlockchain && (
                <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full px-2 py-0.5 text-xs font-medium flex items-center ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatFileSize(size)}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-t divide-x">
        <Link
          to={`/documents/${ipfsHash}`}
          className="flex-1 p-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          View Details
        </Link>
        {isEncrypted ? (
          <Link
            to={`/documents/${ipfsHash}`}
            className="flex-1 p-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
          >
            <Lock className="h-3.5 w-3.5 mr-1" />
            Decrypt File
          </Link>
        ) : (
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 p-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
          >
            Open File
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        )}
      </div>
      
      {!onBlockchain && (
        <div className="border-t p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center"
            onClick={handleStoreOnBlockchain}
            disabled={isStoring}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isStoring ? "Storing..." : "Store on Blockchain"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
