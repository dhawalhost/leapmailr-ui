'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emailServiceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  Search,
  Mail,
  Server,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface SMTPProvider {
  id: string;
  name: string;
  description: string;
  host: string;
  port: number;
  use_tls: boolean;
  use_ssl: boolean;
  auth_required: boolean;
  category: string;
  help_url?: string;
  logo?: string;
  fields: SMTPProviderField[];
}

interface SMTPProviderField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  description?: string;
  default?: string;
}

interface EmailServiceModalNewProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailServiceModalNew({ open, onClose, onSuccess }: EmailServiceModalNewProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [providers, setProviders] = useState<SMTPProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<SMTPProvider | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [serviceName, setServiceName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProviders();
      setStep('select');
      setSearchQuery('');
      setSelectedCategory('all');
      setSelectedProvider(null);
      setServiceName('');
      setFromEmail('');
      setFromName('');
      setReplyToEmail('');
      setConfiguration({});
    }
  }, [open]);

  const loadProviders = async () => {
    try {
      setLoadingProviders(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/email-services/providers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProviders(data.data || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMTP providers',
        variant: 'destructive',
      });
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleProviderSelect = (provider: SMTPProvider) => {
    setSelectedProvider(provider);
    setServiceName(provider.name);
    
    // Pre-fill default values
    const initialConfig: Record<string, string> = {};
    provider.fields.forEach(field => {
      if (field.default) {
        initialConfig[field.key] = field.default;
      }
    });
    setConfiguration(initialConfig);
    
    setStep('configure');
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfiguration(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setLoading(true);
    try {
      // Remove from_email from configuration since it's now a separate field
      const { from_email, ...restConfig } = configuration;
      
      const config: Record<string, any> = {
        provider: selectedProvider.id,
        host: selectedProvider.host,
        port: selectedProvider.port,
        use_tls: selectedProvider.use_tls,
        use_ssl: selectedProvider.use_ssl,
        ...restConfig,
      };

      await emailServiceAPI.create({
        name: serviceName,
        provider: 'smtp',
        configuration: config,
        from_email: fromEmail,
        from_name: fromName,
        reply_to_email: replyToEmail || undefined,
        is_default: false,
      });

      toast({
        title: 'Success',
        description: `${selectedProvider.name} service created successfully`,
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create email service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const transactionalProviders = filteredProviders.filter(p => p.category === 'transactional');
  const smtpProviders = filteredProviders.filter(p => p.category === 'smtp');

  if (!open) return null;

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Provider Selection Step */}
          {step === 'select' && (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Choose Email Provider
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Select from popular SMTP providers or configure your own
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {loadingProviders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading providers...</p>
                  </div>
                ) : (
                  <>
                    {/* Transactional Services */}
                    {transactionalProviders.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Professional Email Services
                          </h3>
                          <Badge variant="secondary" className="ml-2">Recommended</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {transactionalProviders.map((provider) => (
                            <Card
                              key={provider.id}
                              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-300 dark:hover:border-green-700"
                              onClick={() => handleProviderSelect(provider)}
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Mail className="h-6 w-6 text-green-600" />
                                  {provider.help_url && (
                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <CardTitle className="text-lg">{provider.name}</CardTitle>
                                <CardDescription className="text-sm line-clamp-2">
                                  {provider.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>{provider.host}</span>
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SMTP Providers */}
                    {smtpProviders.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Server className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            SMTP Providers
                          </h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {smtpProviders.map((provider) => (
                            <Card
                              key={provider.id}
                              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300 dark:hover:border-blue-700"
                              onClick={() => handleProviderSelect(provider)}
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <Server className="h-6 w-6 text-blue-600" />
                                  {provider.help_url && (
                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <CardTitle className="text-lg">{provider.name}</CardTitle>
                                <CardDescription className="text-sm line-clamp-2">
                                  {provider.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>{provider.host}</span>
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Configuration Step */}
          {step === 'configure' && selectedProvider && (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('select')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Configure {selectedProvider.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedProvider.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
                {/* Service Name */}
                <div>
                  <Label htmlFor="serviceName">Service Name</Label>
                  <Input
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder={`My ${selectedProvider.name} Service`}
                    required
                  />
                </div>

                {/* Sender Information */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                    Sender Information (shown to recipients)
                  </h3>
                  <div className="space-y-4">
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
                        This is the email address recipients will see (not your SMTP credentials)
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
                        Where replies should be sent (leave empty to use From Email)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Server Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Server Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Host:</span>
                      <span className="ml-2 font-mono">{selectedProvider.host}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Port:</span>
                      <span className="ml-2 font-mono">{selectedProvider.port}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">TLS:</span>
                      <span className="ml-2">{selectedProvider.use_tls ? '✓ Enabled' : '✗ Disabled'}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">SSL:</span>
                      <span className="ml-2">{selectedProvider.use_ssl ? '✓ Enabled' : '✗ Disabled'}</span>
                    </div>
                  </div>
                </div>

                {/* Provider Fields (SMTP Credentials) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    SMTP Credentials (authentication only)
                  </h3>
                  {selectedProvider.fields
                    .filter(field => field.key !== 'from_email') // Remove from_email since it's handled above
                    .map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        value={configuration[field.key] || ''}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                      {field.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Help Link */}
                {selectedProvider.help_url && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <a
                      href={selectedProvider.help_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View {selectedProvider.name} Setup Guide
                    </a>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('select')}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Create Service
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
