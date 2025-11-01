'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';

// Mock data - replace with real API calls
const generateMockData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    sent: Math.floor(Math.random() * 1000) + 500,
    delivered: Math.floor(Math.random() * 900) + 400,
    opened: Math.floor(Math.random() * 600) + 200,
    clicked: Math.floor(Math.random() * 300) + 100,
  }));
};

const statusData = [
  { name: 'Delivered', value: 4567, color: '#22c55e' },
  { name: 'Failed', value: 234, color: '#ef4444' },
  { name: 'Pending', value: 123, color: '#f59e0b' },
];

const templatePerformance = [
  { name: 'Welcome Email', sent: 1200, opened: 850, clicked: 420 },
  { name: 'Newsletter', sent: 980, opened: 620, clicked: 280 },
  { name: 'Password Reset', sent: 450, opened: 380, clicked: 340 },
  { name: 'Order Confirmation', sent: 1500, opened: 1380, clicked: 890 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [emailData, setEmailData] = useState(generateMockData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading new data when time range changes
    setLoading(true);
    setTimeout(() => {
      setEmailData(generateMockData());
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const stats = [
    {
      title: 'Total Sent',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: Mail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Delivered',
      value: '11,897',
      change: '+8.2%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Failed',
      value: '234',
      change: '-3.1%',
      trend: 'down',
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Pending',
      value: '412',
      change: '+5.4%',
      trend: 'up',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  const exportData = () => {
    // Implement CSV export
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your email performance and insights
          </p>
        </div>
        <div className="flex gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Email Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Activity</CardTitle>
            <CardDescription>Sent, delivered, opened, and clicked over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={emailData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorSent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorDelivered)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>Distribution of email statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>Compare engagement across different email templates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={templatePerformance}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#8b5cf6" />
              <Bar dataKey="opened" fill="#22c55e" />
              <Bar dataKey="clicked" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Email engagement rates by template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Template</th>
                  <th className="text-right py-3 px-4 font-medium">Sent</th>
                  <th className="text-right py-3 px-4 font-medium">Open Rate</th>
                  <th className="text-right py-3 px-4 font-medium">Click Rate</th>
                  <th className="text-right py-3 px-4 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {templatePerformance.map((template, i) => (
                  <motion.tr
                    key={template.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 font-medium">{template.name}</td>
                    <td className="py-3 px-4 text-right">{template.sent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600">
                        {((template.opened / template.sent) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-blue-600">
                        {((template.clicked / template.sent) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-purple-600">
                        {((template.clicked / template.opened) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}