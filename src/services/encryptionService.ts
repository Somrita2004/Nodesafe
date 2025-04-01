
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
  
  let offset = 0;
  for (let i = 0; i < sigBytes; i += 4) {
    const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    result[offset++] = byte1;
    
    if (offset < sigBytes) {
      const byte2 = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xff;
      result[offset++] = byte2;
    }
    
    if (offset < sigBytes) {
      const byte3 = (words[i >>> 2] >>> (8 - (i % 4) * 8)) & 0xff;
      result[offset++] = byte3;
    }
    
    if (offset < sigBytes) {
      const byte4 = (words[i >>> 2] >>> (0 - (i % 4) * 8)) & 0xff;
      result[offset++] = byte4;
    }
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
