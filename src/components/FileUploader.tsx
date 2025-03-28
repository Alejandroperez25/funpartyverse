
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  bucketName: string;
  folderPath?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUploaded, 
  bucketName,
  folderPath = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setProgress(0);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      // Check if bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createBucketError) {
          throw new Error(`Error al crear el bucket: ${createBucketError.message}`);
        }
      }
      
      // Track upload progress manually
      const uploadFile = async () => {
        const { error: uploadError, data } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Error al subir el archivo: ${uploadError.message}`);
        }
        
        return data;
      };
      
      // Simple progress simulation - in a real app you might want to use XHR for actual progress
      const updateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 5;
          setProgress(Math.min(currentProgress, 95)); // Cap at 95% until complete
          if (currentProgress >= 95) clearInterval(interval);
        }, 100);
        return interval;
      };
      
      const progressInterval = updateProgress();
      const uploadData = await uploadFile();
      clearInterval(progressInterval);
      setProgress(100);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      onFileUploaded(publicUrl);
      toast({
        title: 'Archivo subido',
        description: 'El archivo ha sido subido correctamente.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {uploading && (
          <div className="text-sm">{progress}%</div>
        )}
      </div>
      
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-funneepurple h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
