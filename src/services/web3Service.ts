
import { ethers } from "ethers";
import { toast } from "sonner";

// ABI of the deployed contract
const contractABI = [
  "function storeFile(string memory ipfsHash) public",
  "function getUserFiles() public view returns (string[] memory)",
  "function fileExists(string memory ipfsHash) public view returns (bool)"
];

// Contract address - this should be updated after deployment to testnet
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with actual contract address

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

/**
 * Initialize connection to the blockchain
 */
export async function connectWallet(): Promise<string | null> {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      toast.error("Please install MetaMask to use blockchain features");
      return null;
    }

    // Initialize provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
      toast.error("No accounts found. Please unlock MetaMask");
      return null;
    }
    
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Initialize contract
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    toast.success("Wallet connected successfully");
    return address;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    toast.error("Failed to connect wallet");
    return null;
  }
}

/**
 * Store IPFS hash in the blockchain
 */
export async function storeFileHash(ipfsHash: string): Promise<boolean> {
  try {
    if (!contract || !signer) {
      const connected = await connectWallet();
      if (!connected) return false;
    }

    const tx = await contract!.storeFile(ipfsHash);
    await tx.wait();
    
    toast.success("File hash stored on blockchain");
    return true;
  } catch (error) {
    console.error("Error storing file hash:", error);
    toast.error("Failed to store file hash on blockchain");
    return false;
  }
}

/**
 * Get all IPFS hashes for the connected wallet
 */
export async function getUserFileHashes(): Promise<string[]> {
  try {
    if (!contract || !signer) {
      const connected = await connectWallet();
      if (!connected) return [];
    }

    const hashes = await contract!.getUserFiles();
    return hashes;
  } catch (error) {
    console.error("Error fetching user file hashes:", error);
    toast.error("Failed to fetch your files from blockchain");
    return [];
  }
}

/**
 * Check if a file hash exists in the blockchain
 */
export async function checkFileExists(ipfsHash: string): Promise<boolean> {
  try {
    if (!contract || !signer) {
      const connected = await connectWallet();
      if (!connected) return false;
    }

    return await contract!.fileExists(ipfsHash);
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
