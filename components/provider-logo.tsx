import React from 'react';

interface ProviderLogoProps {
  provider: string;
  className?: string;
}

export function ProviderLogo({ provider, className = 'w-8 h-8' }: ProviderLogoProps) {
  // Brand-accurate SVG logos for each email service provider
  const logos: Record<string, React.ReactNode> = {
    // Generic SMTP envelope icon
    smtp: (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    
    // SendGrid (Twilio) - Blue brand color #1A82E2
    sendgrid: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle fill="#1A82E2" cx="12" cy="12" r="10"/>
        <path fill="#FFF" d="M8 7h2v10H8zm6 0h2v10h-2z"/>
      </svg>
    ),
    
    // Mailgun - Orange/coral brand color #F06B66
    mailgun: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle fill="#F06B66" cx="12" cy="12" r="10"/>
        <g fill="#FFF">
          <circle cx="12" cy="8" r="2.5"/>
          <path d="M6 18c0-3.314 2.686-6 6-6s6 2.686 6 6H6z"/>
        </g>
      </svg>
    ),
    
    // Amazon SES - AWS orange #FF9900
    ses: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FF9900" d="M6 14l6-8 6 8H6z"/>
        <path fill="#FF9900" fillOpacity="0.6" d="M4 18l8-10 8 10H4z"/>
      </svg>
    ),
    
    // Postmark - Yellow diamond #FFCC00
    postmark: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFCC00" d="M12 2L2 12l10 10 10-10L12 2zm0 6l4 4-4 4-4-4 4-4z"/>
        <path fill="#000" fillOpacity="0.1" d="M12 8l4 4-4 4-4-4 4-4z"/>
      </svg>
    ),
    
    // Resend - Black minimal design
    resend: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    
    // Gmail - Multi-color brand (Red #EA4335, Blue #4285F4, Green #34A853, Yellow #FBBC04)
    gmail: (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        <path fill="#FBBC04" d="M0 5.457C0 3.434 2.309 2.28 3.927 3.493L12 9.548V16.64L0 8.91z"/>
        <path fill="#34A853" d="M24 8.91v10.456c0 .904-.732 1.636-1.636 1.636h-3.819V11.73z"/>
        <path fill="#4285F4" d="M12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457v3.455z"/>
        <path fill="#C5221F" d="M0 8.91L12 16.64V9.548L5.455 4.64 3.927 3.493z"/>
      </svg>
    ),
  };

  return logos[provider.toLowerCase()] || logos.smtp;
}
