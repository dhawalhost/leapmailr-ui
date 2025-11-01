'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Mail,
  CheckCircle2,
  Sparkles,
  Code,
  Lock,
  BarChart3,
  Globe,
  Key,
  Reply,
  ShieldAlert,
  Users,
  Rocket,
  Github,
  MessageSquare,
  Send,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LeapMailr</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">Features</a>
            <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">How It Works</a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Professional Email Service Platform</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
            Send Emails That{' '}
            <span className="text-purple-600 dark:text-purple-400">Convert</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            A powerful, developer-friendly email service platform built for modern applications. 
            Send transactional emails, manage contacts, and track analytics—all in one place.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-gray-300 dark:border-gray-600">
                <Code className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why LeapMailr Section */}
      <section id="features" className="container mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Why Choose LeapMailr?
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Everything you need to power your email infrastructure, built for developers who care about reliability and simplicity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Zap className="h-8 w-8" />,
              title: 'Lightning Fast Delivery',
              description: 'Send emails in milliseconds with our optimized infrastructure. Real-time delivery status and webhooks keep you informed.',
              color: 'text-yellow-500'
            },
            {
              icon: <Shield className="h-8 w-8" />,
              title: 'CAPTCHA Protection',
              description: 'Built-in reCAPTCHA and hCaptcha integration to protect your forms from spam and abuse. Configure once, use everywhere.',
              color: 'text-blue-500'
            },
            {
              icon: <ShieldAlert className="h-8 w-8" />,
              title: 'Smart Suppressions',
              description: 'Automatically manage bounced, complained, and unsubscribed emails. Keep your sender reputation pristine.',
              color: 'text-red-500'
            },
            {
              icon: <Reply className="h-8 w-8" />,
              title: 'Auto-Reply Templates',
              description: 'Set up intelligent auto-responses for form submissions and API calls. Use dynamic variables for personalization.',
              color: 'text-green-500'
            },
            {
              icon: <Key className="h-8 w-8" />,
              title: 'Secure API Keys',
              description: 'Generate public/private key pairs for SDK authentication. Rotate and revoke keys with a single click.',
              color: 'text-purple-500'
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: 'Contact Management',
              description: 'Import, export, and manage your contacts effortlessly. CSV support and powerful search make it easy.',
              color: 'text-indigo-500'
            },
            {
              icon: <BarChart3 className="h-8 w-8" />,
              title: 'Advanced Analytics',
              description: 'Track open rates, click rates, and delivery metrics. Make data-driven decisions with detailed insights.',
              color: 'text-orange-500'
            },
            {
              icon: <Code className="h-8 w-8" />,
              title: 'Developer-Friendly API',
              description: 'RESTful API with comprehensive documentation. SDKs for popular languages coming soon.',
              color: 'text-cyan-500'
            },
            {
              icon: <Globe className="h-8 w-8" />,
              title: 'Global Infrastructure',
              description: 'Servers across multiple regions ensure fast delivery worldwide. 99.9% uptime SLA.',
              color: 'text-pink-500'
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900/50 py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: <Rocket className="h-12 w-12" />,
                  title: 'Sign Up & Configure',
                  description: 'Create your account, set up your email service provider (SMTP, SendGrid, Mailgun, etc.), and configure your settings.',
                  points: ['Connect your SMTP', 'Set up CAPTCHA', 'Configure auto-replies']
                },
                {
                  step: '2',
                  icon: <Code className="h-12 w-12" />,
                  title: 'Integrate Your App',
                  description: 'Use our RESTful API or upcoming SDKs to integrate email sending into your application. Copy-paste ready code examples.',
                  points: ['Generate API keys', 'Use our REST API', 'Test with sandbox mode']
                },
                {
                  step: '3',
                  icon: <Send className="h-12 w-12" />,
                  title: 'Send & Monitor',
                  description: 'Start sending emails and monitor everything from your dashboard. Track delivery, opens, clicks, and more in real-time.',
                  points: ['Monitor analytics', 'Track delivery status', 'Manage suppressions']
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg h-full border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-2xl">
                        {step.step}
                      </div>
                      <div className="text-purple-600 dark:text-purple-400">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-purple-300 dark:text-purple-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="bg-gray-900 dark:bg-black rounded-lg p-6 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-gray-400 text-sm">Send your first email</span>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`// Using LeapMailr API
const response = await fetch('https://api.leapmailr.com/api/v1/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome to LeapMailr!',
    html: '<h1>Hello World!</h1>',
    from: 'noreply@yourdomain.com'
  })
});

const data = await response.json();
console.log('Email sent:', data);`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Start free and scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              description: 'Perfect for testing and small projects',
              features: [
                '1,000 emails/month',
                'Basic analytics',
                'Email templates',
                'API access',
                'Community support'
              ],
              cta: 'Start Free',
              highlighted: false
            },
            {
              name: 'Pro',
              price: '$29',
              description: 'For growing businesses and startups',
              features: [
                '50,000 emails/month',
                'Advanced analytics',
                'Unlimited templates',
                'Priority support',
                'Custom domains',
                'Team collaboration',
                'Webhook support'
              ],
              cta: 'Start Pro Trial',
              highlighted: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For large-scale applications',
              features: [
                'Unlimited emails',
                'Dedicated infrastructure',
                'SLA guarantee',
                '24/7 phone support',
                'Custom integrations',
                'Volume discounts',
                'Onboarding assistance'
              ],
              cta: 'Contact Sales',
              highlighted: false
            },
          ].map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full ${plan.highlighted ? 'border-purple-600 dark:border-purple-400 border-2 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
                <CardHeader>
                  {plan.highlighted && (
                    <div className="bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-600 dark:text-gray-400">/month</span>}
                  </div>
                  <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button 
                      className={`w-full ${plan.highlighted ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Email Experience?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of developers who trust LeapMailr for their email infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">LeapMailr</span>
              </div>
              <p className="text-sm">
                Professional email service platform built for modern applications.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Security</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; 2025 LeapMailr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
