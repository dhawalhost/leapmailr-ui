'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { templateAPI, emailAPI, emailServiceAPI } from '@/lib/api';
import {
  Send,
  Plus,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Eye,
  FileText,
  Users,
  Mail,
  Calendar,
  Paperclip,
  Trash2,
  ChevronDown,
  Search,
  Reply,
  Sparkles,
  MousePointer,
  Edit3,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content?: string;
  html_body?: string;
  text_content?: string;
  text_body?: string;
  variables?: string | string[] | null;
  auto_reply_enabled?: boolean;
  auto_reply_template_id?: string;
}

interface Recipient {
  email: string;
  name?: string;
}

interface EmailService {
  id: string;
  name: string;
}

export default function SendEmailPage() {
  const router = useRouter();
  
  // Templates & Services
  const [templates, setTemplates] = useState<Template[]>([]);
  const [services, setServices] = useState<EmailService[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  
  // Email Form
  const [recipients, setRecipients] = useState<Recipient[]>([{ email: '', name: '' }]);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  
  // Auto-reply Configuration
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyTemplate, setAutoReplyTemplate] = useState<Template | null>(null);
  const [showAutoReplySelector, setShowAutoReplySelector] = useState(false);
  
  // Email Tracking
  const [enableTracking, setEnableTracking] = useState(true);
  
  // Scheduling
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Attachments (mock - you can integrate actual file upload)
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'auto-reply' | 'schedule'>('compose');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      console.log('Selected template:', selectedTemplate);
      console.log('Template variables raw:', selectedTemplate.variables);
      console.log('Template variables type:', typeof selectedTemplate.variables);
      
      setSubject(selectedTemplate.subject);
      setHtmlContent(selectedTemplate.html_content || selectedTemplate.html_body || '');
      setTextContent(selectedTemplate.text_content || selectedTemplate.text_body || '');
      
      // Initialize parameters for template variables
      const params: Record<string, string> = {};
      const vars = parseVariables(selectedTemplate.variables);
      console.log('Parsed variables:', vars);
      
      vars.forEach((v) => {
        params[v] = '';
      });
      setParameters(params);
      
      // Load auto-reply configuration from template
      if (selectedTemplate.auto_reply_enabled && selectedTemplate.auto_reply_template_id) {
        setAutoReplyEnabled(true);
        // Load the auto-reply template
        loadAutoReplyTemplate(selectedTemplate.auto_reply_template_id);
      }
    }
  }, [selectedTemplate]);

  const loadAutoReplyTemplate = async (templateId: string) => {
    try {
      const response = await templateAPI.get(templateId);
      setAutoReplyTemplate(response.data.data);
    } catch (error) {
      console.error('Failed to load auto-reply template:', error);
    }
  };

  const parseVariables = (variables: string | string[] | null | undefined): string[] => {
    if (!variables || variables === null) return [];
    if (Array.isArray(variables)) return variables;
    
    // Handle string that might be JSON
    if (typeof variables === 'string') {
      // Remove any leading/trailing whitespace
      const trimmed = variables.trim();
      
      // If it's already a comma-separated list (not JSON)
      if (trimmed.includes(',') && !trimmed.startsWith('[')) {
        return trimmed.split(',').map(v => v.trim()).filter(Boolean);
      }
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          // Clean each variable name: remove quotes, brackets, and trim
          return parsed.map(v => {
            if (typeof v === 'string') {
              return v.replace(/["\[\]]/g, '').trim();
            }
            return String(v).trim();
          }).filter(Boolean);
        }
        return [];
      } catch {
        // If not JSON, treat as single variable (clean it up)
        const cleaned = trimmed.replace(/["\[\]]/g, '').trim();
        return cleaned ? [cleaned] : [];
      }
    }
    
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesRes, servicesRes] = await Promise.all([
        templateAPI.list({ is_active: true }),
        emailServiceAPI.list(),
      ]);
      setTemplates(templatesRes.data.data || []);
      setServices(servicesRes.data.services || []);
      
      // Auto-select first service if available
      if (servicesRes.data.data?.length > 0) {
        setSelectedService(servicesRes.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setSubject('');
    setHtmlContent('');
    setTextContent('');
    setParameters({});
    setAutoReplyEnabled(false);
    setAutoReplyTemplate(null);
  };

  const handleAutoReplyTemplateSelect = (template: Template) => {
    setAutoReplyTemplate(template);
    setShowAutoReplySelector(false);
  };

  const clearAutoReplyTemplate = () => {
    setAutoReplyTemplate(null);
  };

  const handleSend = async () => {
    try {
      setSending(true);
      setStatus('idle');

      // Validate
      const validRecipients = recipients.filter(r => r.email.trim());
      if (validRecipients.length === 0) {
        alert('Please add at least one recipient');
        return;
      }
      if (!subject.trim()) {
        alert('Please enter a subject');
        return;
      }
      if (!selectedService) {
        alert('Please select an email service');
        return;
      }
      if (!selectedTemplate) {
        alert('Please select a template');
        return;
      }

      // Send emails
      for (const recipient of validRecipients) {
        const emailData = {
          to_email: recipient.email,
          to_name: recipient.name || '',
          subject: subject,
          template_id: selectedTemplate?.id,
          template_params: parameters, // Backend expects template_params, not variables
          service_id: selectedService,
          enable_tracking: enableTracking,
          auto_reply_enabled: autoReplyEnabled,
          auto_reply_template_id: autoReplyTemplate?.id,
        };

        console.log('Sending email with data:', emailData);
        console.log('Template params:', parameters);

        await emailAPI.send(emailData);
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.subject.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const renderPreview = () => {
    let content = htmlContent;
    Object.entries(parameters).forEach(([key, value]) => {
      // Replace both {{.variable}} and {{variable}} formats for preview
      content = content.replace(new RegExp(`{{\.${key}}}`, 'g'), value || `[${key}]`);
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return content;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Send Email</h1>
          <p className="text-gray-400">Compose and send emails to your recipients</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            {showPreview ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || recipients.filter(r => r.email).length === 0 || !subject}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
          >
            {sending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-green-500/20 border-green-500/50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-green-400 font-medium">Email sent successfully! Redirecting...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-red-500/20 border-red-500/50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-400 font-medium">Failed to send email. Please try again.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedTemplate.name}</p>
                        <p className="text-sm text-gray-400">{selectedTemplate.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTemplateSelector(true)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearTemplate}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateSelector(true)}
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select Template (Optional)
                  </Button>
                )}

                {/* Template Variables */}
                {selectedTemplate && parseVariables(selectedTemplate.variables).length > 0 && (
                  <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Edit3 className="h-4 w-4 text-[oklch(65%_0.19_145)]" />
                      <Label className="text-white/90 font-semibold">Template Variables</Label>
                      <span className="text-xs text-white/50">
                        ({parseVariables(selectedTemplate.variables).length} variables)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parseVariables(selectedTemplate.variables).map((variable) => (
                        <div key={variable} className="space-y-2">
                          <Label className="text-sm text-white/70 flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            {variable}
                          </Label>
                          <Input
                            value={parameters[variable] || ''}
                            onChange={(e) => setParameters({ ...parameters, [variable]: e.target.value })}
                            placeholder={`Enter value for ${variable}`}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 
                                     focus:border-[oklch(65%_0.19_145)] focus:ring-1 focus:ring-[oklch(65%_0.19_145)]"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/50 mt-2">
                      💡 These variables will be replaced in your email content
                    </p>
                  </div>
                )}

                {/* Info when template has no variables */}
                {selectedTemplate && parseVariables(selectedTemplate.variables).length === 0 && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      This template doesn't have any variables to configure
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recipients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recipients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipients.map((recipient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          type="email"
                          value={recipient.email}
                          onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                          placeholder="recipient@example.com"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Input
                          value={recipient.name}
                          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                          placeholder="Name (optional)"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    {recipients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
                <Button
                  variant="outline"
                  onClick={addRecipient}
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject & Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Message
                  </CardTitle>
                  <div className="flex items-center gap-2 border border-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('compose')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        activeTab === 'compose'
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Compose
                    </button>
                    <button
                      onClick={() => setActiveTab('auto-reply')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        activeTab === 'auto-reply'
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Auto-Reply
                    </button>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        activeTab === 'schedule'
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'compose' && (
                  <>
                    <div>
                      <Label className="text-gray-300">Subject</Label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                        className="mt-2 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    {showPreview ? (
                      <div>
                        <Label className="text-gray-300">Preview</Label>
                        <div
                          className="mt-2 p-4 rounded-lg bg-white text-gray-900 min-h-[300px] overflow-auto"
                          dangerouslySetInnerHTML={{ __html: renderPreview() }}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-gray-300">HTML Content</Label>
                          <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            placeholder="<p>Enter HTML content...</p>"
                            rows={12}
                            className="mt-2 w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Plain Text (Fallback)</Label>
                          <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Enter plain text version..."
                            rows={6}
                            className="mt-2 w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'auto-reply' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Reply className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-white">Enable Auto-Reply</p>
                          <p className="text-sm text-gray-400">Automatically reply when someone responds</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoReplyEnabled ? 'bg-primary' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {autoReplyEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <Label className="text-gray-300 mb-2 block">Auto-Reply Template</Label>
                          {autoReplyTemplate ? (
                            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Reply className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{autoReplyTemplate.name}</p>
                                  <p className="text-sm text-gray-400">{autoReplyTemplate.subject}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAutoReplySelector(true)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearAutoReplyTemplate}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setShowAutoReplySelector(true)}
                              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 border-dashed"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Select Auto-Reply Template
                            </Button>
                          )}
                        </div>
                        
                        {autoReplyTemplate && (
                          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">PREVIEW</p>
                            <p className="text-sm font-medium text-white mb-2">{autoReplyTemplate.subject}</p>
                            <div 
                              className="text-sm text-gray-400 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: (autoReplyTemplate.html_content || autoReplyTemplate.html_body || '').substring(0, 200) + '...' 
                              }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-white">Schedule Send</p>
                          <p className="text-sm text-gray-400">Send email at a specific time</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setScheduleEnabled(!scheduleEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          scheduleEnabled ? 'bg-primary' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            scheduleEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {scheduleEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <Label className="text-gray-300">Date</Label>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="mt-2 bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Time</Label>
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="mt-2 bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Email Tracking Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-white">Track Email Engagement</p>
                          <p className="text-sm text-gray-400">Track opens and clicks automatically</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEnableTracking(!enableTracking)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enableTracking ? 'bg-primary' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enableTracking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {enableTracking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <MousePointer className="h-5 w-5 text-blue-400 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-blue-400 font-medium mb-1">Tracking Enabled</p>
                            <p className="text-gray-400">
                              We'll track when recipients open your email and click links. 
                              View analytics in the Analytics dashboard.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Email Service Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">Email Service</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attachments (Mock) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add File
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-400">
                <p>• Use templates to save time and maintain consistency</p>
                <p>• Test emails with yourself before sending to recipients</p>
                <p>• Enable auto-reply for automated responses</p>
                <p>• Schedule emails for optimal delivery times</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateSelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplateSelector(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl z-50"
            >
              <Card className="bg-gray-900 border-gray-700 h-full md:h-auto max-h-[90vh] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Select Template</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTemplateSelector(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredTemplates.map((template) => {
                      const templateVars = parseVariables(template.variables);
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-primary/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white">{template.name}</h3>
                              <p className="text-sm text-gray-400 truncate">{template.subject}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {templateVars.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <Code className="h-3 w-3" />
                                    {templateVars.length} variable{templateVars.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {template.auto_reply_enabled && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                                    <Reply className="h-3 w-3" />
                                    Auto-reply
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No templates found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auto-Reply Template Selector Modal */}
      <AnimatePresence>
        {showAutoReplySelector && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoReplySelector(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl z-50"
            >
              <Card className="bg-gray-900 border-gray-700 h-full md:h-auto max-h-[90vh] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Reply className="h-5 w-5 text-primary" />
                      Select Auto-Reply Template
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAutoReplySelector(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search auto-reply templates..."
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleAutoReplyTemplateSelect(template)}
                        className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-primary/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Reply className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white">{template.name}</h3>
                            <p className="text-sm text-gray-400 truncate">{template.subject}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Reply className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No templates found</p>
                        <Button
                          variant="outline"
                          className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                          onClick={() => {
                            setShowAutoReplySelector(false);
                            router.push('/dashboard/templates/new');
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Auto-Reply Template
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
