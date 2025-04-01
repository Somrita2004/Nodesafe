
import React from "react";
import DocumentCard from "./DocumentCard";

interface DocumentGridProps {
  documents: Array<{
    ipfsHash: string;
    name: string;
    size: number;
    createdAt: string;
    onBlockchain?: boolean;
    isEncrypted?: boolean;
  }>;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ documents }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No documents found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.ipfsHash}
          ipfsHash={doc.ipfsHash}
          name={doc.name}
          size={doc.size}
          createdAt={doc.createdAt}
          onBlockchain={doc.onBlockchain}
          isEncrypted={doc.isEncrypted}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;
