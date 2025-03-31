
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronRight } from "lucide-react";
import { connectWallet } from "@/services/web3Service";

const WalletConnect: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } finally {
      setConnecting(false);
    }
  };

  // Check if already connected
  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
          <Wallet className="h-4 w-4 mr-2" />
          {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {connecting ? "Connecting..." : "Connect Wallet"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default WalletConnect;
