'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateAPI } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Code,
  X,
  Save,
  FileText,
  Sparkles,
  Copy,
  Filter,
  Search,
  Mail,
  Newspaper,
  Bell,
  ShoppingCart,
  Users,
  Layout,
  Check,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  html_content?: string;
  html_body?: string;
  text_content?: string;
  text_body?: string;
  description?: string;
  category?: string;
  variables?: string[] | string;
  is_default?: boolean;
  is_public?: boolean;
  preview_image?: string;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const categoryIcons: Record<string, any> = {
  contact_form: Mail,
  newsletter: Newspaper,
  transactional: ShoppingCart,
  notification: Bell,
  custom: Layout,
};

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<'my-templates' | 'gallery'>('my-templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_body: '',
    text_body: '',
  });
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadDefaultTemplates();
    }
  }, [activeTab, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.list();
      // API returns { data: [...templates] } directly, not { data: { templates: [...] } }
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultTemplates = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/templates/defaults${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDefaultTemplates(data.data || []);
    } catch (error) {
      console.error('Failed to load default templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/templates/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleUseTemplate = (template: Template) => {
    // Copy template data to the create modal (no API call)
    setEditingTemplate(null); // Ensure we're in create mode, not edit mode
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      html_body: template.html_content || template.html_body || '',
      text_body: template.text_content || template.text_body || '',
    });
    setShowModal(true);
    setShowPreviewModal(false); // Close preview modal if open
    setActiveTab('my-templates'); // Switch to My Templates tab
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await templateAPI.delete(id);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', html_body: '', text_body: '' });
    setShowModal(true);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_body: template.html_content || template.html_body || '',
      text_body: template.text_content || template.text_body || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', html_body: '', text_body: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Map formData to API expected field names
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        html_content: formData.html_body,
        text_content: formData.text_body,
      };
      
      if (editingTemplate) {
        await templateAPI.update(editingTemplate.id, templateData);
      } else {
        await templateAPI.create(templateData);
      }
      await loadTemplates();
      closeModal();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  const getTemplateVariables = (template: Template): string[] => {
    if (Array.isArray(template.variables)) {
      return template.variables;
    }
    if (typeof template.variables === 'string') {
      try {
        return JSON.parse(template.variables);
      } catch {
        return [];
      }
    }
    return [];
  };

  const filteredDefaultTemplates = defaultTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your email templates
          </p>
        </div>
        {activeTab === 'my-templates' && (
          <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'my-templates'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            My Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'gallery'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            Template Gallery ({defaultTemplates.length})
          </button>
        </nav>
      </div>

      {/* Gallery View - Categories and Templates */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-purple-600' : ''}
              >
                All Templates
              </Button>
              {categories.map((category) => {
                const Icon = categoryIcons[category.id] || Layout;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? 'bg-purple-600' : ''}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Default Templates Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading templates...</p>
            </div>
          ) : filteredDefaultTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No templates found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDefaultTemplates.map((template) => {
                const Icon = categoryIcons[template.category || 'custom'] || Layout;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-purple-300 dark:hover:border-purple-700">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {template.category?.replace('_', ' ')}
                          </Badge>
                          {template.usage_count ? (
                            <Badge variant="outline" className="text-xs">
                              {template.usage_count} uses
                            </Badge>
                          ) : null}
                        </div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description || template.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Variables */}
                        {getTemplateVariables(template).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Variables:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {getTemplateVariables(template).slice(0, 5).map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                              {getTemplateVariables(template).length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{getTemplateVariables(template).length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(template)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Templates View */}
      {activeTab === 'my-templates' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No templates yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first template or clone one from the gallery
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('gallery')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Gallery
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-1">
                      {template.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(template)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {previewTemplate.subject}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setPreviewMode('preview')}
                      className={`px-3 py-1.5 text-sm rounded ${
                        previewMode === 'preview'
                          ? 'bg-white dark:bg-gray-600 shadow'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => setPreviewMode('code')}
                      className={`px-3 py-1.5 text-sm rounded ${
                        previewMode === 'code'
                          ? 'bg-white dark:bg-gray-600 shadow'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Code className="h-4 w-4 inline mr-1" />
                      Code
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreviewModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {previewMode === 'preview' ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <iframe
                      srcDoc={previewTemplate.html_content || previewTemplate.html_body || ''}
                      className="w-full h-[500px] bg-white rounded"
                      title="Template Preview"
                    />
                  </div>
                ) : (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{previewTemplate.html_content || previewTemplate.html_body || ''}</code>
                  </pre>
                )}

                {/* Variables Info */}
                {getTemplateVariables(previewTemplate).length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Available Variables:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {getTemplateVariables(previewTemplate).map((variable) => (
                        <code
                          key={variable}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded text-xs font-mono"
                        >
                          {`{{.${variable}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Use This Template Button (for default templates) */}
                {previewTemplate.is_default && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Ready to use this template?
                        </h3>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          Clone this template to your workspace and customize it to your needs
                        </p>
                      </div>
                      <Button
                        onClick={() => handleUseTemplate(previewTemplate)}
                        className="bg-purple-600 hover:bg-purple-700 ml-4"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal - Keep existing modal code */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                <div>
                  <Label>Subject Line</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{.app_name}}!"
                  />
                </div>

                <div>
                  <Label>HTML Content</Label>
                  <textarea
                    value={formData.html_body}
                    onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
                    placeholder="Enter your HTML template..."
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </div>

                <div>
                  <Label>Plain Text Content (Optional)</Label>
                  <textarea
                    value={formData.text_body}
                    onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
                    placeholder="Enter plain text version..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
