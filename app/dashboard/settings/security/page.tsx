'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mfaAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Download,
  Copy,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { MFASetupResponse, MFAStatus } from '@/types/mfa';

export default function SecurityPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  
  // Setup flow
  const [setupMode, setSetupMode] = useState(false);
  const [setupPassword, setSetupPassword] = useState('');
  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  
  // Disable flow
  const [disableMode, setDisableMode] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  
  // Backup codes
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      setLoading(true);
      const response = await mfaAPI.getStatus();
      setMfaStatus(response.data);
    } catch (error: any) {
      console.error('Failed to load MFA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupStart = async () => {
    if (!setupPassword) {
      toast({
        title: 'Error',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await mfaAPI.setup({ password: setupPassword });
      setSetupData(response.data);
      setSetupPassword('');
      toast({
        title: 'Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to start MFA setup',
        variant: 'destructive',
      });
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mfaAPI.verifySetup({ code: verificationCode });
      toast({
        title: 'Success!',
        description: 'Two-factor authentication has been enabled',
      });
      setSetupMode(false);
      setSetupData(null);
      setVerificationCode('');
      loadMFAStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Invalid verification code',
        variant: 'destructive',
      });
    }
  };

  const handleDisable = async () => {
    if (!disablePassword || !disableCode) {
      toast({
        title: 'Error',
        description: 'Please enter both password and verification code',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mfaAPI.disable({ password: disablePassword, code: disableCode });
      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled',
      });
      setDisableMode(false);
      setDisablePassword('');
      setDisableCode('');
      loadMFAStatus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to disable MFA',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!regeneratePassword) {
      toast({
        title: 'Error',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await mfaAPI.regenerateBackupCodes({ password: regeneratePassword });
      setNewBackupCodes(response.data.backup_codes);
      setRegeneratePassword('');
      toast({
        title: 'Success',
        description: 'New backup codes generated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to regenerate backup codes',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `LeapMailr Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leapmailr-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-[oklch(65%_0.19_145)]" />
            <h1 className="text-3xl font-bold">Security & Authentication</h1>
          </div>
          <p className="text-white/60">
            Manage your account security settings and two-factor authentication
          </p>
        </motion.div>

        {/* MFA Status Card */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {mfaStatus?.enabled ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      Two-Factor Authentication Enabled
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5 text-yellow-500" />
                      Two-Factor Authentication Disabled
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-white/60">
                  {mfaStatus?.enabled
                    ? `Enabled on ${mfaStatus.verified_at ? new Date(mfaStatus.verified_at).toLocaleDateString() : 'N/A'}`
                    : 'Add an extra layer of security to your account'}
                </CardDescription>
              </div>
              <Badge
                variant={mfaStatus?.enabled ? 'default' : 'outline'}
                className={mfaStatus?.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
              >
                {mfaStatus?.enabled ? 'Protected' : 'Not Protected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!mfaStatus?.enabled && !setupMode && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-200 mb-1">Why enable 2FA?</h4>
                      <p className="text-sm text-blue-300/80">
                        Two-factor authentication adds an extra layer of security by requiring both your password
                        and a verification code from your authenticator app to sign in.
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setSetupMode(true)} className="w-full">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}

            {!mfaStatus?.enabled && setupMode && !setupData && (
              <div className="space-y-4">
                <p className="text-sm text-white/60">
                  Enter your password to begin setting up two-factor authentication
                </p>
                <div>
                  <Label htmlFor="setup-password">Current Password</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSetupStart()}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetupStart} className="flex-1">
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSetupMode(false);
                      setSetupPassword('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {setupData && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Scan QR Code</h3>
                  <p className="text-sm text-white/60">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </p>
                  
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img
                      src={setupData.qr_code_data_url}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>

                  {/* Manual Entry */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-white/40 mb-2">Can't scan? Enter this code manually:</p>
                    <div className="flex items-center gap-2 justify-center">
                      <code className="bg-black/30 px-3 py-2 rounded font-mono text-sm">
                        {showSecret ? setupData.secret : '••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(setupData.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Backup Codes */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Key className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-200 mb-1">Save Your Backup Codes</h4>
                      <p className="text-sm text-yellow-300/80 mb-3">
                        Store these codes in a safe place. You can use them to access your account if you lose your device.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {setupData.backup_codes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-black/30 px-3 py-2 rounded font-mono text-sm flex items-center justify-between"
                      >
                        <span>{code}</span>
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="text-white/40 hover:text-white/80"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBackupCodes(setupData.backup_codes)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup Codes
                  </Button>
                </div>

                {/* Verification */}
                <div className="space-y-3">
                  <Label htmlFor="verification-code">Enter Verification Code</Label>
                  <p className="text-sm text-white/60">
                    Enter the 6-digit code from your authenticator app to complete setup
                  </p>
                  <Input
                    id="verification-code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifySetup()}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleVerifySetup} className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify and Enable
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSetupMode(false);
                        setSetupData(null);
                        setVerificationCode('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {mfaStatus?.enabled && !disableMode && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-200 mb-1">Your Account is Protected</h4>
                      <p className="text-sm text-green-300/80">
                        Two-factor authentication is active. You'll need your authenticator app to sign in.
                      </p>
                      {mfaStatus.backup_codes_count !== undefined && (
                        <p className="text-xs text-green-300/60 mt-2">
                          You have {mfaStatus.backup_codes_count} backup codes remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Manage Backup Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDisableMode(true)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>

                {showBackupCodes && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-base">Regenerate Backup Codes</CardTitle>
                      <CardDescription>
                        Generate new backup codes. This will invalidate all previous codes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {newBackupCodes.length === 0 ? (
                        <>
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                              <p className="text-sm text-yellow-300/80">
                                Regenerating codes will invalidate all existing backup codes
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="regenerate-password">Current Password</Label>
                            <Input
                              id="regenerate-password"
                              type="password"
                              value={regeneratePassword}
                              onChange={(e) => setRegeneratePassword(e.target.value)}
                              placeholder="Enter your password"
                              className="mt-1"
                            />
                          </div>
                          <Button
                            onClick={handleRegenerateBackupCodes}
                            className="w-full"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate New Codes
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-sm text-green-300/80 mb-3 font-medium">
                              Your new backup codes:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {newBackupCodes.map((code, index) => (
                                <div
                                  key={index}
                                  className="bg-black/30 px-3 py-2 rounded font-mono text-sm flex items-center justify-between"
                                >
                                  <span>{code}</span>
                                  <button
                                    onClick={() => copyToClipboard(code)}
                                    className="text-white/40 hover:text-white/80"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => downloadBackupCodes(newBackupCodes)}
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Codes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewBackupCodes([]);
                                setShowBackupCodes(false);
                              }}
                              className="flex-1"
                            >
                              Done
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {disableMode && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-200 mb-1">Disable Two-Factor Authentication</h4>
                      <p className="text-sm text-red-300/80">
                        Your account will be less secure. Enter your password and a verification code to confirm.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="disable-password">Current Password</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="disable-code">Verification Code</Label>
                  <Input
                    id="disable-code"
                    type="text"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="mt-1 text-center tracking-widest font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDisable}
                    variant="destructive"
                    className="flex-1"
                  >
                    Disable 2FA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDisableMode(false);
                      setDisablePassword('');
                      setDisableCode('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Use a strong, unique password for your account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Enable two-factor authentication for maximum security</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Store your backup codes in a secure location</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Use authenticator apps like Google Authenticator, Authy, or 1Password</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Never share your verification codes or backup codes with anyone</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
