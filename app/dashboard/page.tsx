'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Server,
  Calendar,
  Eye,
  BarChart3,
  Plus,
  ArrowRight,
  Activity,
  MousePointer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { emailAPI, templateAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// Animated Counter Component
function AnimatedCounter({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function DashboardPage() {
  interface EmailSummary {
    id: string;
    status: string;
    subject?: string;
    to_email?: string;
    sent_at?: string;
    created_at: string;
    opened_at?: string | null;
    clicked_at?: string | null;
  }

  interface TemplateSummary {
    id: string;
    name: string;
    subject?: string;
    description?: string;
    updated_at: string;
  }

  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    opens: 0,
    clicks: 0,
  });
  const [recentEmails, setRecentEmails] = useState<EmailSummary[]>([]);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [allEmailsRes, recentEmailsRes, templatesRes] = await Promise.all([
        emailAPI.history(), // Fetch ALL emails for stats calculation
        emailAPI.history({ limit: 10 }), // Fetch recent 10 for display
        templateAPI.list({ limit: 4, is_active: true }),
      ]);

      setRecentEmails(recentEmailsRes.data.data || []);
      setTemplates(templatesRes.data.data || []);

      // Calculate stats from ALL emails, not just recent 10
      const allEmails: EmailSummary[] = allEmailsRes.data.data || [];
      
      const newStats = {
        totalSent: allEmails.length,
        delivered: allEmails.filter((email) => email.status === 'delivered' || email.status === 'sent').length,
        failed: allEmails.filter((email) => email.status === 'failed' || email.status === 'bounced').length,
        pending: allEmails.filter((email) => email.status === 'queued' || email.status === 'pending').length,
        opens: allEmails.filter((email) => email.opened_at).length,
        clicks: allEmails.filter((email) => email.clicked_at).length,
      };

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Open Rate',
      value: `${stats.totalSent > 0 ? Math.round((stats.opens / stats.totalSent) * 100) : 0}%`,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  ];

  const quickActions = [
    {
      title: 'Send Email',
      description: 'Compose and send new email',
      icon: Send,
      href: '/dashboard/send',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Create Template',
      description: 'Design email template',
      icon: FileText,
      href: '/dashboard/templates/new',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
    },
    {
      title: 'View Analytics',
      description: 'Track performance',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500',
    },
    {
      title: 'Manage Services',
      description: 'Configure SMTP',
      icon: Server,
      href: '/dashboard/services',
      color: 'from-orange-500/20 to-red-500/20',
      iconColor: 'text-orange-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: LucideIcon }> = {
      delivered: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Delivered', icon: CheckCircle2 },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Failed', icon: XCircle },
      queued: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Queued', icon: Clock },
      sent: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'Sent', icon: Send },
    };
    const badge = badges[status] || badges.sent;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-4xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-[0_24px_90px_-40px_rgba(0,0,0,0.8)] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                <Activity className="h-3.5 w-3.5" />
                Command center
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                Welcome back, {user?.first_name || 'User'}!
              </h1>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">Here&apos;s what&apos;s happening with your email campaigns today.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="rounded-2xl border-border/70 bg-accent/20 text-foreground hover:bg-accent/40">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 days
            </Button>
            <Link href="/dashboard/send">
              <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="rounded-4xl bg-card/90 border border-border/70 backdrop-blur-xl hover:border-primary/20 transition-all group shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/70">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-10 h-10 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {typeof stat.value === 'number' ? <AnimatedCounter target={stat.value} /> : stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
              >
                <Card className="rounded-4xl bg-card/90 border border-border/70 backdrop-blur-xl hover:border-primary/20 transition-all cursor-pointer group h-full shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-2xl ${action.iconColor.replace('text-', 'bg-').replace('500', '500/10')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Get started</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Emails */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="rounded-4xl bg-card/90 border border-border/70 backdrop-blur-xl h-full shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                  <CardDescription className="text-muted-foreground">Your latest email sends</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-2xl">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEmails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                    <Link href="/dashboard/send">
                      <Button variant="link" className="text-primary mt-2">
                        Send your first email
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentEmails.slice(0, 5).map((email, index) => (
                    <Link key={email.id} href={`/dashboard/emails/${email.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className="flex items-start gap-4 p-3 rounded-2xl bg-accent/20 hover:bg-accent/30 transition-colors border border-border/70 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{email.subject || 'No Subject'}</h4>
                            {getStatusBadge(email.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">To: {email.to_email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(email.sent_at || email.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {email.opened_at && (
                              <span className="flex items-center gap-1 text-xs text-purple-400">
                                <Eye className="h-3 w-3" />
                                Opened
                              </span>
                            )}
                            {email.clicked_at && (
                              <span className="flex items-center gap-1 text-xs text-blue-400">
                                <MousePointer className="h-3 w-3" />
                                Clicked
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="rounded-4xl bg-card/90 border border-border/70 backdrop-blur-xl h-full shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Your Templates</CardTitle>
                  <CardDescription className="text-muted-foreground">Quick access to templates</CardDescription>
                </div>
                <Link href="/dashboard/templates">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-2xl">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No templates yet</p>
                    <Link href="/dashboard/templates/new">
                      <Button variant="link" className="text-primary mt-2">
                        Create your first template
                      </Button>
                    </Link>
                  </div>
                ) : (
                  templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    >
                      <Link href={`/dashboard/templates/${template.id}/edit`}>
                        <div className="flex items-start gap-4 p-3 rounded-2xl bg-accent/20 hover:bg-accent/30 transition-all border border-border/70 hover:border-primary/20 group cursor-pointer">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{template.subject || 'No subject'}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                Updated {new Date(template.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
          <Card className="rounded-4xl bg-card/90 border border-border/70 backdrop-blur-xl shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)]">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="text-foreground">Performance Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/20 border border-border/70">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalSent > 0 ? Math.round((stats.delivered / stats.totalSent) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/20 border border-border/70">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalSent > 0 ? Math.round((stats.opens / stats.totalSent) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/20 border border-border/70">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalSent > 0 ? Math.round((stats.clicks / stats.totalSent) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
