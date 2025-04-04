
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
 * Decrypts file data using AES-256 encryption with improved validation
 * @param encryptedData - The encrypted file data
 * @param password - User-provided password for decryption
 * @param salt - The salt used during encryption
 * @returns ArrayBuffer of decrypted file data or throws an error
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
    
    // If decryption fails, CryptoJS often returns an empty WordArray
    if (decrypted.sigBytes <= 0) {
      throw new Error("Decryption failed: Invalid password");
    }
    
    // Convert to bytes
    const typedArray = convertWordArrayToUint8Array(decrypted);
    
    // Additional validation - check for magic numbers or file signatures
    // This helps verify we actually got a valid file and not garbage data
    if (!isValidDecryptedData(typedArray)) {
      throw new Error("Decryption produced invalid data. Incorrect password.");
    }
    
    // Return as ArrayBuffer for download
    return typedArray.buffer;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(error instanceof Error ? error.message : "Incorrect password or corrupted file");
  }
}

/**
 * Validates decrypted data by checking for common file signatures/magic numbers
 */
function isValidDecryptedData(data: Uint8Array): boolean {
  if (data.length < 4) return false;
  
  // Check for common file signatures (magic numbers)
  // PDF: %PDF (25 50 44 46)
  if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) {
    return true;
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
    return true;
  }
  
  // JPEG: FF D8 FF
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
    return true;
  }
  
  // GIF: GIF87a or GIF89a
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && 
      (data[3] === 0x38 && (data[4] === 0x37 || data[4] === 0x39) && data[5] === 0x61)) {
    return true;
  }
  
  // ZIP: PK (50 4B 03 04)
  if (data[0] === 0x50 && data[1] === 0x4B && 
      (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) && 
      (data[3] === 0x04 || data[3] === 0x06 || data[3] === 0x08)) {
    return true;
  }
  
  // For Office documents and other types
  if (data[0] === 0xD0 && data[1] === 0xCF && data[2] === 0x11 && data[3] === 0xE0) {
    return true; // Microsoft Office old format
  }
  
  if (data[0] === 0x50 && data[1] === 0x4B && data[2] === 0x03 && data[3] === 0x04) {
    return true; // Office Open XML and other zip-based formats
  }
  
  // Text-based files - check for ASCII/UTF-8 text
  // For text-based content like JSON, HTML, TXT, etc.
  // Count valid ASCII characters in the first 100 bytes
  const sampleSize = Math.min(100, data.length);
  let validChars = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    // ASCII printable range or common whitespace
    if ((data[i] >= 32 && data[i] <= 126) || 
        data[i] === 9 || data[i] === 10 || data[i] === 13) {
      validChars++;
    }
  }
  
  // If over 90% of initial bytes are valid ASCII, consider it likely valid text
  if (validChars / sampleSize > 0.9) {
    return true;
  }
  
  // If we can't identify the file type but it has enough data, we'll accept it
  // This is a fallback that might allow some false positives but prevents rejecting
  // uncommon but valid file types
  if (data.length > 1000) {
    // Try to detect all zeroes or repeating patterns that would indicate invalid data
    let repeatingPattern = true;
    const pattern = data.slice(0, 8);
    
    // Check if first 1000 bytes are just repeating the same pattern
    for (let i = 8; i < 1000 && i < data.length; i += 8) {
      for (let j = 0; j < 8 && i + j < data.length; j++) {
        if (data[i + j] !== pattern[j]) {
          repeatingPattern = false;
          break;
        }
      }
      if (!repeatingPattern) break;
    }
    
    // If it's not just a repeating pattern, it's probably valid data
    return !repeatingPattern;
  }
  
  return false;
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
