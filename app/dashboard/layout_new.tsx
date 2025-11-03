'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Server,
  Users,
  Bell,
  Search,
  ChevronRight,
  Home,
  Zap,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  Settings2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Send Email', href: '/dashboard/send', icon: Mail, badge: null },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText, badge: null },
  { name: 'Email Services', href: '/dashboard/services', icon: Server, badge: null },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users, badge: null },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, badge: 'New' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, badge: null },
];

// Breadcrumb component
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        
        return (
          <div key={segment} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-600" />
            {isLast ? (
              <span className="text-white font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(3); // Mock notifications count

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-50 lg:hidden"
            >
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col h-full">
                {/* Mobile Logo Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <Image 
                    src="/assets/leapmailr.svg" 
                    alt="LeapMailr" 
                    width={120} 
                    height={32} 
                    className="h-4 w-auto" 
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                        isActive(item.href)
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Mobile User Section */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-30"
      >
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Desktop Logo Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {!sidebarCollapsed ? (
              <Image 
                src="/assets/leapmailr.svg" 
                alt="LeapMailr" 
                width={120} 
                height={32} 
                className="h-4 w-auto"  
              />
            ) : (
              <Image 
                src="/assets/short.png" 
                alt="LM" 
                width={32} 
                height={32} 
                className="h-8 w-8" 
                unoptimized 
              />
            )}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                  isActive(item.href)
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Collapse Toggle (when collapsed) */}
          {sidebarCollapsed && (
            <div className="p-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="w-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Desktop User Section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]'} transition-all duration-300`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-4 px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb Navigation */}
            <div className="flex-1">
              <Breadcrumb pathname={pathname} />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Help Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10 relative"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                )}
              </Button>

              {/* Plan Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>{user?.plan_type || 'Free'}</span>
              </div>

              {/* User Menu (Desktop) */}
              <div className="hidden lg:block relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="font-medium text-white">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-sm text-gray-400">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/dashboard/settings">
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                              <Settings2 className="h-4 w-4" />
                              <span>Account Settings</span>
                            </button>
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
