
import CryptoJS from 'crypto-js';

/**
 * Encrypts file data using AES-256 encryption
 * @param fileData - The file data as ArrayBuffer
 * @param password - User-provided password for encryption
 * @returns Object containing encrypted data and key information
 */
export async function encryptFile(fileData: ArrayBuffer, password: string): Promise<{
  encryptedData: string;
  salt: string;
}> {
  // Generate a random salt
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  
  // Convert ArrayBuffer to WordArray
  const wordArray = CryptoJS.lib.WordArray.create(
    // @ts-ignore - CryptoJS types don't match perfectly with TypeScript's ArrayBuffer
    new Uint8Array(fileData)
  );
  
  // Encrypt the file data with the password and salt
  const encryptedData = CryptoJS.AES.encrypt(
    wordArray,
    password + salt
  ).toString();
  
  return {
    encryptedData,
    salt
  };
}

/**
 * Decrypts file data using AES-256 encryption
 * @param encryptedData - The encrypted file data
 * @param password - User-provided password for decryption
 * @param salt - The salt used during encryption
 * @returns ArrayBuffer of decrypted file data
 */
export async function decryptFile(
  encryptedData: string,
  password: string,
  salt: string
): Promise<ArrayBuffer> {
  try {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      password + salt
    );
    
    // Convert to bytes
    const typedArray = convertWordArrayToUint8Array(decrypted);
    
    // Return as ArrayBuffer for download
    return typedArray.buffer;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Incorrect password or corrupted file");
  }
}

/**
 * Convert CryptoJS WordArray to Uint8Array
 * This helps properly handle binary data
 */
function convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const result = new Uint8Array(sigBytes);
  
  let i = 0;
  let offset = 0;
  
  // Correctly process each word (32 bits = 4 bytes)
  while (i < sigBytes) {
    // Get the current word
    const currentWord = words[offset++];
    
    // Process each byte in the word
    if (i < sigBytes) result[i++] = (currentWord >> 24) & 0xff;
    if (i < sigBytes) result[i++] = (currentWord >> 16) & 0xff;
    if (i < sigBytes) result[i++] = (currentWord >> 8) & 0xff;
    if (i < sigBytes) result[i++] = currentWord & 0xff;
  }
  
  return result;
}

/**
 * Generate a secure random password for file encryption
 */
export function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let result = '';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

/**
 * Get appropriate MIME type for a file based on its extension
 */
export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'html': 'text/html',
    'htm': 'text/html',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'json': 'application/json',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
  };
  
  return extension && extension in mimeTypes ? mimeTypes[extension] : 'application/octet-stream';
}
