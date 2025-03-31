
import React, { useState, useEffect } from "react";
import { Shield, Database, FileText, LockIcon, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/FileDropZone";
import PinataConfigForm from "@/components/PinataConfigForm";
import WalletConnect from "@/components/WalletConnect";
import { useNavigate } from "react-router-dom";
import { isPinataConfigured } from "@/services/pinataService";
import { toast } from "sonner";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    checkPinataConfig();
  }, []);

  const checkPinataConfig = () => {
    setIsConfigured(isPinataConfigured());
  };

  const handleUploadComplete = (fileUrl: string, ipfsHash: string) => {
    toast.success("File uploaded successfully!");
    setTimeout(() => {
      navigate("/documents");
    }, 1500);
  };

  const handleConfigComplete = () => {
    setShowConfigForm(false);
    checkPinataConfig();
    toast.success("Pinata configured successfully! You can now upload files.");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <section className="py-10 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Secure Document Storage with IPFS &amp; Ethereum
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Store your important files securely on IPFS and verify ownership with Ethereum blockchain technology.
          </p>
          
          <div className="flex justify-center mb-8">
            <WalletConnect />
          </div>
          
          {showConfigForm ? (
            <div className="space-y-4">
              <PinataConfigForm onConfigured={handleConfigComplete} />
              <Button 
                variant="ghost" 
                onClick={() => setShowConfigForm(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {isConfigured ? (
                <FileDropZone onUploadComplete={handleUploadComplete} />
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl p-10 bg-card">
                  <h3 className="text-lg font-medium mb-4">Configure Pinata IPFS</h3>
                  <p className="text-muted-foreground mb-6">
                    To get started, you need to set up your Pinata API credentials
                  </p>
                  <Button onClick={() => setShowConfigForm(true)}>
                    Configure Pinata
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {!showConfigForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CloudUpload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Easy Upload</h3>
                <p className="text-muted-foreground">
                  Simply drag and drop your files to securely upload them to IPFS.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Blockchain Verification</h3>
                <p className="text-muted-foreground">
                  Store your file hashes on Ethereum for immutable proof of ownership.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Access Anywhere</h3>
                <p className="text-muted-foreground">
                  Access your files from anywhere using IPFS, verified by the blockchain.
                </p>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-10">
                  <h2 className="text-2xl font-bold mb-4">Ready for decentralized storage?</h2>
                  <p className="text-muted-foreground mb-6">
                    Store your files on IPFS and verify ownership with Ethereum blockchain technology.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => isConfigured ? null : setShowConfigForm(true)}>
                      {isConfigured ? "Upload Now" : "Configure Pinata"}
                    </Button>
                    <Button variant="outline" size="lg">Learn More</Button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Database className="h-32 w-32 text-primary/20" />
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
