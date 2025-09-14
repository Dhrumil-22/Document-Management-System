import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { databaseService, DBUser } from '../services/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert database user to app user
const convertDBUserToUser = (dbUser: DBUser): User => ({
  id: dbUser.id,
  username: dbUser.username,
  role: dbUser.role,
  email: dbUser.email
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize database and check for stored user session
    const initializeAuth = async () => {
      try {
        await databaseService.initializeDatabase();
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify user still exists and is active in database
          const dbUser = await databaseService.getUserById(userData.id);
          if (dbUser) {
            setUser(convertDBUserToUser(dbUser));
          } else {
            // User no longer exists or is inactive, clear stored data
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dbUser = await databaseService.authenticateUser(username, password);
      
      if (dbUser) {
        const userData = convertDBUserToUser(dbUser);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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