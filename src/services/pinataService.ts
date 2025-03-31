
import axios from "axios";
import { toast } from "sonner";

// Pinata API configuration
const getPinataAPIKey = () => localStorage.getItem('PINATA_API_KEY') || '';
const getPinataSecretAPIKey = () => localStorage.getItem('PINATA_SECRET_API_KEY') || '';

// API endpoints
const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_FILES_URL = "https://api.pinata.cloud/data/pinList";

// Gateway for IPFS content
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

interface PinataFile {
  ipfsHash: string;
  name: string;
  size: number;
  createdAt: string;
  onBlockchain?: boolean;
}

interface UploadResult {
  fileUrl: string;
  ipfsHash: string;
}

// Check if Pinata credentials are configured
export function isPinataConfigured(): boolean {
  const apiKey = getPinataAPIKey();
  const secretApiKey = getPinataSecretAPIKey();
  return !!apiKey && !!secretApiKey;
}

// Save Pinata credentials to localStorage
export function savePinataCredentials(apiKey: string, secretApiKey: string): void {
  localStorage.setItem('PINATA_API_KEY', apiKey);
  localStorage.setItem('PINATA_SECRET_API_KEY', secretApiKey);
  toast.success('Pinata credentials saved successfully!');
}

// Upload file to IPFS via Pinata
export async function uploadFileToPinata(file: File): Promise<UploadResult | null> {
  const formData = new FormData();
  formData.append("file", file);
  
  // Add file name metadata
  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

  try {
    if (!isPinataConfigured()) {
      toast.error("Pinata API credentials not configured");
      return null;
    }

    const apiKey = getPinataAPIKey();
    const secretApiKey = getPinataSecretAPIKey();

    if (!apiKey || !secretApiKey) {
      toast.error("Pinata API credentials are missing");
      return null;
    }

    const response = await axios.post<PinataResponse>(PINATA_UPLOAD_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretApiKey,
      },
    });

    const fileHash = response.data.IpfsHash;
    const fileUrl = `${IPFS_GATEWAY}${fileHash}`;
    
    // Update localStorage with the new file (for offline access)
    saveFileToLocalStorage({
      ipfsHash: fileHash,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString()
    });
    
    return { fileUrl, ipfsHash: fileHash };
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        toast.error("Authentication failed. Please check your Pinata API credentials.");
      } else {
        toast.error(`Failed to upload file to IPFS: ${error.response.data.error || 'Unknown error'}`);
      }
    } else {
      toast.error("Failed to upload file to IPFS. Network error.");
    }
    return null;
  }
}

// Save file info to localStorage for offline access
function saveFileToLocalStorage(file: PinataFile) {
  const existingFiles = getFilesFromLocalStorage();
  const updatedFiles = [file, ...existingFiles.filter(f => f.ipfsHash !== file.ipfsHash)];
  localStorage.setItem('PINATA_FILES', JSON.stringify(updatedFiles));
}

// Get files from localStorage
function getFilesFromLocalStorage(): PinataFile[] {
  const files = localStorage.getItem('PINATA_FILES');
  return files ? JSON.parse(files) : [];
}

// Get list of files from Pinata
export async function getFilesFromPinata(): Promise<PinataFile[]> {
  try {
    if (!isPinataConfigured()) {
      console.warn("Pinata API credentials not configured");
      return getFilesFromLocalStorage();
    }

    const apiKey = getPinataAPIKey();
    const secretApiKey = getPinataSecretAPIKey();

    const response = await axios.get(PINATA_FILES_URL, {
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretApiKey,
      },
    });

    const files = response.data.rows.map((row: any) => ({
      ipfsHash: row.ipfs_pin_hash,
      name: row.metadata?.name || "Unnamed File",
      size: row.size,
      createdAt: row.date_pinned,
      onBlockchain: false // Default to false, will be verified later
    }));

    // Update localStorage cache
    localStorage.setItem('PINATA_FILES', JSON.stringify(files));
    
    return files;
  } catch (error) {
    console.error("Error fetching files from Pinata:", error);
    toast.error("Failed to fetch files from IPFS. Using local cache.");
    
    // Return files from localStorage as a fallback
    return getFilesFromLocalStorage();
  }
}

// Get direct access URL for an IPFS hash
export function getIpfsUrl(ipfsHash: string): string {
  return `${IPFS_GATEWAY}${ipfsHash}`;
}

// Mock data for development without API keys
export const mockFiles: PinataFile[] = [
  {
    ipfsHash: "QmX5G6vBjoHAVsqxYW7hYTWsqYEQW6qgXXnj8ZbmxWvQW8",
    name: "Project Proposal.pdf",
    size: 2457862,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    ipfsHash: "QmYXsKhvmLc3sH1a8CDgWNMVTwcZ8ftXnWUxvu2xQQA3R3",
    name: "Financial Report Q2.xlsx",
    size: 1254698,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    ipfsHash: "QmZ2ThRZqBWh8VKgThxQUQ7Fzrd5VX8Jx5ZA4ZqxLnGLEb",
    name: "Client Meeting Notes.docx",
    size: 543289,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    ipfsHash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB",
    name: "Product Roadmap.png",
    size: 3254123,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    ipfsHash: "QmSgvgwxZGMrjpySHrYZGYZ3JLxwvE4TEJ6u1Dpr5a2kKe",
    name: "Team Photo.jpg",
    size: 4125789,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];
