
export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  read: boolean;
}

export interface FileAttachment {
  ipfsHash: string;
  name: string;
  size: number;
  salt?: string;
  isEncrypted: boolean;
}
