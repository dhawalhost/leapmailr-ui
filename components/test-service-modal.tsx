'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { emailServiceAPI } from '@/lib/api';
import { EmailService } from '@/types/email-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface TestServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: EmailService | null;
}

export function TestServiceModal({ open, onClose, service }: TestServiceModalProps) {
  const [email, setEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const { toast } = useToast();

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    setTesting(true);
    setResult(null);

    try {
      const response = await emailServiceAPI.test(service.id, { to_email: email });
      setResult(response.data);
      
      if (response.data.success) {
        toast({
          title: 'Test Successful',
          description: response.data.message || 'Email service is working correctly',
        });
      } else {
        toast({
          title: 'Test Failed',
          description: response.data.error || 'Email service test failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to test email service';
      setResult({
        success: false,
        error: errorMsg,
      });
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-6 w-full max-w-md z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">
              Test Email Service
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          {service && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{service.name}</p>
              <p className="text-xs text-muted-foreground">{service.provider}</p>
            </div>
          )}

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                A test email will be sent to this address
              </p>
            </div>

            {result && (
              <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </p>
                    <p className={`text-xs mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message || result.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" disabled={testing}>
                {testing ? 'Testing...' : 'Send Test'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
