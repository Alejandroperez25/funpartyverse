
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInitializeStorage = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    const checkAndInitializeStorage = async () => {
      try {
        setLoading(true);
        
        // Check if bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking buckets:', error);
          return;
        }
        
        if (!buckets.some(bucket => bucket.name === 'almacenamiento')) {
          console.log('Storage bucket not found, creating...');
          // Invoke the function to create it
          const { error: functionError } = await supabase.functions.invoke('create-image-bucket');
          
          if (functionError) {
            throw functionError;
          }
          
          // Show toast, but only once per session
          if (!toastShown) {
            toast({
              title: 'Almacenamiento inicializado',
              description: 'El sistema de almacenamiento ha sido configurado correctamente.',
            });
            setToastShown(true);
          }
        } else {
          console.log('Storage bucket already exists');
        }
        
        setInitialized(true);
      } catch (error: any) {
        console.error('Failed to initialize storage:', error);
        if (!toastShown) {
          toast({
            title: 'Error',
            description: 'No se pudo inicializar el almacenamiento: ' + error.message,
            variant: 'destructive',
          });
          setToastShown(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAndInitializeStorage();
  }, [toastShown]);

  return { initialized, loading };
};
