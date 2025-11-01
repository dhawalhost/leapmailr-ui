'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface CaptchaConfig {
  id: string;
  provider: 'recaptcha_v2' | 'hcaptcha';
  site_key: string;
  domains: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CaptchaSettingsPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<CaptchaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'recaptcha_v2' as 'recaptcha_v2' | 'hcaptcha',
    site_key: '',
    secret_key: '',
    domains: '',
    is_active: true,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/captcha');
      setConfigs(response.data.captcha_configs || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load CAPTCHA configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        provider: formData.provider,
        site_key: formData.site_key,
        secret_key: formData.secret_key,
        domains: formData.domains ? formData.domains.split(',').map(d => d.trim()) : [],
        is_active: formData.is_active,
      };

      await api.post('/captcha', payload);
      
      toast({
        title: 'Success',
        description: 'CAPTCHA configuration created successfully',
      });

      setShowForm(false);
      setFormData({
        provider: 'recaptcha_v2',
        site_key: '',
        secret_key: '',
        domains: '',
        is_active: true,
      });
      loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create CAPTCHA configuration',
        variant: 'destructive',
      });
    }
  };

  const deleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CAPTCHA configuration?')) {
      return;
    }

    try {
      await api.delete(`/captcha/${id}`);
      toast({
        title: 'Success',
        description: 'CAPTCHA configuration deleted successfully',
      });
      loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete CAPTCHA configuration',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (config: CaptchaConfig) => {
    try {
      await api.put(`/captcha/${config.id}`, {
        is_active: !config.is_active,
      });
      toast({
        title: 'Success',
        description: `CAPTCHA configuration ${!config.is_active ? 'activated' : 'deactivated'}`,
      });
      loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update CAPTCHA configuration',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CAPTCHA Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure spam protection for your email forms
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add CAPTCHA
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New CAPTCHA Configuration</CardTitle>
            <CardDescription>
              Add a new CAPTCHA provider to protect your forms from spam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value as any })
                  }
                >
                  <option value="recaptcha_v2">Google reCAPTCHA v2</option>
                  <option value="hcaptcha">hCaptcha</option>
                </select>
              </div>

              <div>
                <Label htmlFor="site_key">Site Key</Label>
                <Input
                  id="site_key"
                  value={formData.site_key}
                  onChange={(e) =>
                    setFormData({ ...formData, site_key: e.target.value })
                  }
                  placeholder="Enter your site key"
                  required
                />
              </div>

              <div>
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  type="password"
                  value={formData.secret_key}
                  onChange={(e) =>
                    setFormData({ ...formData, secret_key: e.target.value })
                  }
                  placeholder="Enter your secret key"
                  required
                />
              </div>

              <div>
                <Label htmlFor="domains">Allowed Domains (comma-separated)</Label>
                <Input
                  id="domains"
                  value={formData.domains}
                  onChange={(e) =>
                    setFormData({ ...formData, domains: e.target.value })
                  }
                  placeholder="example.com, app.example.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Restrict CAPTCHA usage to specific domains
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Configuration</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No CAPTCHA configurations
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Add a CAPTCHA provider to protect your forms from spam and abuse
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First CAPTCHA
              </Button>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.provider === 'recaptcha_v2'
                          ? 'Google reCAPTCHA v2'
                          : 'hCaptcha'}
                        {config.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(config.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(config)}
                    >
                      {config.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteConfig(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Site Key</Label>
                    <code className="block mt-1 p-2 bg-gray-50 rounded text-sm break-all">
                      {config.site_key}
                    </code>
                  </div>

                  {config.domains && config.domains.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Allowed Domains</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.domains.map((domain, idx) => (
                          <Badge key={idx} variant="outline">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Config ID:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {config.id}
                      </code>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Use this ID when sending emails with CAPTCHA validation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Use CAPTCHA</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            1. Add a CAPTCHA configuration above with your provider credentials
          </p>
          <p>
            2. Include the <code className="bg-blue-100 px-2 py-1 rounded">captcha_token</code> and{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">captcha_config_id</code> fields in your
            email send requests
          </p>
          <p>
            3. The token will be validated before sending the email, protecting you from spam
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
