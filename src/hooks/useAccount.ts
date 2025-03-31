
import { useState, useEffect } from 'react';

/**
 * Custom hook for getting the connected wallet address
 */
export function useAccount() {
  const [address, setAddress] = useState<string | null>(null);
  
  useEffect(() => {
    // Check localStorage for connected wallet address
    const storedAddress = localStorage.getItem('CONNECTED_ADDRESS');
    if (storedAddress) {
      setAddress(storedAddress);
    }
    
    // Listen for account changes from WalletConnect component
    const handleAccountChange = (event: CustomEvent) => {
      setAddress(event.detail.address);
    };
    
    window.addEventListener('walletConnected' as any, handleAccountChange);
    
    return () => {
      window.removeEventListener('walletConnected' as any, handleAccountChange);
    };
  }, []);
  
  return { address };
}
