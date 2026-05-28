'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAPIErrorMessage, templateAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content?: string;
  html_body?: string;
  text_content?: string;
  text_body?: string;
  variables?: string | string[] | null;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_body: '',
    text_body: '',
  });
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const [saving, setSaving] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [manualVariables, setManualVariables] = useState<string>('');

  // Function to extract variables from template content
  const extractVariables = (htmlContent: string, textContent: string): string[] => {
    const combined = htmlContent + ' ' + textContent;
    const regex = /\{\{\.?(\w+)\}\}/g;
    const matches = Array.from(combined.matchAll(regex));
    const variables = [...new Set(matches.map(m => m[1]))]; // Remove duplicates
    return variables;
  };

  // Parse existing variables from backend
  const parseVariables = (variables: string | string[] | null | undefined): string[] => {
    if (!variables) return [];
    if (Array.isArray(variables)) return variables;
    if (typeof variables === 'string') {
      if (variables.includes(',')) {
        return variables.split(',').map(v => v.trim());
      }
      try {
        const parsed = JSON.parse(variables);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return variables.trim() ? [variables.trim()] : [];
      }
    }
    return [];
  };

  // Auto-detect variables when template content changes
  useEffect(() => {
    const detected = extractVariables(formData.html_body, formData.text_body);
    setDetectedVariables(detected);
  }, [formData.html_body, formData.text_body]);

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await templateAPI.get(templateId);
      const template: Template = response.data;
      
      setFormData({
        name: template.name,
        subject: template.subject,
        html_body: template.html_content || template.html_body || '',
        text_body: template.text_content || template.text_body || '',
      });

      // Load existing variables
      const existingVars = parseVariables(template.variables);
      setManualVariables(existingVars.join(', '));
    } catch (error) {
      toast({
        title: 'Error',
        description: getAPIErrorMessage(error, 'Failed to load template'),
        variant: 'destructive',
      });
      router.push('/dashboard/templates');
    } finally {
      setLoading(false);
    }
  }, [router, templateId, toast]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get final variables list (from manual input, or fallback to detected)
      const variablesList = manualVariables
        ? manualVariables.split(',').map(v => v.trim()).filter(v => v.length > 0)
        : detectedVariables;
      
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        html_content: formData.html_body,
        text_content: formData.text_body,
        variables: JSON.stringify(variablesList), // Send as JSON array string
      };

      await templateAPI.update(templateId, templateData);
      router.push('/dashboard/templates');
    } catch (error) {
      toast({
        title: 'Error',
        description: getAPIErrorMessage(error, 'Failed to update template. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/templates');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_24px_90px_-40px_rgba(0,0,0,0.8)] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 max-w-3xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Button>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                <FileText className="h-3.5 w-3.5" />
                Template authoring
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Edit Template
              </h1>
              <p className="text-gray-300 mt-2 max-w-2xl">Update your template with the same polished editing surface used throughout the app.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.subject}
              className="rounded-2xl bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Template Information Card */}
      <Card className="rounded-4xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
        <CardHeader className="border-b border-white/5">
          <CardTitle>Template Information</CardTitle>
          <CardDescription>
            Basic information about your email template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Email"
                className="w-full rounded-2xl bg-black/20 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject Line <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Welcome to {{.app_name}}!"
                className="w-full rounded-2xl bg-black/20 border-white/10"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
            <h3 className="text-sm font-semibold text-blue-100 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pro Tip: Using Variables
            </h3>
            <p className="text-xs text-blue-200/90">
              Use <code className="px-1.5 py-0.5 bg-blue-500/15 rounded">{'{{.variable_name}}'}</code> 
              {' '}syntax to add dynamic content. For example: <code className="px-1.5 py-0.5 bg-blue-500/15 rounded">{'{{.user_name}}'}</code>, 
              {' '}<code className="px-1.5 py-0.5 bg-blue-500/15 rounded">{'{{.email}}'}</code>
            </p>
          </div>

          {/* Variables Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="variables" className="text-base font-semibold">
                Template Variables
              </Label>
              {detectedVariables.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {detectedVariables.length} variable{detectedVariables.length !== 1 ? 's' : ''} detected
                  </span>
                </div>
              )}
            </div>

            {/* Detected Variables Display */}
            {detectedVariables.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-green-500/10 rounded-3xl border border-green-500/20">
                <span className="text-xs text-green-200 font-medium">
                  Auto-detected:
                </span>
                {detectedVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="bg-green-500/15 text-green-100 border-green-500/20"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    {variable}
                  </Badge>
                ))}
              </div>
            )}

            {/* Manual Variables Input */}
            <div className="space-y-2">
              <Input
                id="variables"
                value={manualVariables}
                onChange={(e) => setManualVariables(e.target.value)}
                placeholder="name, email, message (comma-separated)"
                className="w-full rounded-2xl bg-black/20 border-white/10"
              />
              <p className="text-xs text-gray-400">
                Variables are auto-detected from your template content. You can also manually add or edit them here as a comma-separated list.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTML Content Card */}
      <Card className="rounded-4xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>HTML Content</CardTitle>
              <CardDescription>
                Design the HTML version of your email
              </CardDescription>
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setPreviewMode('code')}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  previewMode === 'code'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className="h-4 w-4 inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  previewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-1" />
                Preview
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode === 'code' ? (
            <textarea
              value={formData.html_body}
              onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
              placeholder="Enter your HTML template..."
              className="w-full h-96 p-4 border border-white/10 rounded-3xl font-mono text-sm bg-black/20 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="border border-white/10 rounded-3xl p-4 bg-black/20">
              {formData.html_body ? (
                <iframe
                  srcDoc={formData.html_body}
                  className="w-full h-96 bg-white rounded-2xl"
                  title="Template Preview"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Enter HTML content to see preview</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plain Text Content Card */}
      <Card className="rounded-4xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
        <CardHeader className="border-b border-white/5">
          <CardTitle>Plain Text Content</CardTitle>
          <CardDescription>
            Fallback text version for email clients that don&apos;t support HTML (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.text_body}
            onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
            placeholder="Enter plain text version (optional)..."
            className="w-full h-48 p-4 border border-white/10 rounded-3xl font-mono text-sm bg-black/20 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </CardContent>
      </Card>
    </div>
  );
}
