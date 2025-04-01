
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
    
    // Convert WordArray to Uint8Array
    const bytes = decrypted.toString(CryptoJS.enc.Utf8);
    if (!bytes) {
      throw new Error("Decryption failed - incorrect password");
    }
    
    // For binary data, we need to parse the Latin1 string back to bytes
    const parseBase64 = (base64String: string) => {
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    };
    
    try {
      // Try to handle it as base64 encoded binary data
      return parseBase64(bytes);
    } catch (e) {
      // If not base64, create a text blob
      const textEncoder = new TextEncoder();
      return textEncoder.encode(bytes).buffer;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Incorrect password or corrupted file");
  }
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
