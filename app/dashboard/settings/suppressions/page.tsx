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
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  Ban,
  UserX,
  Download,
  Upload,
  Filter,
} from 'lucide-react';

interface Suppression {
  id: string;
  email: string;
  reason: 'bounce' | 'complaint' | 'unsubscribe' | 'manual';
  source: 'webhook' | 'manual' | 'api';
  metadata: string;
  created_at: string;
}

export default function SuppressionsPage() {
  const { toast } = useToast();
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterSource, setFilterSource] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    reason: 'manual' as 'bounce' | 'complaint' | 'unsubscribe' | 'manual',
  });
  
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkReason, setBulkReason] = useState<'bounce' | 'complaint' | 'unsubscribe' | 'manual'>('manual');

  useEffect(() => {
    loadSuppressions();
  }, [searchTerm, filterReason, filterSource]);

  const loadSuppressions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterReason) params.append('reason', filterReason);
      if (filterSource) params.append('source', filterSource);

      const response = await api.get(`/suppressions?${params.toString()}`);
      setSuppressions(response.data.suppressions || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load suppressions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppressions', formData);
      toast({
        title: 'Success',
        description: 'Email added to suppression list',
      });
      setShowAddForm(false);
      setFormData({ email: '', reason: 'manual' });
      loadSuppressions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add suppression',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = bulkEmails.split('\n').map(e => e.trim()).filter(e => e);
    
    if (emails.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await api.post('/suppressions/bulk', {
        emails,
        reason: bulkReason,
      });
      toast({
        title: 'Success',
        description: `Added ${response.data.added} of ${response.data.total} emails to suppression list`,
      });
      setShowBulkForm(false);
      setBulkEmails('');
      loadSuppressions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add suppressions',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this email from the suppression list? They will be able to receive emails again.')) {
      return;
    }

    try {
      await api.delete(`/suppressions/${id}`);
      toast({
        title: 'Success',
        description: 'Email removed from suppression list',
      });
      loadSuppressions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove suppression',
        variant: 'destructive',
      });
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'bounce': return <AlertTriangle className="h-4 w-4" />;
      case 'complaint': return <Ban className="h-4 w-4" />;
      case 'unsubscribe': return <UserX className="h-4 w-4" />;
      default: return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'bounce': return 'bg-orange-100 text-orange-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'unsubscribe': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Suppression List</h1>
          <p className="text-gray-600 mt-2">
            Manage emails that should not receive messages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkForm(!showBulkForm)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Add
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Email
          </Button>
        </div>
      </div>

      {/* Add Single Email Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Email to Suppression List</CardTitle>
            <CardDescription>
              This email address will not receive any emails from your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <select
                  id="reason"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                >
                  <option value="manual">Manual</option>
                  <option value="bounce">Bounce</option>
                  <option value="complaint">Complaint/Spam</option>
                  <option value="unsubscribe">Unsubscribe</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add to List</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Add Form */}
      {showBulkForm && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Add to Suppression List</CardTitle>
            <CardDescription>
              Add multiple email addresses (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkAdd} className="space-y-4">
              <div>
                <Label htmlFor="bulk_emails">Email Addresses</Label>
                <textarea
                  id="bulk_emails"
                  className="w-full mt-1 p-2 border rounded-md min-h-[200px] font-mono text-sm"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter one email address per line
                </p>
              </div>

              <div>
                <Label htmlFor="bulk_reason">Reason</Label>
                <select
                  id="bulk_reason"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value as any)}
                >
                  <option value="manual">Manual</option>
                  <option value="bounce">Bounce</option>
                  <option value="complaint">Complaint/Spam</option>
                  <option value="unsubscribe">Unsubscribe</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add All to List</Button>
                <Button type="button" variant="outline" onClick={() => setShowBulkForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  className="pl-10"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filter_reason">Filter by Reason</Label>
              <select
                id="filter_reason"
                className="w-full p-2 border rounded-md"
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
              >
                <option value="">All Reasons</option>
                <option value="bounce">Bounce</option>
                <option value="complaint">Complaint</option>
                <option value="unsubscribe">Unsubscribe</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <Label htmlFor="filter_source">Filter by Source</Label>
              <select
                id="filter_source"
                className="w-full p-2 border rounded-md"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="webhook">Webhook</option>
                <option value="manual">Manual</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppressions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Suppressed Emails ({total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {suppressions.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No suppressed emails
              </h3>
              <p className="text-gray-600">
                Your suppression list is empty. Emails will be automatically added when bounces or complaints occur.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suppressions.map((suppression) => (
                <div
                  key={suppression.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono">{suppression.email}</code>
                      <Badge className={getReasonColor(suppression.reason)}>
                        <span className="flex items-center gap-1">
                          {getReasonIcon(suppression.reason)}
                          {suppression.reason}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="text-gray-600">
                        {suppression.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Added {new Date(suppression.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(suppression.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">About Suppressions</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800 space-y-2">
          <p>
            <strong>Automatic Protection:</strong> Emails are automatically added to this list when:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>An email bounces (permanently failed delivery)</li>
            <li>A recipient marks your email as spam</li>
            <li>A recipient unsubscribes from your emails</li>
          </ul>
          <p className="mt-4">
            <strong>Webhooks:</strong> Configure webhooks in your email service provider to automatically update
            this list. Webhook endpoint: <code className="bg-yellow-100 px-2 py-1 rounded">/api/v1/webhooks/:provider</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
