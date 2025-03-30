
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInitializeStorage = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    let mounted = true;
    const storageInitialized = localStorage.getItem('storage_initialized');
    
    const checkAndInitializeStorage = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        
        // Check if bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('Error checking buckets:', error);
          if (mounted) setLoading(false);
          return;
        }
        
        if (!buckets.some(bucket => bucket.name === 'almacenamiento')) {
          console.log('Storage bucket not found, creating...');
          
          // Invoke the function to create it
          const { error: functionError } = await supabase.functions.invoke('create-image-bucket');
          
          if (functionError) {
            throw functionError;
          }
          
          // Store in localStorage that initialization has been done
          localStorage.setItem('storage_initialized', 'true');
          
          // Only show toast once per session and only on first initialization
          if (!toastShown && mounted) {
            // Silent toast - we don't need to disrupt the user experience
            console.log('Storage bucket created successfully');
            setToastShown(true);
          }
        } else {
          console.log('Storage bucket already exists');
          localStorage.setItem('storage_initialized', 'true');
        }
        
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Failed to initialize storage:', error);
        if (!toastShown && mounted) {
          toast({
            title: 'Error',
            description: 'No se pudo inicializar el almacenamiento: ' + error.message,
            variant: 'destructive',
          });
          setToastShown(true);
        }
        if (mounted) setLoading(false);
      }
    };
    
    // If not initialized yet or no localStorage record, initialize
    if (!storageInitialized || !initialized) {
      checkAndInitializeStorage();
    } else {
      setInitialized(true);
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [toastShown, initialized]);

  return { initialized, loading };
};
