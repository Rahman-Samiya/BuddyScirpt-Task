"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/feed');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default GuestRoute;
