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
  Reply,
  Plus,
  Edit2,
  Trash2,
  Send,
  Clock,
  Power,
  PowerOff,
} from 'lucide-react';

interface EmailService {
  id: string;
  name: string;
  provider: string;
}

interface AutoReply {
  id: string;
  email_service_id: string;
  name: string;
  subject: string;
  body: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  is_active: boolean;
  trigger_on_form: boolean;
  trigger_on_api: boolean;
  include_variables: boolean;
  delay_seconds: number;
  created_at: string;
  updated_at: string;
}

export default function AutoReplyPage() {
  const { toast } = useToast();
  const [autoreplies, setAutoreplies] = useState<AutoReply[]>([]);
  const [emailServices, setEmailServices] = useState<EmailService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email_service_id: '',
    subject: '',
    body: '',
    from_email: '',
    from_name: '',
    reply_to: '',
    is_active: true,
    trigger_on_form: true,
    trigger_on_api: false,
    include_variables: true,
    delay_seconds: 0,
  });

  useEffect(() => {
    loadAutoreplies();
    loadEmailServices();
  }, []);

  const loadAutoreplies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/autoreplies');
      setAutoreplies(response.data.autoreplies || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load auto-replies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailServices = async () => {
    try {
      const response = await api.get('/email-services');
      setEmailServices(response.data.services || []);
    } catch (error: any) {
      console.error('Failed to load email services:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email_service_id: '',
      subject: '',
      body: '',
      from_email: '',
      from_name: '',
      reply_to: '',
      is_active: true,
      trigger_on_form: true,
      trigger_on_api: false,
      include_variables: true,
      delay_seconds: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/autoreplies/${editingId}`, formData);
        toast({
          title: 'Success',
          description: 'Auto-reply updated successfully',
        });
      } else {
        await api.post('/autoreplies', formData);
        toast({
          title: 'Success',
          description: 'Auto-reply created successfully',
        });
      }
      resetForm();
      loadAutoreplies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save auto-reply',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (autoreply: AutoReply) => {
    setFormData({
      name: autoreply.name,
      email_service_id: autoreply.email_service_id || '',
      subject: autoreply.subject,
      body: autoreply.body,
      from_email: autoreply.from_email || '',
      from_name: autoreply.from_name || '',
      reply_to: autoreply.reply_to || '',
      is_active: autoreply.is_active,
      trigger_on_form: autoreply.trigger_on_form,
      trigger_on_api: autoreply.trigger_on_api,
      include_variables: autoreply.include_variables,
      delay_seconds: autoreply.delay_seconds,
    });
    setEditingId(autoreply.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this auto-reply configuration?')) {
      return;
    }

    try {
      await api.delete(`/autoreplies/${id}`);
      toast({
        title: 'Success',
        description: 'Auto-reply deleted successfully',
      });
      loadAutoreplies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete auto-reply',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await api.put(`/autoreplies/${id}`, { is_active: !currentState });
      toast({
        title: 'Success',
        description: `Auto-reply ${!currentState ? 'activated' : 'deactivated'}`,
      });
      loadAutoreplies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update auto-reply',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (id: string) => {
    const email = prompt('Enter test email address:');
    if (!email) return;

    try {
      await api.post(`/autoreplies/${id}/test`, {
        test_email: email,
      });
      toast({
        title: 'Success',
        description: `Test auto-reply sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send test email',
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
          <h1 className="text-3xl font-bold">Auto-Reply</h1>
          <p className="text-gray-600 mt-2">
            Automatically send replies when emails are sent
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Auto-Reply'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Auto-Reply</CardTitle>
            <CardDescription>
              Configure automatic email responses for form submissions or API calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Configuration Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Contact Form Auto-Reply"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email_service">Email Service</Label>
                  <select
                    id="email_service"
                    className="w-full p-2 border rounded-md"
                    value={formData.email_service_id}
                    onChange={(e) => setFormData({ ...formData, email_service_id: e.target.value })}
                  >
                    <option value="">Use Default Service</option>
                    {emailServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.provider})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use your default email service
                  </p>
                </div>

                <div>
                  <Label htmlFor="delay_seconds">Delay (seconds)</Label>
                  <Input
                    id="delay_seconds"
                    type="number"
                    min="0"
                    value={formData.delay_seconds}
                    onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = Send immediately
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Thank you for contacting us!"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="body">Email Body *</Label>
                  <textarea
                    id="body"
                    className="w-full p-2 border rounded-md min-h-[200px]"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Hi {{name}},&#10;&#10;Thank you for your message. We'll get back to you soon!&#10;&#10;Best regards,&#10;The Team"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{{variable}}'} syntax to insert dynamic values (e.g., {'{{name}}'}, {'{{email}}'})
                  </p>
                </div>

                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    placeholder="Optional - uses service default"
                  />
                </div>

                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    placeholder="Optional - uses service default"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="reply_to">Reply-To Email</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    value={formData.reply_to}
                    onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-medium">Trigger Settings</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trigger_on_form"
                    checked={formData.trigger_on_form}
                    onChange={(e) => setFormData({ ...formData, trigger_on_form: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="trigger_on_form" className="cursor-pointer">
                    Trigger on form submissions (/send-form endpoint)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trigger_on_api"
                    checked={formData.trigger_on_api}
                    onChange={(e) => setFormData({ ...formData, trigger_on_api: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="trigger_on_api" className="cursor-pointer">
                    Trigger on API calls (/send-email endpoint)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="include_variables"
                    checked={formData.include_variables}
                    onChange={(e) => setFormData({ ...formData, include_variables: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="include_variables" className="cursor-pointer">
                    Replace {'{{variables}}'} with actual values
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer font-medium">
                    Active
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Auto-Reply
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Auto-Replies List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Auto-Replies ({autoreplies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {autoreplies.length === 0 ? (
            <div className="text-center py-12">
              <Reply className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No auto-replies configured
              </h3>
              <p className="text-gray-600 mb-4">
                Create an auto-reply to automatically respond to emails
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Auto-Reply
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {autoreplies.map((autoreply) => (
                <div
                  key={autoreply.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{autoreply.name}</h3>
                        <Badge variant={autoreply.is_active ? 'default' : 'outline'}>
                          {autoreply.is_active ? (
                            <span className="flex items-center gap-1">
                              <Power className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <PowerOff className="h-3 w-3" /> Inactive
                            </span>
                          )}
                        </Badge>
                        {autoreply.delay_seconds > 0 && (
                          <Badge variant="outline" className="text-blue-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {autoreply.delay_seconds}s delay
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Subject:</strong> {autoreply.subject}
                      </p>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Triggers:</strong>
                        <span className="ml-2">
                          {autoreply.trigger_on_form && 'Forms '}
                          {autoreply.trigger_on_api && 'API'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {autoreply.body}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(autoreply.id, autoreply.is_active)}
                        title={autoreply.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {autoreply.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(autoreply.id)}
                        title="Send Test"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(autoreply)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(autoreply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How Auto-Reply Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            <strong>Automatic Responses:</strong> When an email is sent through your configured
            endpoints, an auto-reply will be sent to the recipient automatically.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Form Trigger:</strong> Responds to emails sent via <code>/api/v1/send-form</code>
            </li>
            <li>
              <strong>API Trigger:</strong> Responds to emails sent via <code>/api/v1/send-email</code>
            </li>
            <li>
              <strong>Variables:</strong> Use {'{{name}}'}, {'{{email}}'}, etc. to personalize responses
            </li>
            <li>
              <strong>Delay:</strong> Optional delay before sending the auto-reply
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
