import React, { createContext, useContext } from 'react';
import { UseAuthFlowReturn, useAuthFlow } from '@features/auth';

const AuthContext = createContext<UseAuthFlowReturn | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authFlow = useAuthFlow();

  return (
    <AuthContext.Provider value={authFlow}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): UseAuthFlowReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
