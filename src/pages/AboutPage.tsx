
import React from "react";
import { Shield, Database, Globe, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-6">About NodeSafe</h1>
        <p className="text-xl text-muted-foreground">
          NodeSafe is a modern document storage application that leverages the power of IPFS (InterPlanetary File System) through Pinata to provide secure, decentralized file storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Database className="mr-3 h-6 w-6 text-primary" />
            What is IPFS?
          </h2>
          <p className="text-muted-foreground mb-4">
            IPFS (InterPlanetary File System) is a protocol designed to create a permanent and decentralized method of storing and sharing files. It uses content-addressing to uniquely identify each file in a global namespace.
          </p>
          <p className="text-muted-foreground mb-4">
            Unlike HTTP, which is location-based, IPFS addresses content based on what it is, not where it is. This means that when you upload a file to IPFS, you receive a unique content identifier (CID) that can be used to retrieve the file from any IPFS node that has it.
          </p>
          <p className="text-muted-foreground">
            This approach creates a more resilient and efficient web, where files can't be censored or lost due to server failures, and where popular content can be retrieved faster because it may be available from multiple locations.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Globe className="mr-3 h-6 w-6 text-primary" />
            Why Use NodeSafe?
          </h2>
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">Decentralized Storage</h3>
              <p className="text-muted-foreground">
                Your files are stored across a distributed network, not on a single server, making them more resilient to failures.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">Content-Addressed</h3>
              <p className="text-muted-foreground">
                Files are identified by their content, not location, ensuring integrity and preventing tampering.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">Permanent Links</h3>
              <p className="text-muted-foreground">
                Once a file is uploaded, its IPFS link will always point to the same content, making it perfect for long-term storage.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">Easy Sharing</h3>
              <p className="text-muted-foreground">
                Share files with anyone by simply sharing the IPFS link, which can be accessed through any IPFS gateway.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to try NodeSafe?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Start uploading your documents to IPFS today and experience the benefits of decentralized storage. NodeSafe makes it easy to store, manage, and share your important files with confidence.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" asChild>
            <a href="/">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" className="flex items-center">
            <Code className="mr-2 h-4 w-4" />
            View on GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
