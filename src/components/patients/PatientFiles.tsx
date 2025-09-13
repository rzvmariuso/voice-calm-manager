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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadFiles();
  }, [patientId]);

  const loadFiles = async () => {
    try {
      // Since patient_files table doesn't exist yet, we'll use a placeholder
      // const { data, error } = await supabase
      //   .from('patient_files')
      //   .select('*')
      //   .eq('patient_id', patientId)
      //   .order('uploaded_at', { ascending: false });

      // if (error) throw error;
      setFiles([]);
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
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Dateien dürfen maximal 10MB groß sein",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Dateityp nicht unterstützt",
        description: "Nur Bilder, PDFs und Textdateien sind erlaubt",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `patient-files/${patientId}/${fileName}`;

      // File uploads disabled since storage isn't configured yet
      throw new Error("File upload functionality is not yet available");

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
      // File downloads disabled since storage isn't configured yet
      throw new Error("File download functionality is not yet available");
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
    if (!isImageFile(file.file_type)) return;

    try {
      // File preview disabled since storage isn't configured yet
      throw new Error("File preview functionality is not yet available");
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
      // File deletion disabled since storage isn't configured yet
      throw new Error("File deletion functionality is not yet available");

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
          accept="image/*,.pdf,.doc,.docx,.txt"
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
                        {isImageFile(file.file_type) && (
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