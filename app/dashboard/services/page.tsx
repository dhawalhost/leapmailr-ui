'use client';

import { useState, useEffect } from 'react';
import { emailServiceAPI } from '@/lib/api';
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
  AlertCircle
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
import { TestServiceModal } from '@/components/test-service-modal';

export default function EmailServicesPage() {
  const [services, setServices] = useState<EmailService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EmailService | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testingService, setTestingService] = useState<EmailService | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await emailServiceAPI.list();
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
  }, []);

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
    setModalOpen(true);
  };

  const handleTest = (service: EmailService) => {
    setTestingService(service);
    setTestModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Services</h1>
          <p className="text-muted-foreground mt-2">
            Manage your email service providers and configurations
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No email services configured</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Add your first email service provider to start sending emails. We support SMTP, SendGrid, Mailgun, and more.
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const metadata = PROVIDER_METADATA[service.provider];
            return (
              <Card key={service.id} className="relative">
                {service.is_default && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{metadata?.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{metadata?.name}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(service.status)}
                  </div>

                  {service.config_preview && (
                    <div className="space-y-2">
                      {Object.entries(service.config_preview).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-mono text-xs">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {service.last_error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600">{service.last_error}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTest(service)}
                    >
                      <TestTube className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(service)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {!service.is_default && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSetDefault(service.id)}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Set Default
                      </Button>
                    )}
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className={service.is_default ? 'flex-1' : ''}
                      onClick={() => {
                        setServiceToDelete(service.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EmailServiceModalNew
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        onSuccess={() => {
          fetchServices();
          setModalOpen(false);
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the email service configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
