'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    opens: 0,
    clicks: 0,
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
        emailAPI.history({ limit: 10 }),
        templateAPI.list({ limit: 4, is_active: true }),
      ]);

      setRecentEmails(emailsRes.data.data || []);
      setTemplates(templatesRes.data.data || []);

      // Calculate stats from actual email data
      const emails = emailsRes.data.data || [];
      const newStats = {
        totalSent: emails.length,
        delivered: emails.filter((e: any) => e.status === 'delivered').length,
        failed: emails.filter((e: any) => e.status === 'failed').length,
        pending: emails.filter((e: any) => e.status === 'queued' || e.status === 'sent').length,
        opens: emails.filter((e: any) => e.opened_at).length,
        clicks: emails.filter((e: any) => e.clicked_at).length,
      };
      setStats(newStats);
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
    const badges: Record<string, { color: string; text: string; icon: any }> = {
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
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || 'User'}! 👋
            </h1>
            <p className="text-gray-400">Here's what's happening with your email campaigns today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 days
            </Button>
            <Link href="/dashboard/send">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                <Plus className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </Link>
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
            <Card className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:${stat.borderColor} transition-all group`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
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
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
              >
                <Card className={`bg-gradient-to-br ${action.color} from-gray-800/30 to-gray-900/30 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all cursor-pointer group h-full`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${action.iconColor.replace('text-', 'bg-').replace('500', '500/10')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-primary transition-colors">
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
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your latest email sends</CardDescription>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEmails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
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
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-700/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{email.subject || 'No Subject'}</h4>
                          {getStatusBadge(email.status)}
                        </div>
                        <p className="text-sm text-gray-400 truncate">To: {email.to_email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(email.sent_at || email.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
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
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Your Templates</CardTitle>
                  <CardDescription className="text-gray-400">Quick access to templates</CardDescription>
                </div>
                <Link href="/dashboard/templates">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
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
                        <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/30 hover:border-primary/30 group cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-400 truncate">{template.subject || 'No subject'}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                Updated {new Date(template.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
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
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Performance Overview</CardTitle>
            <CardDescription className="text-gray-400">Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Delivery Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSent > 0 ? Math.round((stats.delivered / stats.totalSent) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Open Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalSent > 0 ? Math.round((stats.opens / stats.totalSent) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Click Rate</p>
                  <p className="text-2xl font-bold text-white">
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
