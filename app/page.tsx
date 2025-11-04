'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Code,
  Lock,
  BarChart3,
  Mail,
  Send,
  Users,
  ChevronDown,
  Star,
  Quote,
  Globe,
  Clock,
  Award,
  Rocket,
  Play,
  Check,
  X,
  Menu,
} from 'lucide-react';

// Animated Counter Component
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
        setHasAnimated(true);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, hasAnimated]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CTO at TechCorp',
      company: 'TechCorp',
      image: '/assets/short.png',
      content: 'LeapMailr transformed our email infrastructure. We went from 92% to 99.8% deliverability in just weeks. The real-time analytics have been game-changing.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      company: 'StartupX',
      image: '/assets/short.png',
      content: 'The API is incredibly intuitive. We integrated it in less than an hour and haven\'t looked back since. Best decision for our email infrastructure.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      company: 'Scale.io',
      image: '/assets/short.png',
      content: 'Real-time analytics and template management save us hours every week. The team support is outstanding. Highly recommend for any growing company.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can start sending emails in under 5 minutes. Simply sign up, verify your domain using our step-by-step guide, and use our API or intuitive dashboard to send your first email. We provide SDKs for all major programming languages.',
    },
    {
      question: 'What\'s your email deliverability rate?',
      answer: 'We maintain an industry-leading 99.8% deliverability rate through advanced infrastructure, automatic email authentication (DKIM, SPF, DMARC), dedicated IP pools, and real-time reputation monitoring.',
    },
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Absolutely! You have complete flexibility to change your plan at any time. Upgrades take effect immediately with pro-rated billing, and downgrades apply at the start of your next billing cycle with no penalties.',
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'All plans include email support with detailed documentation and video tutorials. Professional plans get priority support with 4-hour response times. Enterprise customers receive 24/7 phone support and a dedicated account manager.',
    },
    {
      question: 'Is there a free trial or free tier?',
      answer: 'Yes! Our Starter plan is completely free forever with 1,000 emails per month. No credit card required to get started. You can upgrade anytime as your needs grow.',
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We\'re SOC 2 Type II and ISO 27001 certified, with regular third-party security audits.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <Image src="/assets/leapmailr.svg" alt="LeapMailr" width={120} height={32} className="h-4 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</a>
                <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                  Get Started Free
                </Button>
              </Link>
            </div>
            <button 
              className="md:hidden text-gray-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/5 py-4"
              >
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                  <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a>
                  <a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start text-gray-300">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">Get Started Free</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent"></div>
          <motion.div 
            className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 hover:bg-primary/15 transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>The Smart Email Abstraction Layer</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Switch email providers{' '}
              <span className="bg-gradient-to-r from-primary via-green-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                without changing code
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop hardcoding SMTP providers in your application. LeapMailr sits between your code and email services, letting you switch providers, manage templates, and track analytics—all without touching your codebase.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-10 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all group w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 h-14 px-10 text-base group w-full sm:w-auto">
                <Code className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                View Documentation
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Switch providers anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Cards with Enhanced Interaction */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Zap,
                title: 'Provider Agnostic',
                description: 'Use SendGrid today, switch to Mailgun tomorrow—same API, zero code changes',
                badge: 'Flexible',
                color: 'from-yellow-500/20 to-orange-500/20'
              },
              {
                icon: Shield,
                title: 'Centralized Control',
                description: 'Manage all email templates and configurations in one place',
                badge: 'Unified',
                color: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: Code,
                title: 'Simple Integration',
                description: 'Write once, use everywhere. No more provider-specific SDK hell',
                badge: 'Developer Friendly',
                color: 'from-green-500/20 to-emerald-500/20'
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-6 bg-gradient-to-br ${card.color} from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full`}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <card.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{card.description}</p>
                  <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">{card.badge}</span>
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why LeapMailr Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-12 bg-gradient-to-br from-primary/5 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why LeapMailr?</h2>
                  <p className="text-gray-400 text-lg">The problem with traditional email integration</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Without LeapMailr</h3>
                        <p className="text-gray-400 text-sm">SMTP credentials hardcoded in your app. Switching providers means code changes, testing, and deployment.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Template Chaos</h3>
                        <p className="text-gray-400 text-sm">Email templates scattered across codebase. Updates require developer time and deployments.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Vendor Lock-in</h3>
                        <p className="text-gray-400 text-sm">Tied to one provider's API, pricing, and limitations. Migration is painful.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">With LeapMailr</h3>
                        <p className="text-gray-400 text-sm">One API for all providers. Switch email services through the dashboard—no code changes needed.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Centralized Templates</h3>
                        <p className="text-gray-400 text-sm">Manage all templates in one place. Marketing teams can update content without bothering developers.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Complete Freedom</h3>
                        <p className="text-gray-400 text-sm">Try different providers, compare performance, negotiate better pricing. You're in control.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20 rounded-lg p-6 text-center">
                  <p className="text-white font-semibold mb-2">The LeapMailr Advantage</p>
                  <p className="text-gray-300 text-sm">
                    Your code calls LeapMailr → We handle provider routing → Emails delivered through your chosen service
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">LeapMailr acts as a smart middleware layer for all your email needs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: 'One API, Any Provider',
                description: 'Write your code once using LeapMailr API. Behind the scenes, we route to your chosen SMTP provider—SendGrid, Mailgun, AWS SES, or custom SMTP',
                color: 'from-purple-500/10 to-pink-500/10'
              },
              {
                icon: Mail,
                title: 'Dynamic Templates',
                description: 'Store templates with variables in LeapMailr. Update content without code deployments. Support for HTML, plain text, and attachments',
                color: 'from-blue-500/10 to-cyan-500/10'
              },
              {
                icon: Send,
                title: 'Switch Providers Instantly',
                description: 'Change email service through dashboard settings. Test different providers, compare costs, avoid downtime—all without touching your codebase',
                color: 'from-green-500/10 to-emerald-500/10'
              },
              {
                icon: BarChart3,
                title: 'Unified Analytics',
                description: 'Track delivery rates, opens, and clicks across all providers in one dashboard. No more juggling multiple provider dashboards',
                color: 'from-orange-500/10 to-red-500/10'
              },
              {
                icon: Lock,
                title: 'Configuration Management',
                description: 'Store SMTP credentials securely. Rotate keys, manage multiple services per environment, all from a centralized interface',
                color: 'from-indigo-500/10 to-purple-500/10'
              },
              {
                icon: Users,
                title: 'Multi-Environment Support',
                description: 'Use different providers for dev/staging/production. Test with Mailtrap, go live with SendGrid—same code everywhere',
                color: 'from-pink-500/10 to-rose-500/10'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`p-6 h-full bg-gradient-to-br ${feature.color} from-gray-800/30 to-gray-900/30 border-gray-700/50 backdrop-blur-sm hover:border-primary/30 transition-all group`}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="get-started" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get Started in Minutes</h2>
            <p className="text-gray-400 text-lg">Decouple your code from email providers in three simple steps</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Integrate',
                description: 'Create a free account and add LeapMailr API to your app. Replace direct SMTP calls with our endpoint',
                icon: Users,
              },
              {
                step: '2',
                title: 'Add Email Service',
                description: 'Connect your existing SMTP provider (SendGrid, Mailgun, etc.) or add multiple providers for testing',
                icon: Mail,
              },
              {
                step: '3',
                title: 'Create Templates',
                description: 'Set up email templates with variables. Your code sends data, we handle the rest',
                icon: Send,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-primary/30 transition-all h-full text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Comparison */}
      <section id="pricing" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg">Choose the plan that fits your needs. No hidden fees.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for trying out',
                features: [
                  { text: '1,000 emails/month', included: true },
                  { text: 'Basic analytics', included: true },
                  { text: 'Email support', included: true },
                  { text: '2 team members', included: true },
                  { text: 'Custom templates', included: false },
                  { text: 'Priority support', included: false },
                ],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'Professional',
                price: '$49',
                period: '/month',
                description: 'For growing businesses',
                features: [
                  { text: '50,000 emails/month', included: true },
                  { text: 'Advanced analytics', included: true },
                  { text: 'Priority support', included: true },
                  { text: 'Unlimited team members', included: true },
                  { text: 'Custom templates', included: true },
                  { text: 'API access', included: true },
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  { text: 'Unlimited emails', included: true },
                  { text: 'Dedicated infrastructure', included: true },
                  { text: '24/7 phone support', included: true },
                  { text: 'SLA guarantee', included: true },
                  { text: 'Custom integrations', included: true },
                  { text: 'Dedicated account manager', included: true },
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-lg shadow-primary/30">
                      <Award className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                <Card className={`p-8 h-full flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50'
                }`}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="text-gray-400">{plan.period}</span>}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section id="faq" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently asked questions</h2>
            <p className="text-gray-400 text-lg">Everything you need to know about LeapMailr</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 group"
                  >
                    <span className="font-semibold text-white group-hover:text-primary transition-colors text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 md:p-16 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/50 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6"
                >
                  <Rocket className="h-8 w-8 text-primary" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to stop worrying about email providers?</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Write your email code once. Switch providers anytime. LeapMailr gives you the flexibility to adapt without the pain of refactoring.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 h-14 px-10 text-base shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="https://github.com/dhawalhost/leapmailr" target="_blank">
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-10 text-base w-full sm:w-auto">
                      View on GitHub
                    </Button>
                  </Link>
                </div>
                
                <p className="text-sm text-gray-400 mt-6">
                  Free plan available • No credit card required • Provider flexibility
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Image src="/assets/leapmailr.svg" alt="LeapMailr" width={120} height={32} className="h-4 w-auto mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Enterprise email infrastructure made simple.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 LeapMailr. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Status</a>
              <a href="#" className="hover:text-white transition-colors">Changelog</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
