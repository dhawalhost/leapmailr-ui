'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { emailAPI } from '@/lib/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Calendar,
  RefreshCw,
  Eye,
  MousePointer,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';

interface EmailMetrics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_failed: number;
  total_pending: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

interface ChartDataPoint {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

interface TemplateStats {
  template_id: string;
  template_name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  open_rate: number;
  click_rate: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [metrics, setMetrics] = useState<EmailMetrics>({
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    total_failed: 0,
    total_pending: 0,
    delivery_rate: 0,
    open_rate: 0,
    click_rate: 0,
    bounce_rate: 0,
  });
  
  const [emailData, setEmailData] = useState<ChartDataPoint[]>([]);
  const [templatePerformance, setTemplatePerformance] = useState<TemplateStats[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch email history
      const response = await emailAPI.history();
      const emails = response.data.data || [];

      // Calculate overall metrics
      const sent = emails.length;
      const delivered = emails.filter((e: any) => e.status === 'delivered' || e.status === 'sent').length;
      const opened = emails.filter((e: any) => e.opened_at).length;
      const clicked = emails.filter((e: any) => e.clicked_at).length;
      const failed = emails.filter((e: any) => e.status === 'failed' || e.status === 'bounced').length;
      const pending = emails.filter((e: any) => e.status === 'queued' || e.status === 'pending').length;

      setMetrics({
        total_sent: sent,
        total_delivered: delivered,
        total_opened: opened,
        total_clicked: clicked,
        total_failed: failed,
        total_pending: pending,
        delivery_rate: sent > 0 ? (delivered / sent) * 100 : 0,
        open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
        click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
        bounce_rate: sent > 0 ? (failed / sent) * 100 : 0,
      });

      // Generate chart data based on time range
      let days = 7;
      if (timeRange === '24h') days = 1;
      else if (timeRange === '7d') days = 7;
      else if (timeRange === '30d') days = 30;
      else if (timeRange === '90d') days = 90;

      const chartDataArr: ChartDataPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEmails = emails.filter((e: any) => {
          const emailDate = new Date(e.created_at).toISOString().split('T')[0];
          return emailDate === dateStr;
        });

        chartDataArr.push({
          date: timeRange === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit' }) : dateStr,
          sent: dayEmails.length,
          delivered: dayEmails.filter((e: any) => e.status === 'delivered' || e.status === 'sent').length,
          opened: dayEmails.filter((e: any) => e.opened_at).length,
          clicked: dayEmails.filter((e: any) => e.clicked_at).length,
        });
      }
      setEmailData(chartDataArr);

      // Status distribution
      setStatusData([
        { name: 'Delivered', value: delivered, color: '#22c55e' },
        { name: 'Failed', value: failed, color: '#ef4444' },
        { name: 'Pending', value: pending, color: '#f59e0b' },
      ]);

      // Template performance
      const templateMap = new Map<string, any>();
      emails.forEach((email: any) => {
        if (!email.template_id) return;
        
        const key = email.template_id;
        if (!templateMap.has(key)) {
          templateMap.set(key, {
            template_id: email.template_id,
            template_name: email.template?.name || 'Unknown Template',
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
          });
        }
        
        const stats = templateMap.get(key);
        stats.sent++;
        if (email.status === 'delivered' || email.status === 'sent') stats.delivered++;
        if (email.opened_at) stats.opened++;
        if (email.clicked_at) stats.clicked++;
      });

      const templateStats = Array.from(templateMap.values()).map((t) => ({
        ...t,
        open_rate: t.delivered > 0 ? (t.opened / t.delivered) * 100 : 0,
        click_rate: t.opened > 0 ? (t.clicked / t.opened) * 100 : 0,
      }));
      
      setTemplatePerformance(templateStats.sort((a, b) => b.sent - a.sent).slice(0, 10));

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Generate CSV from metrics and email data
    if (format === 'csv') {
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Sent', metrics.total_sent],
        ['Total Delivered', metrics.total_delivered],
        ['Total Opened', metrics.total_opened],
        ['Total Clicked', metrics.total_clicked],
        ['Delivery Rate', `${metrics.delivery_rate.toFixed(2)}%`],
        ['Open Rate', `${metrics.open_rate.toFixed(2)}%`],
        ['Click Rate', `${metrics.click_rate.toFixed(2)}%`],
        [''],
        ['Template', 'Sent', 'Open Rate', 'Click Rate'],
        ...templatePerformance.map(t => [t.template_name, t.sent, `${t.open_rate.toFixed(1)}%`, `${t.click_rate.toFixed(1)}%`])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('PDF export coming soon!');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-white/60">Track your email campaign performance</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                       transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => exportData('csv')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
                       transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10 w-fit"
        >
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-md transition-all ${
                timeRange === range
                  ? 'bg-[oklch(65%_0.19_145)] text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : 
               range === '7d' ? 'Last 7 Days' :
               range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[oklch(65%_0.19_145)]" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Sent',
                  value: metrics.total_sent.toLocaleString(),
                  icon: Send,
                  color: 'from-blue-500/20 to-blue-600/20',
                },
                {
                  title: 'Delivered',
                  value: metrics.total_delivered.toLocaleString(),
                  subtitle: `${metrics.delivery_rate.toFixed(1)}% rate`,
                  icon: CheckCircle2,
                  color: 'from-green-500/20 to-green-600/20',
                },
                {
                  title: 'Opened',
                  value: metrics.total_opened.toLocaleString(),
                  subtitle: `${metrics.open_rate.toFixed(1)}% rate`,
                  icon: Eye,
                  color: 'from-purple-500/20 to-purple-600/20',
                },
                {
                  title: 'Clicked',
                  value: metrics.total_clicked.toLocaleString(),
                  subtitle: `${metrics.click_rate.toFixed(1)}% rate`,
                  icon: MousePointer,
                  color: 'from-orange-500/20 to-orange-600/20',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                    <CardContent className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-white/10">
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-white/60">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.subtitle && (
                          <p className="text-xs text-white/40">{stat.subtitle}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">Email Activity</h3>
                        <p className="text-sm text-white/60">Daily email metrics over time</p>
                      </div>
                      <LineChart className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={emailData}>
                          <defs>
                            <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(65% 0.19 145)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="oklch(65% 0.19 145)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="delivered" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.4)" 
                            tick={{ fill: 'rgba(255,255,255,0.6)' }}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.4)" 
                            tick={{ fill: 'rgba(255,255,255,0.6)' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0,0,0,0.8)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sent" 
                            stroke="oklch(65% 0.19 145)" 
                            fillOpacity={1} 
                            fill="url(#sent)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="delivered" 
                            stroke="#22c55e" 
                            fillOpacity={1} 
                            fill="url(#delivered)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="opened" 
                            stroke="#a855f7" 
                            fillOpacity={1} 
                            fill="url(#opened)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Delivery Status Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Delivery Status</h3>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0,0,0,0.8)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Template Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Top Template Performance</h3>
                  {templatePerformance.length > 0 ? (
                    <div className="space-y-4">
                      {templatePerformance.map((template) => (
                        <div key={template.template_id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{template.template_name}</h4>
                            <span className="text-sm text-white/60">{template.sent} sent</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-white/60">Delivered</p>
                              <p className="font-semibold">{template.delivered}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Open Rate</p>
                              <p className="font-semibold text-green-400">{template.open_rate.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-white/60">Click Rate</p>
                              <p className="font-semibold text-blue-400">{template.click_rate.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/40">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No template data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}