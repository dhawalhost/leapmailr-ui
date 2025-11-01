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
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  description: string;
  public_key: string;
  private_key?: string;
  permissions: string[];
  is_active: boolean;
  rate_limit: number;
  usage_count: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export default function APIKeysPage() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<APIKey | null>(null);
  const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rate_limit: 100,
  });

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api-keys');
      setApiKeys(response.data.keys || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api-keys', formData);
      const generatedKey = response.data.data;
      
      setNewKey(generatedKey);
      setFormData({ name: '', description: '', rate_limit: 100 });
      setShowForm(false);
      loadAPIKeys();
      
      toast({
        title: 'Success',
        description: 'API key pair generated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to generate API key',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await api.put(`/api-keys/${id}`, { is_active: !currentState });
      toast({
        title: 'Success',
        description: `API key ${!currentState ? 'activated' : 'deactivated'}`,
      });
      loadAPIKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update API key',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`/api-keys/${id}/revoke`);
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
      loadAPIKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api-keys/${id}`);
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
      loadAPIKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const handleRotate = async (id: string) => {
    if (!confirm('Rotate the private key? The old private key will stop working immediately.')) {
      return;
    }

    try {
      const response = await api.post(`/api-keys/${id}/rotate`);
      setNewKey(response.data.data);
      toast({
        title: 'Success',
        description: 'Private key rotated successfully! Save the new key.',
      });
      loadAPIKeys();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to rotate key',
        variant: 'destructive',
      });
    }
  };

  const togglePrivateKeyVisibility = (keyId: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
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
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-2">
            Manage public/private key pairs for SDK and API access
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Generate New Key'}
        </Button>
      </div>

      {/* New Key Display (shown after generation) */}
      {newKey && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">New API Key Generated!</CardTitle>
            <CardDescription className="text-green-800">
              Save these keys securely. The private key won't be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-green-900">Public Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newKey.public_key}
                  readOnly
                  className="font-mono text-sm bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(newKey.public_key, 'Public key')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-green-900">Private Key (Secret)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newKey.private_key || ''}
                  readOnly
                  className="font-mono text-sm bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(newKey.private_key || '', 'Private key')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-800 mt-2">
                ⚠️ Store this private key securely. It won't be displayed again!
              </p>
            </div>

            <Button onClick={() => setNewKey(null)} className="w-full">
              I've Saved My Keys
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New API Key Pair</CardTitle>
            <CardDescription>
              Create a public/private key pair for SDK or API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <Label htmlFor="name">Key Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Production App, Development SDK"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this key"
                />
              </div>

              <div>
                <Label htmlFor="rate_limit">Rate Limit (requests/minute)</Label>
                <Input
                  id="rate_limit"
                  type="number"
                  min="1"
                  value={formData.rate_limit}
                  onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Generate Key Pair</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys ({apiKeys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No API keys yet
              </h3>
              <p className="text-gray-600 mb-4">
                Generate your first API key pair to start using the API
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{key.name}</h3>
                        <Badge variant={key.is_active && !key.revoked_at ? 'default' : 'outline'}>
                          {key.revoked_at ? (
                            <span className="flex items-center gap-1 text-red-600">
                              Revoked
                            </span>
                          ) : key.is_active ? (
                            <span className="flex items-center gap-1">
                              <Power className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <PowerOff className="h-3 w-3" /> Inactive
                            </span>
                          )}
                        </Badge>
                      </div>
                      {key.description && (
                        <p className="text-sm text-gray-600 mb-2">{key.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Public Key</Label>
                      <div className="flex gap-2 items-center">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                          {key.public_key}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(key.public_key, 'Public key')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> Usage
                      </span>
                      <span className="font-medium">{key.usage_count.toLocaleString()} calls</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rate Limit</span>
                      <span className="font-medium block">{key.rate_limit}/min</span>
                    </div>
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Last Used
                      </span>
                      <span className="font-medium block">
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium block">{new Date(key.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!key.revoked_at && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(key.id, key.is_active)}
                        >
                          {key.is_active ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                          {key.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotate(key.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rotate Key
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(key.id)}
                          className="text-orange-600"
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(key.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Using Your API Keys</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-3">
          <div>
            <h4 className="font-medium mb-2">Authentication Methods:</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border">
                <p className="font-medium mb-1">1. SDK Authentication (Recommended)</p>
                <code className="text-xs">
                  X-Public-Key: {'{your_public_key}'}<br />
                  X-Private-Key: {'{your_private_key}'}
                </code>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="font-medium mb-1">2. Simple API Key (Legacy)</p>
                <code className="text-xs">
                  X-API-Key: {'{your_api_key}'}
                </code>
              </div>
            </div>
          </div>
          <p className="text-sm">
            <strong>Security:</strong> Never share your private key or commit it to version control.
            Use environment variables to store keys securely.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
