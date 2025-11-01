'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Send,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { emailAPI, templateAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
  });
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [emailsRes, templatesRes] = await Promise.all([
        emailAPI.history({ limit: 5 }),
        templateAPI.list({ limit: 3, is_active: true }),
      ]);

      setRecentEmails(emailsRes.data.data || []);
      setTemplates(templatesRes.data.data || []);

      // Calculate stats from recent emails (in production, use dedicated analytics endpoint)
      const emails = emailsRes.data.data || [];
      const stats = {
        totalSent: emails.length,
        delivered: emails.filter((e: any) => e.status === 'delivered').length,
        failed: emails.filter((e: any) => e.status === 'failed').length,
        pending: emails.filter((e: any) => e.status === 'queued' || e.status === 'sent').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: Send,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your emails today.
          </p>
        </div>
        <Link href="/dashboard/send">
          <Button size="lg" className="w-full sm:w-auto">
            <Zap className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {index === 0 && '+20% from last month'}
                  {index === 1 && '99.5% delivery rate'}
                  {index === 2 && '-50% from last month'}
                  {index === 3 && 'Processing now'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Emails */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Emails</CardTitle>
                  <CardDescription>Your latest email activity</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentEmails.length > 0 ? (
                <div className="space-y-3">
                  {recentEmails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          email.status === 'delivered' ? 'bg-green-500/10' :
                          email.status === 'failed' ? 'bg-red-500/10' :
                          'bg-yellow-500/10'
                        }`}>
                          <Mail className={`h-4 w-4 ${
                            email.status === 'delivered' ? 'text-green-500' :
                            email.status === 'failed' ? 'text-red-500' :
                            'text-yellow-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{email.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            To: {email.to_email}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        email.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                        email.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {email.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No emails sent yet</p>
                  <Link href="/dashboard/send">
                    <Button variant="link" size="sm" className="mt-2">
                      Send your first email
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Templates</CardTitle>
                  <CardDescription>Quick access to your email templates</CardDescription>
                </div>
                <Link href="/dashboard/templates">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{template.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/send?template=${template.id}`}>
                        <Button variant="ghost" size="sm">
                          Use
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No templates created yet</p>
                  <Link href="/dashboard/templates">
                    <Button variant="link" size="sm" className="mt-2">
                      Create your first template
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/send" className="group">
                <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <Send className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">Send Email</h3>
                  <p className="text-sm text-muted-foreground">Send a new email</p>
                </div>
              </Link>
              <Link href="/dashboard/templates" className="group">
                <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <FileText className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">Create Template</h3>
                  <p className="text-sm text-muted-foreground">Design email templates</p>
                </div>
              </Link>
              <Link href="/dashboard/analytics" className="group">
                <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <TrendingUp className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance</p>
                </div>
              </Link>
              <Link href="/dashboard/settings" className="group">
                <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <Mail className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium">API Keys</h3>
                  <p className="text-sm text-muted-foreground">Manage integrations</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}