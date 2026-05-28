'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/lib/store';
import { getAPIErrorMessage, projectAPI } from '@/lib/api';
import { Project, CreateProjectRequest } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

export function ProjectSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6');
  const [isCreating, setIsCreating] = useState(false);
  
  const { currentProject, projects, setCurrentProject, setProjects, setLoading } = useProjectStore();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectAPI.list();
      setProjects(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: getAPIErrorMessage(error, 'Failed to load projects'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects, toast]);

  useEffect(() => {
    if (mounted) {
      fetchProjects();
    }
  }, [fetchProjects, mounted]);

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setOpen(false);
    toast({
      title: 'Project switched',
      description: `Now viewing ${project.name}`,
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const data: CreateProjectRequest = {
        name: newProjectName,
        description: newProjectDescription || undefined,
        color: newProjectColor,
        is_default: false,
      };

      await projectAPI.create(data);
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });

      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectColor('#3b82f6');
      setCreateDialogOpen(false);
      
      // Refresh projects list
      await fetchProjects();
    } catch (error) {
      toast({
        title: 'Error',
        description: getAPIErrorMessage(error, 'Failed to create project'),
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          className="w-[250px] justify-between bg-card/90 border-border/70"
          disabled
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full shrink-0 bg-muted-foreground" />
            <span className="truncate text-muted-foreground">Loading...</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between bg-card/90 border-border/70 hover:bg-accent/40"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: currentProject?.color || '#3b82f6' }}
            />
            <span className="truncate">
              {currentProject?.name || 'Select project...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-[250px] z-50 bg-card/95 border border-border/70 rounded-xl shadow-lg backdrop-blur-xl">
              <div className="p-2 space-y-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/40 text-left transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 truncate text-foreground">{project.name}</span>
                    {currentProject?.id === project.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
                <div className="border-t border-border/70 my-1" />
                <button
                  onClick={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/40 text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create project</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <AlertDialogContent className="bg-card/95 border-border/70 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Create New Project</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Create a new project to organize your email services and templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Project Name</Label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Project"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">Description (optional)</Label>
              <Input
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Project description..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color" className="text-gray-200">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={newProjectColor}
                  onChange={(e) => setNewProjectColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-700 cursor-pointer"
                />
                <Input
                  value={newProjectColor}
                  onChange={(e) => setNewProjectColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateProject}
              disabled={isCreating || !newProjectName.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
