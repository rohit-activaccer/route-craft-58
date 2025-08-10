import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For development, create a default user
    const defaultUser: User = {
      id: '1',
      email: 'admin@routecraft.com',
      name: 'Administrator'
    };
    
    // Simulate loading delay
    setTimeout(() => {
      setUser(defaultUser);
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    // For development, accept any credentials
    const user: User = {
      id: '1',
      email: email,
      name: 'Administrator'
    };
    setUser(user);
  };

  const signOut = async () => {
    setUser(null);
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