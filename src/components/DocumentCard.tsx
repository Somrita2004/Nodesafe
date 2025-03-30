
import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Image, 
  File, 
  Video, 
  Music, 
  Archive, 
  ExternalLink 
} from "lucide-react";
import { formatFileSize, formatDate, getFileType } from "@/lib/file-utils";

interface DocumentCardProps {
  ipfsHash: string;
  name: string;
  size: number;
  createdAt: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  ipfsHash,
  name,
  size,
  createdAt,
}) => {
  const fileType = getFileType(name);
  
  const renderIcon = () => {
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

  return (
    <div className="bg-card border rounded-lg overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start space-x-3">
          {renderIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate" title={name}>
              {name}
            </h3>
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
        <a
          href={ipfsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 p-2 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
        >
          Open File
          <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
