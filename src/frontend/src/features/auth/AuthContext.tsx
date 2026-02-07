import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUserEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    if (storedAuth === 'true' && storedEmail) {
      setIsAuthenticated(true);
      setCurrentUserEmail(storedEmail);
    }
  }, []);

  const login = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userEmail', email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUserEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
