import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useConfig } from './ConfigContext';
import { AuthServiceFactoryImpl } from '@/services/factories/AuthServiceFactory';
import type { AuthService } from '@/types';

interface AuthServiceContextType {
  authService: AuthService;
  isAuthServiceReady: boolean;
  authServiceError: string | null;
}

const AuthServiceContext = createContext<AuthServiceContextType | undefined>(
  undefined
);

interface AuthServiceProviderProps {
  children: ReactNode;
}

export function AuthServiceProvider({ children }: AuthServiceProviderProps) {
  const { serviceConfig } = useConfig();
  const [authService, setAuthService] = useState<AuthService | null>(null);
  const [isAuthServiceReady, setIsAuthServiceReady] = useState(false);
  const [authServiceError, setAuthServiceError] = useState<string | null>(null);

  // Initialize AuthService
  useEffect(() => {
    try {
      const authServiceFactory = new AuthServiceFactoryImpl(
        serviceConfig.authService
      );
      const newAuthService = authServiceFactory.createService();
      setAuthService(newAuthService);
      setIsAuthServiceReady(true);
      setAuthServiceError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to initialize AuthService';
      setAuthServiceError(errorMessage);
      setIsAuthServiceReady(false);
    }
  }, [serviceConfig.authService]);

  const value: AuthServiceContextType = {
    authService: authService!,
    isAuthServiceReady,
    authServiceError,
  };

  return (
    <AuthServiceContext.Provider value={value}>
      {children}
    </AuthServiceContext.Provider>
  );
}

export function useAuthServices() {
  const context = useContext(AuthServiceContext);
  if (context === undefined) {
    throw new Error(
      'useAuthServices must be used within an AuthServiceProvider'
    );
  }
  return context;
}
