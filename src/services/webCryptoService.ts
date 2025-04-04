
/**
 * Web Crypto API based encryption/decryption service
 * More secure than CryptoJS as it uses the browser's built-in cryptographic capabilities
 */

/**
 * Encrypts a message using AES-256-CBC with a random IV
 * @param message - The message to encrypt
 * @param key - The secret key (will be hashed to create a proper key)
 * @returns An object containing the encrypted data and IV, both as base64 strings
 */
export async function encryptMessage(message: string, key: string): Promise<{
  encryptedData: string;
  iv: string;
}> {
  // Convert the message to Uint8Array
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Derive a key from the password
  const keyMaterial = await getKeyMaterial(key);
  const cryptoKey = await deriveKey(keyMaterial);
  
  // Encrypt the message
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv
    },
    cryptoKey,
    messageData
  );
  
  // Convert the encrypted data and IV to base64 strings for storage/transmission
  const encryptedData = bufferToBase64(encryptedBuffer);
  const ivString = bufferToBase64(iv);
  
  return {
    encryptedData,
    iv: ivString
  };
}

/**
 * Decrypts a message encrypted with AES-256-CBC
 * @param encryptedData - The encrypted data as a base64 string
 * @param iv - The IV used for encryption as a base64 string
 * @param key - The secret key used for encryption
 * @returns The decrypted message as a string
 */
export async function decryptMessage(
  encryptedData: string,
  iv: string,
  key: string
): Promise<string> {
  // Convert base64 strings back to ArrayBuffers
  const encryptedBuffer = base64ToBuffer(encryptedData);
  const ivBuffer = base64ToBuffer(iv);
  
  // Derive the key from the password
  const keyMaterial = await getKeyMaterial(key);
  const cryptoKey = await deriveKey(keyMaterial);
  
  try {
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBuffer
      },
      cryptoKey,
      encryptedBuffer
    );
    
    // Convert the decrypted data back to a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed. Invalid key or corrupted data.");
  }
}

/**
 * Utility function to convert an ArrayBuffer to a base64 string
 */
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Utility function to convert a base64 string to an ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Creates key material from a password
 */
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

/**
 * Derives an AES-256 key from key material
 */
async function deriveKey(keyMaterial: CryptoKey): Promise<CryptoKey> {
  // Use SHA-256 as the hash algorithm for PBKDF2
  // Using a constant salt here - in a real application, you'd want to store
  // a unique salt per encryption
  const salt = new TextEncoder().encode("AES-CBC-Encryption-Salt");
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-CBC", length: 256 },
    false, // extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Example of encrypting a file using AES-256-CBC
 * @param fileData - The file data as ArrayBuffer
 * @param password - The secret key
 * @returns An object containing the encrypted data, IV, and additional metadata
 */
export async function encryptFile(fileData: ArrayBuffer, password: string): Promise<{
  encryptedData: string;
  iv: string;
}> {
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Derive a key from the password
  const keyMaterial = await getKeyMaterial(password);
  const cryptoKey = await deriveKey(keyMaterial);
  
  // Encrypt the file data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv
    },
    cryptoKey,
    fileData
  );
  
  // Convert the encrypted data and IV to base64 strings
  const encryptedData = bufferToBase64(encryptedBuffer);
  const ivString = bufferToBase64(iv);
  
  return {
    encryptedData,
    iv: ivString
  };
}

/**
 * Decrypts a file encrypted with AES-256-CBC
 * @param encryptedData - The encrypted data as a base64 string
 * @param iv - The IV used for encryption as a base64 string
 * @param password - The secret key used for encryption
 * @returns The decrypted file data as an ArrayBuffer
 */
export async function decryptFile(
  encryptedData: string,
  iv: string,
  password: string
): Promise<ArrayBuffer> {
  // Convert base64 strings back to ArrayBuffers
  const encryptedBuffer = base64ToBuffer(encryptedData);
  const ivBuffer = base64ToBuffer(iv);
  
  // Derive the key from the password
  const keyMaterial = await getKeyMaterial(password);
  const cryptoKey = await deriveKey(keyMaterial);
  
  try {
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBuffer
      },
      cryptoKey,
      encryptedBuffer
    );
    
    return decryptedBuffer;
  } catch (error) {
    console.error("File decryption failed:", error);
    throw new Error("Decryption failed. Invalid password or corrupted file.");
  }
}

/**
 * Utility function to validate if the decrypted data is a valid file
 * by checking for common file signatures
 */
export function isValidDecryptedFile(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  
  const header = new Uint8Array(data, 0, 8);
  
  // Check for common file signatures
  // PDF: %PDF (25 50 44 46)
  if (header[0] === 0x25 && header[1] === 0x50 && 
      header[2] === 0x44 && header[3] === 0x46) {
    return true;
  }
  
  // PNG: 89 50 4E 47
  if (header[0] === 0x89 && header[1] === 0x50 && 
      header[2] === 0x4E && header[3] === 0x47) {
    return true;
  }
  
  // JPEG: FF D8 FF
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
    return true;
  }
  
  // More file signatures can be added here
  
  // For text files or other formats without clear signatures,
  // we can do basic validation to ensure it's not random garbage
  // This is a simplified check - real validation would be more complex
  let textValidChars = 0;
  const testBytes = Math.min(100, data.byteLength);
  const testData = new Uint8Array(data, 0, testBytes);
  
  for (let i = 0; i < testBytes; i++) {
    // Check for ASCII printable range or common whitespace
    if ((testData[i] >= 32 && testData[i] <= 126) || 
        testData[i] === 9 || testData[i] === 10 || testData[i] === 13) {
      textValidChars++;
    }
  }
  
  // If over 90% of bytes are valid text characters, consider it valid
  if (textValidChars / testBytes > 0.9) {
    return true;
  }
  
  // For larger files, we'll accept them if they have enough non-zero data
  if (data.byteLength > 1000) {
    let nonZeroBytes = 0;
    const sampleBytes = new Uint8Array(data, 0, 1000);
    
    for (let i = 0; i < 1000; i++) {
      if (sampleBytes[i] !== 0) nonZeroBytes++;
    }
    
    // If at least 10% of the sample has non-zero bytes, consider it valid
    if (nonZeroBytes > 100) return true;
  }
  
  return false;
}

/**
 * Sample function demonstrating the usage of the encryption utilities
 */
export async function demonstrateEncryption(): Promise<void> {
  try {
    const message = "This is a secret message to be encrypted";
    const password = "mySecretPassword123";
    
    console.log("Original message:", message);
    
    // Encrypt the message
    const { encryptedData, iv } = await encryptMessage(message, password);
    console.log("Encrypted data:", encryptedData);
    console.log("IV:", iv);
    
    // Decrypt the message
    const decryptedMessage = await decryptMessage(encryptedData, iv, password);
    console.log("Decrypted message:", decryptedMessage);
    
    // Test with wrong password
    try {
      const wrongDecryption = await decryptMessage(encryptedData, iv, "wrongPassword");
      console.log("Decrypted with wrong password (should not reach here):", wrongDecryption);
    } catch (error) {
      console.log("Error decrypting with wrong password (expected):", error);
    }
  } catch (error) {
    console.error("Encryption demonstration failed:", error);
  }
}
