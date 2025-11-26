import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const FileUpload = ({ onFileSelect, selectedFile, onClear }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFile(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    onClear();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center
            transition-all duration-300 backdrop-blur-sm
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-105"
                : "border-muted bg-card/50 hover:border-primary/50 hover:bg-card/70"
            }
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium mb-2">
              Drop satellite image here or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: PNG, JPG, TIFF formats
            </p>
          </label>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden backdrop-blur-sm bg-card/50 border border-border p-4">
          <Button
            onClick={handleClear}
            size="icon"
            variant="destructive"
            className="absolute top-6 right-6 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
          {previewUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain bg-muted"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
