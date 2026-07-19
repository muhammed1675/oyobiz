import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'oyo-biz-auth',
    storage: window.localStorage,
    flowType: 'implicit'
  }
});

// Wrapper to handle the body stream error
const handleAuthError = (error, isSignUp = false) => {
  if (!error) return null;
  
  // Extract message from error
  let message = 'An error occurred';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error.message) {
    message = error.message;
  } else if (error.error_description) {
    message = error.error_description;
  } else if (error.status === 429) {
    message = 'Too many attempts. Please wait a minute and try again.';
  }
  
  // Handle specific errors
  if (message.includes('body stream') || message.includes("Failed to execute 'json'")) {
    message = isSignUp ? 'Signup failed. Please try again.' : 'Invalid email or password';
  } else if (message.includes('429') || message.includes('rate') || message.includes('Too many')) {
    message = 'Too many attempts. Please wait a minute and try again.';
  } else if (message.includes('User already registered')) {
    message = 'An account with this email already exists. Please login instead.';
  }
  
  return { message };
};

// Safe sign in with proper error handling
export const safeSignIn = async (email, password) => {
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (result.error) {
      return { 
        data: null, 
        error: handleAuthError(result.error, false)
      };
    }
    
    return { data: result.data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleAuthError(err, false)
    };
  }
};

// Google OAuth sign in — redirects to Google, then back into the app already signed in.
export const safeSignInWithGoogle = async () => {
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });

    if (result.error) {
      return {
        data: null,
        error: handleAuthError(result.error, false)
      };
    }

    return { data: result.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: handleAuthError(err, false)
    };
  }
};

// Passwordless sign in: sends a magic link to the given email.
// The user clicks the link and is redirected back into the app already signed in.
export const safeSignInWithOtp = async (email) => {
  try {
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (result.error) {
      return {
        data: null,
        error: handleAuthError(result.error, false)
      };
    }

    return { data: result.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: handleAuthError(err, false)
    };
  }
};

// Safe sign up with proper error handling
export const safeSignUp = async (email, password, fullName) => {
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + '/login'
      }
    });
    
    if (result.error) {
      // Check for rate limit
      if (result.error.status === 429) {
        return { 
          data: null, 
          error: { message: 'Too many attempts. Please wait a minute and try again.' }
        };
      }
      return { 
        data: null, 
        error: handleAuthError(result.error, true)
      };
    }
    
    return { data: result.data, error: null };
  } catch (err) {
    // Check for rate limit in catch
    if (err.status === 429 || err.message?.includes('429')) {
      return { 
        data: null, 
        error: { message: 'Too many attempts. Please wait a minute and try again.' }
      };
    }
    return { 
      data: null, 
      error: handleAuthError(err, true)
    };
  }
};
