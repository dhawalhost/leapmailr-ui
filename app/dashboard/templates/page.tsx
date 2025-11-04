'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateAPI } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Code,
  X,
  FileText,
  Sparkles,
  Copy,
  Search,
  Mail,
  Newspaper,
  Bell,
  ShoppingCart,
  Layout,
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-templates' | 'gallery'>('my-templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const { currentProject } = useProjectStore();

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [currentProject]);

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadDefaultTemplates();
    }
  }, [activeTab, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = currentProject ? { project_id: currentProject.id } : {};
      const response = await templateAPI.list(params);
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
    // Navigate to new template page with template data as URL params
    const params = new URLSearchParams({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      html_body: template.html_content || template.html_body || '',
      text_body: template.text_content || template.text_body || '',
    });
    router.push(`/dashboard/templates/new?${params.toString()}`);
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
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleCreateNew = () => {
    router.push('/dashboard/templates/new');
  };

  const handleEdit = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}/edit`);
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
            <p className="text-white/60">Create and manage your email templates</p>
          </div>
          {activeTab === 'my-templates' && (
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 rounded-lg bg-[oklch(65%_0.19_145)] hover:bg-[oklch(60%_0.19_145)] 
                       transition-all flex items-center gap-2 shadow-lg hover:shadow-xl w-fit"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10 w-fit"
        >
          <button
            onClick={() => setActiveTab('my-templates')}
            className={`px-6 py-2 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'my-templates'
                ? 'bg-[oklch(65%_0.19_145)] text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-2 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-[oklch(65%_0.19_145)] text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Template Gallery ({defaultTemplates.length})
          </button>
        </motion.div>

        {/* Gallery View - Categories and Templates */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-[oklch(65%_0.19_145)] h-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-[oklch(65%_0.19_145)] text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  All Templates
                </button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category.id] || Layout;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-[oklch(65%_0.19_145)] text-white'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Default Templates Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[oklch(65%_0.19_145)] mx-auto mb-4"></div>
                <p className="text-white/60">Loading templates...</p>
              </div>
            ) : filteredDefaultTemplates.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No templates found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDefaultTemplates.map((template, index) => {
                  const Icon = categoryIcons[template.category || 'custom'] || Layout;
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="group"
                    >
                      <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-[oklch(65%_0.19_145)]/20 text-[oklch(65%_0.19_145)] border-[oklch(65%_0.19_145)]/30">
                              <Icon className="h-3 w-3 mr-1" />
                              {template.category?.replace('_', ' ')}
                            </Badge>
                            {template.usage_count ? (
                              <Badge className="bg-white/10 text-white/70 border-white/20">
                                {template.usage_count} uses
                              </Badge>
                            ) : null}
                          </div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-white/60 line-clamp-2">
                            {template.description || template.subject}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Variables */}
                          {getTemplateVariables(template).length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-white/70 mb-2">
                                Variables:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {getTemplateVariables(template).slice(0, 5).map((variable) => (
                                  <Badge key={variable} className="bg-white/10 text-white/70 border-white/20 text-xs">
                                    {`{{${variable}}}`}
                                  </Badge>
                                ))}
                                {getTemplateVariables(template).length > 5 && (
                                  <Badge className="bg-white/10 text-white/70 border-white/20 text-xs">
                                    +{getTemplateVariables(template).length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreview(template)}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                       transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                            <button
                              onClick={() => handleUseTemplate(template)}
                              className="flex-1 px-3 py-2 rounded-lg bg-[oklch(65%_0.19_145)] hover:bg-[oklch(60%_0.19_145)] 
                                       transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              <Copy className="h-4 w-4" />
                              Use Template
                            </button>
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
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[oklch(65%_0.19_145)] mx-auto mb-4"></div>
                <p className="text-white/60">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-white/40" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      No templates yet
                    </h3>
                    <p className="text-white/60 mb-6">
                      Create your first template or clone one from the gallery
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleCreateNew}
                        className="px-6 py-3 rounded-lg bg-[oklch(65%_0.19_145)] hover:bg-[oklch(60%_0.19_145)] 
                                 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        Create Template
                      </button>
                      <button
                        onClick={() => setActiveTab('gallery')}
                        className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Browse Gallery
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge className="bg-[oklch(65%_0.19_145)]/20 text-[oklch(65%_0.19_145)] border-[oklch(65%_0.19_145)]/30">
                            Custom
                          </Badge>
                        </div>
                        <CardDescription className="text-white/60 line-clamp-1">
                          {template.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                     transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleEdit(template)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                     transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 
                                     transition-all flex items-center justify-center text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                          Ready to use this template?
                        </h3>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Clone this template to your workspace and customize it to your needs
                        </p>
                      </div>
                      <Button
                        onClick={() => handleUseTemplate(previewTemplate)}
                        className="bg-green-600 hover:bg-green-700 ml-4"
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
      </div>
    </div>
  );
}
