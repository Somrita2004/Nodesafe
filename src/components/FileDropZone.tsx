
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/file-utils";
import { uploadFileToPinata } from "@/services/pinataService";
import { toast } from "sonner";

interface FileDropZoneProps {
  onUploadComplete?: (fileUrl: string) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);

    try {
      const fileUrl = await uploadFileToPinata(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (fileUrl) {
        toast.success("File uploaded successfully!");
        if (onUploadComplete) {
          onUploadComplete(fileUrl);
        }
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error(error);
    } finally {
      setUploading(false);
      // Reset after a delay
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
      }, 2000);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`file-drop-area ${
            isDragActive ? "drag-active" : "border-muted-foreground/20"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            className={`w-12 h-12 mb-4 ${
              isDragActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <p className="text-lg font-medium mb-1">
            {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <Button variant="outline" size="sm">
            Select File
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-5 bg-card fadeInUp">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <File className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="font-medium text-sm truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100
                  ? "Uploading to IPFS..."
                  : "Upload complete!"}
              </p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full">
              Upload to IPFS
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
