export type EmailServiceProvider = 
  | 'smtp'
  | 'sendgrid'
  | 'mailgun'
  | 'ses'
  | 'postmark'
  | 'resend';

export type EmailServiceStatus = 'active' | 'error' | 'inactive';

export interface EmailService {
  id: string;
  name: string;
  provider: EmailServiceProvider;
  provider_logo?: string;
  provider_color?: string;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  config_preview?: Record<string, string>;
  is_default: boolean;
  status: EmailServiceStatus;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailServiceRequest {
  name: string;
  provider: EmailServiceProvider;
  configuration: Record<string, any>;
  is_default?: boolean;
}

export interface UpdateEmailServiceRequest {
  name?: string;
  configuration?: Record<string, any>;
  is_default?: boolean;
  status?: EmailServiceStatus;
}

export interface TestEmailServiceRequest {
  to_email: string;
}

export interface TestEmailServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Provider-specific configuration types
export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name?: string;
  use_tls?: boolean;
}

export interface SendGridConfig {
  api_key: string;
  from_email: string;
  from_name?: string;
}

export interface MailgunConfig {
  domain: string;
  api_key: string;
  from_email: string;
  from_name?: string;
  region?: 'us' | 'eu';
}

export interface SESConfig {
  region: string;
  access_key: string;
  secret_key: string;
  from_email: string;
  from_name?: string;
}

export interface PostmarkConfig {
  server_token: string;
  from_email: string;
  from_name?: string;
}

export interface ResendConfig {
  api_key: string;
  from_email: string;
  from_name?: string;
}

export type EmailServiceConfig = 
  | SMTPConfig
  | SendGridConfig
  | MailgunConfig
  | SESConfig
  | PostmarkConfig
  | ResendConfig;

// Provider metadata
export interface ProviderMetadata {
  name: string;
  description: string;
  icon: string; // Icon identifier
  color: string; // Brand color
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'password' | 'select';
    required: boolean;
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
}

export const PROVIDER_METADATA: Record<EmailServiceProvider, ProviderMetadata> = {
  smtp: {
    name: 'SMTP',
    description: 'Send emails using any SMTP server',
    color: '#4A90E2',
    icon: 'smtp',
    fields: [
      { name: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.example.com' },
      { name: 'port', label: 'Port', type: 'number', required: true, placeholder: '587' },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
      { name: 'use_tls', label: 'Use TLS', type: 'select', required: false, options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ]},
    ],
  },
  sendgrid: {
    name: 'SendGrid',
    description: 'Send emails using SendGrid API',
    color: '#1A82E2',
    icon: 'sendgrid',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
    ],
  },
  mailgun: {
    name: 'Mailgun',
    description: 'Send emails using Mailgun API',
    color: '#F06B66',
    icon: 'mailgun',
    fields: [
      { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.example.com' },
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
      { name: 'region', label: 'Region', type: 'select', required: false, options: [
        { label: 'US', value: 'us' },
        { label: 'EU', value: 'eu' },
      ]},
    ],
  },
  ses: {
    name: 'Amazon SES',
    description: 'Send emails using Amazon Simple Email Service',
    color: '#FF9900',
    icon: 'ses',
    fields: [
      { name: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
      { name: 'access_key', label: 'Access Key ID', type: 'text', required: true },
      { name: 'secret_key', label: 'Secret Access Key', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
    ],
  },
  postmark: {
    name: 'Postmark',
    description: 'Send emails using Postmark API',
    color: '#FFCC00',
    icon: 'postmark',
    fields: [
      { name: 'server_token', label: 'Server Token', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
    ],
  },
  resend: {
    name: 'Resend',
    description: 'Send emails using Resend API',
    color: '#000000',
    icon: 'resend',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'from_email', label: 'From Email', type: 'text', required: true, placeholder: 'noreply@example.com' },
      { name: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Your Company' },
    ],
  },
};
