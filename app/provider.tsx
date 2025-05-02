
'use client';

import { PermissionProvider } from '@/contexts/PermissionContext';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PermissionProvider>  
        {children}
      </PermissionProvider>
    </SessionProvider>
  );
}
