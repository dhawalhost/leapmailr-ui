'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { emailServiceAPI } from '@/lib/api';
import { EmailService, EmailServiceProvider, PROVIDER_METADATA } from '@/types/email-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface EmailServiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service?: EmailService | null;
}

export function EmailServiceModal({ open, onClose, onSuccess, service }: EmailServiceModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<EmailServiceProvider>('smtp');
  const [serviceName, setServiceName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (service) {
      setSelectedProvider(service.provider);
      setServiceName(service.name);
      setIsDefault(service.is_default);
      setFromEmail(service.from_email || '');
      setFromName(service.from_name || '');
      setReplyToEmail(service.reply_to_email || '');
      // Note: config_preview is masked, we can't edit existing configs fully
      setConfig({});
    } else {
      setSelectedProvider('smtp');
      setServiceName('');
      setIsDefault(false);
      setFromEmail('');
      setFromName('');
      setReplyToEmail('');
      setConfig({});
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const metadata = PROVIDER_METADATA[selectedProvider];
      const configuration: Record<string, any> = {};

      // Build configuration from form fields
      metadata.fields.forEach(field => {
        const value = config[field.name];
        if (value !== undefined && value !== '') {
          if (field.type === 'number') {
            configuration[field.name] = parseInt(value, 10);
          } else if (field.name === 'use_tls') {
            configuration[field.name] = value === 'true';
          } else {
            configuration[field.name] = value;
          }
        }
      });

      if (service) {
        // Update existing service
        await emailServiceAPI.update(service.id, {
          name: serviceName,
          configuration: Object.keys(configuration).length > 0 ? configuration : undefined,
          from_email: fromEmail,
          from_name: fromName || undefined,
          reply_to_email: replyToEmail || undefined,
          is_default: isDefault,
        });
        toast({
          title: 'Success',
          description: 'Email service updated successfully',
        });
      } else {
        // Create new service
        await emailServiceAPI.create({
          name: serviceName,
          provider: selectedProvider,
          configuration,
          from_email: fromEmail,
          from_name: fromName || undefined,
          reply_to_email: replyToEmail || undefined,
          is_default: isDefault,
        });
        toast({
          title: 'Success',
          description: 'Email service created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save email service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const metadata = PROVIDER_METADATA[selectedProvider];

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold">
              {service ? 'Edit Email Service' : 'Add Email Service'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="My Email Service"
                required
              />
            </div>

            {!service && (
              <div>
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as EmailServiceProvider)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {Object.entries(PROVIDER_METADATA).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.icon} {meta.name} - {meta.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Configuration</h3>
              {service && (
                <p className="text-sm text-muted-foreground">
                  Leave fields empty to keep existing configuration
                </p>
              )}
              
              {metadata.fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && !service && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      value={config[field.name] || ''}
                      onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required={field.required && !service}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={config[field.name] || ''}
                      onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required && !service}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Email Settings</h3>
              
              <div>
                <Label htmlFor="from_email">
                  From Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="from_email"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="My Company"
                />
              </div>

              <div>
                <Label htmlFor="reply_to_email">Reply-To Email</Label>
                <Input
                  id="reply_to_email"
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_default">Set as default service</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : service ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
