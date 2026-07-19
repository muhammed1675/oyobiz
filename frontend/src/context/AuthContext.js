import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase, safeSignIn, safeSignUp, safeSignInWithOtp, safeSignInWithGoogle } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) return null;
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  const createProfile = useCallback(async (userId, email, fullName = '', role = 'user') => {
    if (!userId) return null;
    
    try {
      // First check if profile already exists (might have been created during signup with correct role)
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // If profile exists, return it without overwriting - IMPORTANT: preserve the role set during signup
      if (existingProfile) {
        console.log('Profile already exists with role:', existingProfile.role);
        return existingProfile;
      }
      
      // Only create new profile if one doesn't exist
      // This is for users signing in without going through signup (e.g., OAuth)
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          role: role
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.log('Profile creation error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.log('Profile creation exception:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let ignore = false;
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (ignore || !mountedRef.current) return;
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (!ignore && mountedRef.current) {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        // Silently ignore
      } finally {
        if (!ignore && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (ignore || !mountedRef.current) return;
        
        if (session?.user) {
          setUser(session.user);
          
          setTimeout(async () => {
            if (ignore || !mountedRef.current) return;
            
            let userProfile = await fetchProfile(session.user.id);
            
            if (!userProfile && event === 'SIGNED_IN' && !ignore && mountedRef.current) {
              userProfile = await createProfile(
                session.user.id,
                session.user.email,
                session.user.user_metadata?.full_name || ''
              );
            }
            
            if (!ignore && mountedRef.current) {
              setProfile(userProfile);
              setLoading(false);
            }
          }, 100);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      ignore = true;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, createProfile]);

  const signUp = async (email, password, fullName) => {
    return await safeSignUp(email, password, fullName);
  };

  const signIn = async (email, password) => {
    return await safeSignIn(email, password);
  };

  const signInWithOtp = async (email) => {
    return await safeSignInWithOtp(email);
  };

  const signInWithGoogle = async () => {
    return await safeSignInWithGoogle();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore errors
    }
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();
      
      if (!error && data && mountedRef.current) {
        setProfile(data);
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: { message: 'Update failed' } };
    }
  };

  const refreshProfile = async () => {
    if (user && mountedRef.current) {
      const userProfile = await fetchProfile(user.id);
      if (mountedRef.current) {
        setProfile(userProfile);
      }
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithOtp,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
    isAdmin: profile?.role === 'admin',
    isOwner: profile?.role === 'owner' || profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
