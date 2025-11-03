'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emailServiceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, Save } from 'lucide-react';

interface EmailService {
  id: string;
  name: string;
  provider: string;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  is_default: boolean;
  status: string;
}

interface EditEmailServiceModalProps {
  open: boolean;
  service: EmailService | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmailServiceModal({ open, service, onClose, onSuccess }: EditEmailServiceModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && service) {
      setServiceName(service.name);
      setFromEmail(service.from_email);
      setFromName(service.from_name || '');
      setReplyToEmail(service.reply_to_email || '');
    }
  }, [open, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    setLoading(true);
    try {
      await emailServiceAPI.update(service.id, {
        name: serviceName,
        from_email: fromEmail,
        from_name: fromName,
        reply_to_email: replyToEmail || undefined,
      });

      toast({
        title: 'Success',
        description: 'Email service updated successfully',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update email service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !service) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Email Service
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update service name and sender information
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Provider Info (Read-only) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {service.provider}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  To change SMTP credentials, delete and recreate the service
                </div>
              </div>
            </div>

            {/* Service Name */}
            <div>
              <Label htmlFor="serviceName">
                Service Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="My Email Service"
                required
              />
            </div>

            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Sender Information
              </h3>
              
              <div>
                <Label htmlFor="fromEmail">
                  From Email Address
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This is the email address recipients will see
                </p>
              </div>

              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Company Name"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The friendly name shown to recipients
                </p>
              </div>

              <div>
                <Label htmlFor="replyToEmail">Reply-To Email (optional)</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="support@yourdomain.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Where replies should be sent
                </p>
              </div>
            </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
