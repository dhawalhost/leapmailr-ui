'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthDebugPage() {
  const router = useRouter();
  const { user, isAuthenticated, accessToken, refreshToken } = useAuthStore();
  const [localStorageTokens, setLocalStorageTokens] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setLocalStorageTokens({
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        auth_storage: localStorage.getItem('auth-storage'),
      });
    }
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Zustand Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
              <p><strong>Access Token (first 50 chars):</strong> {accessToken?.substring(0, 50) || 'null'}...</p>
              <p><strong>Refresh Token (first 50 chars):</strong> {refreshToken?.substring(0, 50) || 'null'}...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>access_token (first 50 chars):</strong> {localStorageTokens.access_token?.substring(0, 50) || 'null'}...</p>
              <p><strong>refresh_token (first 50 chars):</strong> {localStorageTokens.refresh_token?.substring(0, 50) || 'null'}...</p>
              <p><strong>auth-storage:</strong> {localStorageTokens.auth_storage?.substring(0, 100) || 'null'}...</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={() => router.push('/dashboard/services')}>
            Go to Email Services
          </Button>
        </div>
      </div>
    </div>
  );
}
