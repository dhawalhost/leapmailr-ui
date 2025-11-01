'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  ShieldAlert,
  Reply,
  Key,
  User,
  Lock,
  ArrowRight,
  Settings as SettingsIcon,
} from 'lucide-react';

const settingsCategories = [
  {
    title: 'CAPTCHA Verification',
    description: 'Configure spam protection for your forms using reCAPTCHA or hCaptcha',
    href: '/dashboard/settings/captcha',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Suppressions List',
    description: 'Manage bounced, complained, and unsubscribed email addresses',
    href: '/dashboard/settings/suppressions',
    icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Auto-Reply Configuration',
    description: 'Set up automatic email responses for form submissions and API calls',
    href: '/dashboard/settings/auto-reply',
    icon: Reply,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'API Key Management',
    description: 'Generate and manage public/private key pairs for SDK authentication',
    href: '/dashboard/settings/api-keys',
    icon: Key,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const accountSettings = [
  {
    title: 'Profile Settings',
    description: 'Update your personal information and preferences',
    icon: User,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    comingSoon: true,
  },
  {
    title: 'Security & Authentication',
    description: 'Manage password, two-factor authentication, and login sessions',
    icon: Lock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    comingSoon: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your email service configurations and account settings
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Email Service Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${category.bgColor} group-hover:scale-110 transition-transform`}>
                        <category.icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="mt-4">{category.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accountSettings.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (settingsCategories.length + index) * 0.1 }}
            >
              <Card className={`border-2 ${category.comingSoon ? 'opacity-60' : 'hover:shadow-lg cursor-pointer hover:border-primary'} transition-all duration-200`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    {category.comingSoon && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{category.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Settings Overview</CardTitle>
          <CardDescription>
            View the status of your current configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">CAPTCHA</p>
              <p className="text-xs text-muted-foreground mt-1">Spam Protection</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <ShieldAlert className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Suppressions</p>
              <p className="text-xs text-muted-foreground mt-1">Bounce Management</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Reply className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Auto-Reply</p>
              <p className="text-xs text-muted-foreground mt-1">Email Automation</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Key className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">API Keys</p>
              <p className="text-xs text-muted-foreground mt-1">SDK Access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
