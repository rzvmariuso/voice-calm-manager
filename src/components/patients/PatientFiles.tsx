import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Download, X, Image, File, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePractice } from "@/hooks/usePractice";
import { cn } from "@/lib/utils";

interface PatientFile {
  id: string;
  patient_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  uploaded_by?: string;
  description?: string;
}

interface PatientFilesProps {
  patientId: string;
  patientName: string;
  className?: string;
}

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  return File;
};

const isImageFile = (fileType: string) => fileType.startsWith('image/');

export function PatientFiles({ patientId, patientName, className }: PatientFilesProps) {
  const { toast } = useToast();
  const { practice } = usePractice();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadFiles();
  }, [patientId]);

  const loadFiles = async () => {
    if (!practice?.id) return;

    try {
      // List files from storage
      const folderPath = `${practice.id}/patients/${patientId}`;
      const { data: fileList, error } = await supabase.storage
        .from('patient-files')
        .list(folderPath);

      if (error) throw error;

      // Map files with metadata
      const filesWithMetadata = (fileList || []).map(file => ({
        id: file.name,
        patient_id: patientId,
        file_name: file.name,
        file_type: file.metadata?.mimetype || 'application/octet-stream',
        file_size: file.metadata?.size || 0,
        file_path: `${folderPath}/${file.name}`,
        uploaded_at: file.created_at || file.updated_at || new Date().toISOString()
      }));

      setFiles(filesWithMetadata);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Fehler",
        description: "Dateien konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !practice?.id) return;

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Dateien dürfen maximal 20MB groß sein",
        variant: "destructive",
      });
      return;
    }

    // Check file type - allow more types including PDF, CSV, Excel
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Documents
      'application/pdf',
      'text/plain', 'text/csv',
      // Microsoft Office
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Dateityp nicht unterstützt",
        description: "Nur Bilder, PDFs, CSV, Excel und Word-Dokumente sind erlaubt",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const filePath = `${practice.id}/patients/${patientId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file, {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            patientId: patientId,
            practiceId: practice.id
          }
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Datei hochgeladen",
        description: `${file.name} wurde erfolgreich hochgeladen`,
      });

      loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload-Fehler",
        description: "Die Datei konnte nicht hochgeladen werden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadFile = async (file: PatientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('patient-files')
        .createSignedUrl(file.file_path, 60); // 1 minute expiry

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Could not generate download URL');

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download gestartet",
        description: `${file.file_name} wird heruntergeladen`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download-Fehler",
        description: "Die Datei konnte nicht heruntergeladen werden",
        variant: "destructive",
      });
    }
  };

  const previewFile = async (file: PatientFile) => {
    if (!isImageFile(file.file_type) && file.file_type !== 'application/pdf') return;

    try {
      const { data, error } = await supabase.storage
        .from('patient-files')
        .createSignedUrl(file.file_path, 60); // 1 minute expiry

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Could not generate preview URL');

      // Open in new window/tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error previewing file:', error);
      toast({
        title: "Vorschau-Fehler",
        description: "Die Datei konnte nicht in der Vorschau angezeigt werden",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (file: PatientFile) => {
    try {
      const { error } = await supabase.storage
        .from('patient-files')
        .remove([file.file_path]);

      if (error) throw error;

      toast({
        title: "Datei gelöscht",
        description: `${file.file_name} wurde erfolgreich gelöscht`,
      });

      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Lösch-Fehler",
        description: "Die Datei konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Patientendateien
            </CardTitle>
            <CardDescription>
              Dateien zu {patientName} ({files.length} {files.length === 1 ? 'Datei' : 'Dateien'})
            </CardDescription>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="gap-2"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            Datei hochladen
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx"
        />

        {/* Upload Progress */}
        {uploading && (
          <Card className="border-dashed border-primary/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Wird hochgeladen...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files List */}
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Dateien hochgeladen</p>
            <p className="text-sm">Klicken Sie auf "Datei hochladen" um zu beginnen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.file_type);
              
              return (
                <Card key={file.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.file_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{format(new Date(file.uploaded_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(isImageFile(file.file_type) || file.file_type === 'application/pdf') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewFile(file)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}