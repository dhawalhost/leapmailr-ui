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
    color: 'text-green-600',
    bgColor: 'bg-green-50',
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
    href: '/dashboard/settings/security',
    icon: Lock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-[oklch(65%_0.19_145)]" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-white/60">
            Manage your email service configurations and account settings
          </p>
        </motion.div>

        {/* Email Service Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white/90">Email Service Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 
                               hover:border-white/20 transition-all duration-300 cursor-pointer group h-full">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      category.color === 'text-blue-600' ? 'from-blue-500/10 to-blue-600/10' :
                      category.color === 'text-red-600' ? 'from-red-500/10 to-red-600/10' :
                      'from-green-500/10 to-green-600/10'
                    } opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${
                          category.color === 'text-blue-600' ? 'bg-blue-500/20' :
                          category.color === 'text-red-600' ? 'bg-red-500/20' :
                          'bg-green-500/20'
                        } group-hover:scale-110 transition-transform`}>
                          <category.icon className={`h-6 w-6 ${
                            category.color === 'text-blue-600' ? 'text-blue-400' :
                            category.color === 'text-red-600' ? 'text-red-400' :
                            'text-green-400'
                          }`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-[oklch(65%_0.19_145)] 
                                             group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-white/60">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white/90">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountSettings.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (settingsCategories.length + index) * 0.1 }}
              >
                {category.href ? (
                  <Link href={category.href}>
                    <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 
                                 transition-all duration-300 h-full hover:border-white/20 cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg ${category.bgColor}`}>
                            <category.icon className={`h-6 w-6 ${category.color}`} />
                          </div>
                          <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-[oklch(65%_0.19_145)] 
                                               group-hover:translate-x-1 transition-all" />
                        </div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-white/60">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : (
                  <Card className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 
                               transition-all duration-300 h-full ${
                                 category.comingSoon ? 'opacity-50' : 'hover:border-white/20 cursor-pointer'
                               }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-white/10">
                          <category.icon className="h-6 w-6 text-white/60" />
                        </div>
                        {category.comingSoon && (
                          <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 
                                       border border-yellow-500/30 font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-white/60">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Settings Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle>Quick Settings Overview</CardTitle>
              <CardDescription className="text-white/60">
                View the status of your current configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Shield, label: 'CAPTCHA', desc: 'Spam Protection', color: 'blue' },
                  { icon: ShieldAlert, label: 'Suppressions', desc: 'Bounce Management', color: 'red' },
                  { icon: Reply, label: 'Auto-Reply', desc: 'Email Automation', color: 'green' },
                  { icon: Key, label: 'API Keys', desc: 'SDK Access', color: 'green' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`text-center p-4 rounded-lg ${
                      item.color === 'blue' ? 'bg-blue-500/10' :
                      item.color === 'red' ? 'bg-red-500/10' :
                      'bg-green-500/10'
                    } border ${
                      item.color === 'blue' ? 'border-blue-500/20' :
                      item.color === 'red' ? 'border-red-500/20' :
                      'border-green-500/20'
                    } hover:scale-105 transition-transform`}
                  >
                    <item.icon className={`h-8 w-8 mx-auto mb-2 ${
                      item.color === 'blue' ? 'text-blue-400' :
                      item.color === 'red' ? 'text-red-400' :
                      'text-green-400'
                    }`} />
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-white/50 mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
