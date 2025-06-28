import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { fileUploadService, FileUploadResult } from '../../utils/fileUpload';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesUploaded: (files: FileUploadResult[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ['image/*', '.pdf'],
  multiple = true,
  className = '',
  title = 'Upload Files',
  description = 'Drag and drop files here or click to browse'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check file limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadResults = await fileUploadService.uploadMultipleFiles(fileArray);
      const newFiles = [...uploadedFiles, ...uploadResults];
      
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
      
      toast.success(`${uploadResults.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary-light'
            : 'border-neutral-border hover:border-primary'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-text-muted">Uploading files...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-text-muted" />
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <p className="text-text-muted">{description}</p>
            <p className="text-xs text-text-muted">
              Supported formats: {acceptedTypes.join(', ')} • Max {maxFiles} files • Max 5MB each
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-text">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral rounded-lg border border-neutral-border"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-text text-sm">{file.name}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-success" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-error hover:text-error/80 p-1"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Limits Info */}
      <div className="bg-info-bg border border-info rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle size={16} className="text-info mt-0.5" />
          <div className="text-sm text-info">
            <p className="font-medium">Upload Guidelines:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Maximum {maxFiles} files per upload</li>
              <li>• Each file must be under 5MB</li>
              <li>• Supported formats: Images (JPG, PNG, GIF, WebP) and PDF</li>
              <li>• Files are processed immediately after upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};