
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { savePinataCredentials, isPinataConfigured } from "@/services/pinataService";

interface PinataConfigFormProps {
  onConfigured?: () => void;
}

const PinataConfigForm: React.FC<PinataConfigFormProps> = ({ onConfigured }) => {
  const [apiKey, setApiKey] = useState("");
  const [secretApiKey, setSecretApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isPinataConfigured());
    
    // Pre-fill with localStorage values if available
    const storedApiKey = localStorage.getItem('PINATA_API_KEY');
    const storedSecretKey = localStorage.getItem('PINATA_SECRET_API_KEY');
    
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedSecretKey) setSecretApiKey(storedSecretKey);
  }, []);

  const handleSave = () => {
    if (!apiKey || !secretApiKey) return;
    
    savePinataCredentials(apiKey, secretApiKey);
    setIsConfigured(true);
    
    if (onConfigured) {
      onConfigured();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pinata IPFS Configuration</CardTitle>
        <CardDescription>
          Enter your Pinata API credentials to enable file storage on IPFS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Pinata is configured and ready to use!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input 
            id="apiKey" 
            placeholder="Enter your Pinata API Key" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="secretApiKey">Secret API Key</Label>
          <Input 
            id="secretApiKey" 
            type="password"
            placeholder="Enter your Pinata Secret API Key" 
            value={secretApiKey} 
            onChange={(e) => setSecretApiKey(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!apiKey || !secretApiKey}>
          {isConfigured ? "Update Credentials" : "Save Credentials"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PinataConfigForm;
