'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emailServiceAPI } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { EmailService, PROVIDER_METADATA } from '@/types/email-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Star,
  TestTube,
  AlertCircle,
  Mail,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
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
import { EmailServiceModalNew } from '@/components/email-service-modal-new';
import { EditEmailServiceModal } from '@/components/edit-email-service-modal';
import { TestServiceModal } from '@/components/test-service-modal';
import { ProviderLogo } from '@/components/provider-logo';

export default function EmailServicesPage() {
  const [services, setServices] = useState<EmailService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EmailService | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testingService, setTestingService] = useState<EmailService | null>(null);
  const { toast } = useToast();
  const { currentProject } = useProjectStore();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = currentProject ? { project_id: currentProject.id } : {};
      const response = await emailServiceAPI.list(params);
      setServices(response.data.services || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch email services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [currentProject]);

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await emailServiceAPI.delete(serviceToDelete);
      toast({
        title: 'Success',
        description: 'Email service deleted successfully',
      });
      fetchServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete email service',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await emailServiceAPI.setDefault(id);
      toast({
        title: 'Success',
        description: 'Default email service updated',
      });
      fetchServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to set default service',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (service: EmailService) => {
    setEditingService(service);
    setEditModalOpen(true);
  };

  const handleTest = (service: EmailService) => {
    setTestingService(service);
    setTestModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-white/10 text-white/60 border-white/20">
            Inactive
          </Badge>
        );
      default:
        return <Badge className="bg-white/10 text-white/60 border-white/20">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[oklch(65%_0.19_145)]"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold mb-2">Email Services</h1>
            <p className="text-white/60">Manage your email service providers and configurations</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3 rounded-lg bg-[oklch(65%_0.19_145)] hover:bg-[oklch(60%_0.19_145)] 
                     transition-all flex items-center gap-2 shadow-lg hover:shadow-xl w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Services',
              value: services.length,
              icon: Mail,
              color: 'from-blue-500/20 to-blue-600/20',
            },
            {
              title: 'Active',
              value: services.filter(s => s.status === 'active').length,
              icon: CheckCircle,
              color: 'from-green-500/20 to-green-600/20',
            },
            {
              title: 'With Errors',
              value: services.filter(s => s.status === 'error').length,
              icon: AlertCircle,
              color: 'from-red-500/20 to-red-600/20',
            },
            {
              title: 'Default Set',
              value: services.filter(s => s.is_default).length,
              icon: Star,
              color: 'from-yellow-500/20 to-yellow-600/20',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/10">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <Settings className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No email services configured</h3>
                <p className="text-white/60 text-center mb-6 max-w-md">
                  Add your first email service provider to start sending emails. We support SMTP, SendGrid, Mailgun, and more.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-8 py-3 rounded-lg bg-[oklch(65%_0.19_145)] hover:bg-[oklch(60%_0.19_145)] 
                           transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Service
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {services.map((service, index) => {
                const metadata = PROVIDER_METADATA[service.provider];
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                      {/* Default Badge */}
                      {service.is_default && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Default
                          </Badge>
                        </div>
                      )}
                      
                      {/* Header */}
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-3 rounded-lg group-hover:scale-105 transition-transform"
                            style={{ 
                              backgroundColor: `${service.provider_color || metadata?.color}15`,
                              color: service.provider_color || metadata?.color 
                            }}
                          >
                            <ProviderLogo 
                              provider={service.provider} 
                              className="w-8 h-8"
                            />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{service.name}</CardTitle>
                            <CardDescription className="text-white/50">{metadata?.name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                          <span className="text-sm text-white/60">Status</span>
                          {getStatusBadge(service.status)}
                        </div>

                        {/* Config Preview */}
                        {service.config_preview && (
                          <div className="space-y-2 p-3 rounded-lg bg-white/5">
                            {Object.entries(service.config_preview).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-white/60 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono text-xs text-white/80">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Error Message */}
                        {service.last_error && (
                          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-300">{service.last_error}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleTest(service)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                     transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <TestTube className="w-4 h-4" />
                            Test
                          </button>
                          
                          <button
                            onClick={() => handleEdit(service)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                                     transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Settings className="w-4 h-4" />
                            Edit
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {!service.is_default && (
                            <button
                              onClick={() => handleSetDefault(service.id)}
                              className="flex-1 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 
                                       border border-yellow-500/30 transition-all flex items-center justify-center gap-2 text-sm text-yellow-400"
                            >
                              <Star className="w-4 h-4" />
                              Set Default
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setServiceToDelete(service.id);
                              setDeleteDialogOpen(true);
                            }}
                            className={`px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 
                                     transition-all flex items-center justify-center gap-2 text-sm text-red-400
                                     ${service.is_default ? 'flex-1' : ''}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          )}
      </div>

      {/* Modals */}
      <EmailServiceModalNew
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
        }}
        onSuccess={() => {
          fetchServices();
          setCreateModalOpen(false);
        }}
      />

      <EditEmailServiceModal
        open={editModalOpen}
        service={editingService}
        onClose={() => {
          setEditModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={() => {
          fetchServices();
          setEditModalOpen(false);
          setEditingService(null);
        }}
      />

      <TestServiceModal
        open={testModalOpen}
        onClose={() => {
          setTestModalOpen(false);
          setTestingService(null);
        }}
        service={testingService}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the email service configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
