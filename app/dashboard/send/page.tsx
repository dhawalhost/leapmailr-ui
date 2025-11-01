'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { templateAPI, emailAPI } from '@/lib/api';
import {
  Send,
  Plus,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  variables: string[];
}

interface Recipient {
  email: string;
  parameters?: Record<string, any>;
}

export default function SendEmailPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: '' }]);
  const [subject, setSubject] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      // Initialize parameters for template variables
      const params: Record<string, string> = {};
      selectedTemplate.variables?.forEach((v) => {
        params[v] = '';
      });
      setParameters(params);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.list();
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, email: string) => {
    const updated = [...recipients];
    updated[index].email = email;
    setRecipients(updated);
  };

  const updateParameter = (key: string, value: string) => {
    setParameters({ ...parameters, [key]: value });
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;
    
    let html = selectedTemplate.html_body;
    // Replace variables with parameter values
    Object.entries(parameters).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      setStatus('error');
      return;
    }

    // Validate recipients
    const validRecipients = recipients.filter((r) => r.email.trim() !== '');
    if (validRecipients.length === 0) {
      setStatus('error');
      return;
    }

    try {
      setSending(true);
      setStatus('idle');

      // Send email for each recipient
      const promises = validRecipients.map((recipient) =>
        emailAPI.send({
          template_id: selectedTemplate.id,
          to: recipient.email,
          subject: subject,
          parameters: parameters,
        })
      );

      await Promise.all(promises);
      setStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setRecipients([{ email: '' }]);
        setParameters({});
        setSelectedTemplate(null);
        setSubject('');
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Send Email</h1>
        <p className="text-muted-foreground">
          Send beautiful emails using your templates
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
              <CardDescription>Choose an email template to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No templates found</p>
                  <Button onClick={() => router.push('/dashboard/templates')}>
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold">{template.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {template.subject}
                        </div>
                        {template.variables && template.variables.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {template.variables.map((v) => (
                              <span
                                key={v}
                                className="text-xs px-2 py-1 bg-secondary rounded"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedTemplate && (
            <>
              {/* Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle>Recipients</CardTitle>
                  <CardDescription>Add email addresses to send to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                      />
                      {recipients.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeRecipient(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addRecipient} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>
                </CardContent>
              </Card>

              {/* Subject */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </CardContent>
              </Card>

              {/* Template Parameters */}
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Variables</CardTitle>
                    <CardDescription>
                      Fill in the variables for your template
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="space-y-2">
                        <Label>{variable}</Label>
                        <Input
                          value={parameters[variable] || ''}
                          onChange={(e) => updateParameter(variable, e.target.value)}
                          placeholder={`Enter ${variable}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-1"
                      size="lg"
                    >
                      {sending ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Now
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generatePreview}
                      variant="outline"
                      size="lg"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>

                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Email sent successfully!</span>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <span>Failed to send email. Please try again.</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTemplate ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Select a template to see preview
                </div>
              ) : !showPreview ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Click "Preview" to see how your email will look
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-white max-h-[600px] overflow-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}