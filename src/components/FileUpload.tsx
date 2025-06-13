import React, { useCallback, useState } from 'react';
import { Upload, File, X, Image, Code } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, files }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(fileList).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string,
          uploadedAt: new Date().toISOString()
        };
        
        newFiles.push(uploadedFile);
        if (newFiles.length === fileList.length) {
          onFilesChange([...files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.includes('text/') || type.includes('javascript') || type.includes('json')) return <Code className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-white/20 hover:border-white/40'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-white/10 rounded-full">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-gray-400 text-sm">
              All file types supported including programming files
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Choose Files
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white font-medium">Uploaded Files ({files.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};