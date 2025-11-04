'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  MoreVertical,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { projectAPI } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });
  const [submitting, setSubmitting] = useState(false);

  const { currentProject, setCurrentProject, setProjects: updateStoreProjects } = useProjectStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.list();
      setProjects(response.data);
      updateStoreProjects(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await projectAPI.create({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        is_default: false,
      });

      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowCreateModal(false);
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await projectAPI.update(selectedProject.id, {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      });

      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });

      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowEditModal(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setSubmitting(true);
    try {
      await projectAPI.delete(selectedProject.id);

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });

      setShowDeleteDialog(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (project: Project) => {
    try {
      await projectAPI.setDefault(project.id);

      toast({
        title: 'Success',
        description: `${project.name} is now your default project`,
      });

      await fetchProjects();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to set default project',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#3b82f6',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Organize your email services and templates by project</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-primary/50 transition-all group">
                {project.is_default && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                      <Star className="h-3 w-3 fill-current" />
                      Default
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
                      >
                        <Folder className="h-5 w-5" style={{ color: project.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white truncate">{project.name}</CardTitle>
                        {project.description && (
                          <CardDescription className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => openEditModal(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!project.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => openDeleteDialog(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {currentProject?.id === project.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                        disabled
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Active
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => setCurrentProject(project)}
                      >
                        Switch To
                      </Button>
                    )}

                    {!project.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleSetDefault(project)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Folder className="h-16 w-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg mb-2">No projects yet</p>
          <p className="text-gray-500 text-sm mb-4">Create your first project to get started</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <AlertDialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Create New Project</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Organize your email services and templates with a new project.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-white">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Campaigns"
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this project for?"
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Project Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-md transition-all ${
                      formData.color === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateProject}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Project Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Edit Project</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Update your project details.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-white">Project Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Campaigns"
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-white">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this project for?"
                className="mt-1 bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">Project Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-8 h-8 rounded-md transition-all ${
                      formData.color === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditProject}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete <span className="font-semibold text-white">{selectedProject?.name}</span>? 
              This action cannot be undone. All associated email services and templates will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
