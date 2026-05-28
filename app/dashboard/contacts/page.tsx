'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { contactsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Download, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Tag,
  Trash2,
  Edit,
  Filter,
  X,
  Check
} from 'lucide-react';

interface Contact {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  source: string;
  metadata: Record<string, string>;
  tags: string[];
  is_subscribed: boolean;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

interface ContactStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  new_this_month: number;
}

interface ImportedContact {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  tags?: string[];
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

async function parseImportedContacts(file: File): Promise<ImportedContact[]> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one contact row.');
  }

  const headers = parseCSVLine(lines[0]).map((header) => header.toLowerCase());
  const emailIndex = headers.indexOf('email');
  if (emailIndex === -1) {
    throw new Error('CSV file must include an email column.');
  }

  const nameIndex = headers.indexOf('name');
  const phoneIndex = headers.indexOf('phone');
  const companyIndex = headers.indexOf('company');
  const tagsIndex = headers.indexOf('tags');

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      return {
        email: values[emailIndex] || '',
        name: nameIndex >= 0 ? values[nameIndex] || '' : '',
        phone: phoneIndex >= 0 ? values[phoneIndex] || '' : '',
        company: companyIndex >= 0 ? values[companyIndex] || '' : '',
        tags: tagsIndex >= 0 ? (values[tagsIndex] || '').split(/[;,]/).map((tag) => tag.trim()).filter(Boolean) : [],
      };
    })
    .filter((contact) => contact.email);
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterSubscribed, setFilterSubscribed] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [newContact, setNewContact] = useState({
    email: '',
    name: '',
    phone: '',
    company: '',
    tags: [] as string[],
    metadata: {} as Record<string, string>,
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.list({
        search: searchQuery || undefined,
        source: filterSource || undefined,
        subscribed: filterSubscribed ?? undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      });
      setContacts(response.data.contacts || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filterSource, filterSubscribed, searchQuery, selectedTags, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await contactsAPI.stats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    void fetchContacts();
    void fetchStats();
  }, [fetchContacts, fetchStats]);

  const createContact = async () => {
    try {
      await contactsAPI.create(newContact);

      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });

      setShowCreateModal(false);
      setNewContact({
        email: '',
        name: '',
        phone: '',
        company: '',
        tags: [],
        metadata: {},
      });
      await fetchContacts();
      await fetchStats();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create contact',
        variant: 'destructive',
      });
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      await contactsAPI.update(id, {
        name: updates.name,
        phone: updates.phone,
        company: updates.company,
        metadata: updates.metadata,
        tags: updates.tags,
        is_subscribed: updates.is_subscribed,
      });

      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });

      setEditingContact(null);
      await fetchContacts();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive',
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await contactsAPI.delete(id);

      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });

      await fetchContacts();
      await fetchStats();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      });
    }
  };

  const importContacts = async () => {
    if (!importFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const contacts = await parseImportedContacts(importFile);
      if (contacts.length === 0) {
        throw new Error('No contacts found in the CSV file.');
      }

      const response = await contactsAPI.import({ contacts, source: 'import' });
      const data = response.data;
      toast({
        title: 'Success',
        description: `Imported ${data.imported} contacts successfully`,
      });

      setShowImportModal(false);
      setImportFile(null);
      await fetchContacts();
      await fetchStats();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: axios.isAxiosError(error) ? error.response?.data?.error || 'Failed to import contacts' : error instanceof Error ? error.message : 'Failed to import contacts',
        variant: 'destructive',
      });
    }
  };

  const exportContacts = async () => {
    try {
      const response = await contactsAPI.export({
        search: searchQuery || undefined,
        source: filterSource || undefined,
        subscribed: filterSubscribed ?? undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Contacts exported successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to export contacts',
        variant: 'destructive',
      });
    }
  };

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  const allSources = Array.from(new Set(contacts.map(c => c.source).filter(Boolean)));

  return (
    <div className="p-8 space-y-8 pb-10">
      {/* Header */}
      <div className="rounded-4xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_24px_90px_-40px_rgba(0,0,0,0.8)] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Users className="h-3.5 w-3.5" />
              Audience manager
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Contacts</h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">Manage subscribers, imports, and contact activity in a cleaner workspace with quicker filtering and review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowImportModal(true)} variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={exportContacts} variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-2xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-medium">Subscribed</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subscribed}</div>
            </CardContent>
          </Card>
          <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
              <X className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unsubscribed}</div>
            </CardContent>
          </Card>
          <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_this_month}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-2xl bg-black/20 border-white/10"
                />
              </div>
            </div>
            <div>
              <Label>Source</Label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl border border-white/10 bg-black/20"
              >
                <option value="">All Sources</option>
                {allSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subscription</Label>
              <select
                value={filterSubscribed === null ? '' : filterSubscribed.toString()}
                onChange={(e) => setFilterSubscribed(e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full h-10 px-3 rounded-2xl border border-white/10 bg-black/20"
              >
                <option value="">All</option>
                <option value="true">Subscribed</option>
                <option value="false">Unsubscribed</option>
              </select>
            </div>
            <div>
              <Label>Tags</Label>
              <select
                multiple
                value={selectedTags}
                onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full h-10 px-3 rounded-2xl border border-white/10 bg-black/20"
              >
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card className="rounded-4xl bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
        <CardHeader className="border-b border-white/5">
          <CardTitle>Contact List</CardTitle>
          <CardDescription>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-white/60">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contacts found. Add your first contact to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-4xl border border-white/10 bg-white/5 p-4 hover:shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)] transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{contact.name || 'No Name'}</h3>
                        {contact.is_subscribed ? (
                          <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                            <Check className="w-3 h-3 mr-1" />
                            Subscribed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10">
                            <X className="w-3 h-3 mr-1" />
                            Unsubscribed
                          </Badge>
                        )}
                        {contact.submission_count > 1 && (
                          <Badge variant="secondary">
                            {contact.submission_count} submissions
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            {contact.company}
                          </div>
                        )}
                        {contact.source && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="w-4 h-4" />
                            Source: {contact.source}
                          </div>
                        )}
                      </div>

                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {contact.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="bg-white/5 border-white/10">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                        onClick={() => setEditingContact(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-2xl"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 rounded-4xl bg-gray-950 border border-white/10 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.9)]">
            <CardHeader className="border-b border-white/5">
              <CardTitle>Add New Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+1234567890"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  placeholder="Company Name"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createContact} disabled={!newContact.email}>
                  Create Contact
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 rounded-4xl bg-gray-950 border border-white/10 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.9)]">
            <CardHeader className="border-b border-white/5">
              <CardTitle>Import Contacts</CardTitle>
              <CardDescription>
                Upload a CSV file with columns: email, name, phone, company, tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>CSV File</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={importContacts} disabled={!importFile}>
                  Import
                </Button>
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 rounded-4xl bg-gray-950 border border-white/10 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.9)]">
            <CardHeader className="border-b border-white/5">
              <CardTitle>Edit Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editingContact.phone}
                  onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={editingContact.company}
                  onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
                  className="rounded-2xl bg-black/20 border-white/10"
                />
              </div>
              <div>
                <Label>Subscription Status</Label>
                <select
                  value={editingContact.is_subscribed.toString()}
                  onChange={(e) => setEditingContact({ ...editingContact, is_subscribed: e.target.value === 'true' })}
                  className="w-full h-10 px-3 rounded-2xl border border-white/10 bg-black/20"
                >
                  <option value="true">Subscribed</option>
                  <option value="false">Unsubscribed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateContact(editingContact.id, editingContact)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingContact(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
