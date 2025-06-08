import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadFile extends File {
  preview?: string;
  progress?: number;
  error?: string;
}

interface DocumentUploadProps {
  caseId: number;
  folderId?: number;
  onUploadComplete?: () => void;
  onClose?: () => void;
}

export function DocumentUpload({ caseId, folderId, onUploadComplete, onClose }: DocumentUploadProps) {
  console.log('[DocumentUpload] [COMPONENT_MOUNT] [' + new Date().toISOString() + '] Component mounted for case:', caseId, 'folder:', folderId);
  
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('[DocumentUpload] [FILE_DROP] [' + new Date().toISOString() + '] Files dropped:', acceptedFiles.length, 'files');
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0
    }));
    console.log('[DocumentUpload] [FILE_DROP] [' + new Date().toISOString() + '] Processed files:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/cases/${caseId}/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('[DocumentUpload] [UPLOAD_SUCCESS] [' + new Date().toISOString() + '] Upload completed successfully:', data);
      toast({
        title: "Upload successful",
        description: data.message
      });
      
      // Invalidate and refetch documents
      console.log('[DocumentUpload] [CACHE_INVALIDATE] [' + new Date().toISOString() + '] Invalidating document cache for case:', caseId);
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'documents'] });
      
      // Clear form
      setFiles([]);
      setDescription('');
      setUploading(false);
      
      onUploadComplete?.();
    },
    onError: (error: Error) => {
      console.error('[DocumentUpload] [UPLOAD_ERROR] [' + new Date().toISOString() + '] Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      setUploading(false);
    }
  });

  const handleUpload = async () => {
    console.log('[DocumentUpload] [UPLOAD_START] [' + new Date().toISOString() + '] Starting upload process');
    if (files.length === 0) {
      console.log('[DocumentUpload] [UPLOAD_ERROR] [' + new Date().toISOString() + '] No files selected for upload');
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    console.log('[DocumentUpload] [UPLOAD_START] [' + new Date().toISOString() + '] Uploading', files.length, 'files to case:', caseId);
    setUploading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (description) {
      formData.append('description', description);
    }
    
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    console.log('[DocumentUpload] [UPLOAD_SUBMIT] [' + new Date().toISOString() + '] Submitting form data to server');
    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type === 'text/plain') return '📄';
    return '📁';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upload Documents</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <Label>Selected Files ({files.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {file.error}
                      </p>
                    )}
                  </div>
                  {file.progress !== undefined && file.progress > 0 && (
                    <div className="w-20">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for these documents..."
            disabled={uploading}
          />
        </div>

        {/* Upload Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}