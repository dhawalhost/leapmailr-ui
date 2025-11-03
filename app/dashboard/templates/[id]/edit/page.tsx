'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { templateAPI } from '@/lib/api';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Sparkles,
  Loader2,
  Wand2,
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

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
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
      console.error('Failed to load template:', error);
      alert('Failed to load template');
      router.push('/dashboard/templates');
    } finally {
      setLoading(false);
    }
  };

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

      console.log('Updating template with variables:', variablesList);
      console.log('Template data:', templateData);
      
      await templateAPI.update(templateId, templateData);
      router.push('/dashboard/templates');
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template. Please try again.');
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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Template
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Update your email template
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.subject}
            className="bg-green-600 hover:bg-green-700"
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

      {/* Template Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>
            Basic information about your email template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                className="w-full"
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
                className="w-full"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pro Tip: Using Variables
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Use <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">{'{{.variable_name}}'}</code> 
              {' '}syntax to add dynamic content. For example: <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">{'{{.user_name}}'}</code>, 
              {' '}<code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">{'{{.email}}'}</code>
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
                  <Wand2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {detectedVariables.length} variable{detectedVariables.length !== 1 ? 's' : ''} detected
                  </span>
                </div>
              )}
            </div>

            {/* Detected Variables Display */}
            {detectedVariables.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Auto-detected:
                </span>
                {detectedVariables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
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
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Variables are auto-detected from your template content. You can also manually add or edit them here as a comma-separated list.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTML Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>HTML Content</CardTitle>
              <CardDescription>
                Design the HTML version of your email
              </CardDescription>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('code')}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  previewMode === 'code'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Code className="h-4 w-4 inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  previewMode === 'preview'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              {formData.html_body ? (
                <iframe
                  srcDoc={formData.html_body}
                  className="w-full h-96 bg-white rounded"
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
      <Card>
        <CardHeader>
          <CardTitle>Plain Text Content</CardTitle>
          <CardDescription>
            Fallback text version for email clients that don't support HTML (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.text_body}
            onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
            placeholder="Enter plain text version (optional)..."
            className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </CardContent>
      </Card>
    </div>
  );
}
