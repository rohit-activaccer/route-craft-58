import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get API base URL from environment or use localhost for development
const getApiBaseUrl = () => {
  // Check if we're in production (deployed environment)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production environment - use the production API
    return 'https://procure.activaccer.ai/api/v1';
  } else {
    // Development environment - use localhost
    return 'http://localhost:8000/api/v1';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing authentication...');
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthContext: Found saved user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    } else {
      console.log('AuthContext: No saved user found, user will need to login');
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Signing in with email:', email);
    
    try {
      // Create form data for the login request
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const apiBaseUrl = getApiBaseUrl();
      const loginUrl = `${apiBaseUrl}/auth/login`;
      
      console.log('AuthContext: Using API URL:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Save user and token to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('access_token', data.access_token);
      
      setUser(data.user);
      console.log('AuthContext: User signed in successfully:', data.user);
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out user');
    setUser(null);
    // Remove user and token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    console.log('AuthContext: User signed out successfully');
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}