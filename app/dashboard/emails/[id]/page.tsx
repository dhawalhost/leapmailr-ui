'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { emailAPI, analyticsAPI } from '@/lib/api';
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Calendar,
  User,
  Link as LinkIcon,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface EmailDetails {
  id: string;
  to_email: string;
  to_name?: string;
  from_email: string;
  from_name?: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  template?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
  };
}

interface EmailAnalytics {
  email_log_id: string;
  total_opens: number;
  unique_opens: number;
  total_clicks: number;
  unique_clicks: number;
  first_opened_at?: string;
  last_opened_at?: string;
  first_clicked_at?: string;
  last_clicked_at?: string;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  device_breakdown: Record<string, number>;
  email_client_breakdown: Record<string, number>;
  top_links: Array<{
    link_url: string;
    link_text?: string;
    total_clicks: number;
    unique_clicks: number;
  }>;
}

interface TrackingEvent {
  id: string;
  ip_address: string;
  user_agent: string;
  device?: string;
  email_client?: string;
  location?: string;
  opened_at?: string;
  clicked_at?: string;
  link_url?: string;
}

export default function EmailDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const emailId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<EmailDetails | null>(null);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    loadEmailDetails();
  }, [emailId]);

  const loadEmailDetails = async () => {
    try {
      setLoading(true);
      
      // Load email details
      const emailResponse = await emailAPI.getStatus(emailId);
      const emailData = emailResponse.data.data;
      setEmail(emailData);

      // Try to load analytics (may not exist if tracking wasn't enabled)
      try {
        const analyticsResponse = await analyticsAPI.getEmailAnalytics(emailId);
        setAnalytics(analyticsResponse.data.data);
        
        // Load tracking events
        const eventsResponse = await analyticsAPI.getEmailTrackingEvents(emailId);
        setEvents(eventsResponse.data.data?.open_events || []);
      } catch (err) {
        console.log('No tracking data available for this email');
        setAnalyticsError(true);
      }
    } catch (error) {
      console.error('Failed to load email details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'opened':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'clicked':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
      case 'bounced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'queued':
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[oklch(65%_0.19_145)]" />
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-white/60">Email not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Email Details</h1>
              <p className="text-white/60">Track email delivery and engagement</p>
            </div>
          </div>

          <Badge className={`${getStatusColor(email.status)} border px-4 py-2`}>
            {email.status.toUpperCase()}
          </Badge>
        </motion.div>

        {/* Email Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-white/60 mb-1">Subject</p>
                  <p className="text-white font-medium">{email.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">To</p>
                    <p className="text-white">{email.to_name || email.to_email}</p>
                    {email.to_name && (
                      <p className="text-sm text-white/40">{email.to_email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">From</p>
                    <p className="text-white">{email.from_name || email.from_email}</p>
                    {email.from_name && (
                      <p className="text-sm text-white/40">{email.from_email}</p>
                    )}
                  </div>
                </div>

                {email.template && (
                  <div>
                    <p className="text-sm text-white/60 mb-1">Template</p>
                    <p className="text-white">{email.template.name}</p>
                  </div>
                )}

                {email.service && (
                  <div>
                    <p className="text-sm text-white/60 mb-1">Email Service</p>
                    <p className="text-white">{email.service.name}</p>
                  </div>
                )}

                {email.error_message && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">{email.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm text-white/60">Created</p>
                    <p className="text-white text-sm">
                      {new Date(email.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {email.sent_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm text-white/60">Sent</p>
                      <p className="text-white text-sm">
                        {new Date(email.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {email.delivered_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm text-white/60">Delivered</p>
                      <p className="text-white text-sm">
                        {new Date(email.delivered_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {email.opened_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                    <div>
                      <p className="text-sm text-white/60">Opened</p>
                      <p className="text-white text-sm">
                        {new Date(email.opened_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {email.clicked_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm text-white/60">Clicked</p>
                      <p className="text-white text-sm">
                        {new Date(email.clicked_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analytics */}
        {analytics && !analyticsError && (
          <>
            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Opens',
                  value: analytics.total_opens,
                  subtitle: `${analytics.unique_opens} unique`,
                  icon: Eye,
                  color: 'from-purple-500/20 to-purple-600/20',
                },
                {
                  title: 'Total Clicks',
                  value: analytics.total_clicks,
                  subtitle: `${analytics.unique_clicks} unique`,
                  icon: MousePointer,
                  color: 'from-blue-500/20 to-blue-600/20',
                },
                {
                  title: 'Open Rate',
                  value: `${analytics.open_rate.toFixed(1)}%`,
                  icon: TrendingUp,
                  color: 'from-green-500/20 to-green-600/20',
                },
                {
                  title: 'Click Rate',
                  value: `${analytics.click_rate.toFixed(1)}%`,
                  subtitle: `${analytics.click_to_open_rate.toFixed(1)}% of opens`,
                  icon: Activity,
                  color: 'from-orange-500/20 to-orange-600/20',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                    <CardContent className="relative p-6">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-5 h-5 text-white/60" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-white/60">{stat.title}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-white/40 mt-1">{stat.subtitle}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Device & Client Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.keys(analytics.device_breakdown).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>Device Breakdown</CardTitle>
                      <CardDescription>Opens by device type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(analytics.device_breakdown).map(([device, count]) => {
                        const DeviceIcon = getDeviceIcon(device);
                        const total = Object.values(analytics.device_breakdown).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        
                        return (
                          <div key={device} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="w-4 h-4 text-primary" />
                                <span className="text-white">{device}</span>
                              </div>
                              <span className="text-white/60">{count}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {Object.keys(analytics.email_client_breakdown).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle>Email Clients</CardTitle>
                      <CardDescription>Opens by email client</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(analytics.email_client_breakdown).map(([client, count]) => {
                        const total = Object.values(analytics.email_client_breakdown).reduce((a, b) => a + b, 0);
                        const percentage = (count / total) * 100;
                        
                        return (
                          <div key={client} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span className="text-white">{client}</span>
                              </div>
                              <span className="text-white/60">{count}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Top Links */}
            {analytics.top_links && analytics.top_links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle>Top Clicked Links</CardTitle>
                    <CardDescription>Most popular links in this email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.top_links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-sm truncate">{link.link_url}</p>
                              {link.link_text && (
                                <p className="text-white/40 text-xs truncate">{link.link_text}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-white font-medium">{link.total_clicks}</p>
                              <p className="text-white/60 text-xs">{link.unique_clicks} unique</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {analyticsError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tracking Data</h3>
                <p className="text-white/60">
                  Email tracking was not enabled for this email. Enable tracking when sending emails to see engagement analytics.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
