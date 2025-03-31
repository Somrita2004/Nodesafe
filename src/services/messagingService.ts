
import { Message, FileAttachment } from "@/models/message";
import CryptoJS from "crypto-js";

// Since we don't have a real backend, we'll simulate message storage with localStorage
const MESSAGES_STORAGE_KEY = 'NODESAFE_MESSAGES';

/**
 * Get all messages for the current user
 * @param userAddress - Ethereum address of the current user
 */
export function getUserMessages(userAddress: string): Message[] {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => 
    msg.recipient.toLowerCase() === userAddress.toLowerCase() || 
    msg.sender.toLowerCase() === userAddress.toLowerCase()
  );
}

/**
 * Get inbox messages (messages received by the user)
 * @param userAddress - Ethereum address of the current user
 */
export function getInboxMessages(userAddress: string): Message[] {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => 
    msg.recipient.toLowerCase() === userAddress.toLowerCase()
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get sent messages (messages sent by the user)
 * @param userAddress - Ethereum address of the current user
 */
export function getSentMessages(userAddress: string): Message[] {
  const allMessages = getAllMessages();
  return allMessages.filter(msg => 
    msg.sender.toLowerCase() === userAddress.toLowerCase()
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Send a new message
 * @param message - Message object to send
 */
export function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Message {
  const allMessages = getAllMessages();
  
  // Create a new message with ID and timestamp
  const newMessage: Message = {
    ...message,
    id: generateMessageId(),
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Save to storage
  allMessages.push(newMessage);
  saveMessages(allMessages);
  
  return newMessage;
}

/**
 * Mark a message as read
 * @param messageId - ID of the message to mark as read
 */
export function markMessageAsRead(messageId: string): void {
  const allMessages = getAllMessages();
  const messageIndex = allMessages.findIndex(msg => msg.id === messageId);
  
  if (messageIndex !== -1) {
    allMessages[messageIndex].read = true;
    saveMessages(allMessages);
  }
}

/**
 * Get a single message by ID
 * @param messageId - ID of the message to retrieve
 */
export function getMessageById(messageId: string): Message | undefined {
  const allMessages = getAllMessages();
  return allMessages.find(msg => msg.id === messageId);
}

/**
 * Delete a message by ID
 * @param messageId - ID of the message to delete
 */
export function deleteMessage(messageId: string): void {
  const allMessages = getAllMessages();
  const updatedMessages = allMessages.filter(msg => msg.id !== messageId);
  saveMessages(updatedMessages);
}

/**
 * Encrypt message content for end-to-end encryption
 * @param content - Message content to encrypt
 * @param recipientPublicKey - Recipient's public key
 */
export function encryptMessageContent(content: string, recipientAddress: string): string {
  // In a real E2E system, we would use asymmetric encryption
  // For this demo, we'll use a simple symmetric encryption with the recipient's address as the key
  return CryptoJS.AES.encrypt(content, recipientAddress).toString();
}

/**
 * Decrypt message content
 * @param encryptedContent - Encrypted message content
 * @param userAddress - User's address (used as decryption key in this simple implementation)
 */
export function decryptMessageContent(encryptedContent: string, userAddress: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, userAddress);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    return "[Encrypted message - cannot decrypt]";
  }
}

// Helper functions
function getAllMessages(): Message[] {
  const messagesJson = localStorage.getItem(MESSAGES_STORAGE_KEY);
  return messagesJson ? JSON.parse(messagesJson) : [];
}

function saveMessages(messages: Message[]): void {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
