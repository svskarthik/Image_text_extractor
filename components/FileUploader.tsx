import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { FileData } from '../types';

interface FileUploaderProps {
  onFileSelect: (fileData: FileData | null) => void;
  selectedFile: FileData | null;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size too large. Maximum size is 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect({ file, previewUrl });
  }, [onFileSelect]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200",
            isDragging ? "border-aws-blue bg-blue-50" : "border-gray-300 hover:border-aws-orange hover:bg-gray-50",
            disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-gray-300"
          )}
        >
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Upload className="w-8 h-8 text-aws-blue" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Document</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Drag and drop an image, or click to browse
            <br />
            <span className="text-xs text-gray-400">Supports JPG, PNG, WEBP up to 10MB</span>
          </p>
        </div>
      ) : (
        <div className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex items-center">
          <div className="h-20 w-20 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-100">
             <img src={selectedFile.previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="ml-4 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
              {selectedFile.file.name}
            </h4>
            <p className="text-xs text-gray-500">
              {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-3 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <input
        type="file"
        ref={inputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        accept="image/*"
        disabled={disabled}
      />
    </div>
  );
};