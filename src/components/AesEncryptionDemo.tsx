
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Key, ArrowRight, Copy, CheckCircle, RefreshCw } from "lucide-react";
import { encryptMessage, decryptMessage } from "@/services/webCryptoService";
import { toast } from "sonner";

const AesEncryptionDemo: React.FC = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [iv, setIv] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const generateRandomKey = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const randomKey = Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    setKey(randomKey);
  };
  
  const handleEncrypt = async () => {
    if (!message) {
      toast.error("Please enter a message to encrypt");
      return;
    }
    
    if (!key) {
      toast.error("Please enter a secret key or generate one");
      return;
    }
    
    setIsEncrypting(true);
    try {
      const result = await encryptMessage(message, key);
      setEncryptedData(result.encryptedData);
      setIv(result.iv);
      toast.success("Message encrypted successfully");
    } catch (error) {
      console.error("Encryption failed:", error);
      toast.error("Encryption failed");
    } finally {
      setIsEncrypting(false);
    }
  };
  
  const handleDecrypt = async () => {
    if (!encryptedData || !iv) {
      toast.error("Please encrypt a message first");
      return;
    }
    
    if (!key) {
      toast.error("Please enter the secret key");
      return;
    }
    
    setIsDecrypting(true);
    try {
      const result = await decryptMessage(encryptedData, iv, key);
      setDecryptedMessage(result);
      toast.success("Message decrypted successfully");
    } catch (error) {
      console.error("Decryption failed:", error);
      toast.error("Decryption failed. Invalid key or corrupted data.");
    } finally {
      setIsDecrypting(false);
    }
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard`);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          AES-256-CBC Encryption Demo
        </CardTitle>
        <CardDescription>
          Encrypt and decrypt messages using the Web Crypto API with AES-256 in CBC mode
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="message">Message to Encrypt</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={generateRandomKey}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Generate Key
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input
              id="secret-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter or generate a secret key"
              className="font-mono"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => copyToClipboard(key, "Key")}
              disabled={!key}
              size="icon"
            >
              {copied === "Key" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center py-4">
          <Button 
            onClick={handleEncrypt} 
            disabled={isEncrypting || !message || !key}
            className="gap-2"
          >
            {isEncrypting ? "Encrypting..." : (
              <>Encrypt <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
        
        {encryptedData && iv && (
          <>
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="encrypted-data">Encrypted Data</Label>
              <div className="flex space-x-2">
                <Textarea
                  id="encrypted-data"
                  value={encryptedData}
                  readOnly
                  className="font-mono text-xs h-20 resize-none"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => copyToClipboard(encryptedData, "Encrypted")}
                  size="icon"
                >
                  {copied === "Encrypted" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iv">Initialization Vector (IV)</Label>
              <div className="flex space-x-2">
                <Input
                  id="iv"
                  value={iv}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => copyToClipboard(iv, "IV")}
                  size="icon"
                >
                  {copied === "IV" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center py-4">
              <Button 
                onClick={handleDecrypt} 
                disabled={isDecrypting || !encryptedData || !iv || !key}
                variant="outline"
                className="gap-2"
              >
                {isDecrypting ? "Decrypting..." : (
                  <>Decrypt <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </>
        )}
        
        {decryptedMessage && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <AlertTitle className="flex items-center">
              <Key className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
              Decrypted Message
            </AlertTitle>
            <AlertDescription className="mt-2 font-medium">
              {decryptedMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground border-t pt-4">
        <p>
          This demo uses the Web Crypto API (AES-256-CBC) with a randomly generated IV.
          For secure communication, make sure to transmit the IV along with the encrypted data.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AesEncryptionDemo;
