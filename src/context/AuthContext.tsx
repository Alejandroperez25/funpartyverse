
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminChecked: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await checkIfUserIsAdmin(data.session.user.id);
        } else {
          setIsAdmin(false);
          setAdminChecked(true);
        }
      } catch (error: any) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkIfUserIsAdmin(currentSession.user.id);
        } else {
          setIsAdmin(false);
          setAdminChecked(true);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkIfUserIsAdmin = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      setAdminChecked(false);
      
      // First try with the profiles table approach
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!profileError && profileData && profileData.role === 'admin') {
        console.log('Direct check: User is admin via profiles');
        setIsAdmin(true);
        setAdminChecked(true);
        return; // User is admin, don't redirect
      }
      
      // Check user_roles table as fallback
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (!rolesError && rolesData && rolesData.length > 0) {
        console.log('Direct check: User is admin via user_roles');
        setIsAdmin(true);
        setAdminChecked(true);
        return; // User is admin, don't redirect
      }
      
      // If we reach here, user is not admin
      console.log('Direct check: User is NOT admin');
      setIsAdmin(false);
      setAdminChecked(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminChecked(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión con Google',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Registro exitoso',
        description: 'Revisa tu correo para confirmar tu cuenta',
      });
    } catch (error: any) {
      toast({
        title: 'Error al registrarse',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error al cerrar sesión',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    adminChecked,
    signIn,
    signInWithGoogle,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
