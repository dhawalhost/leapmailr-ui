# LeapMailr - Web Dashboard

A modern, responsive web dashboard for managing your email delivery platform. Built with Next.js 14 and designed for an exceptional user experience.

## Overview

The LeapMailr dashboard provides a complete interface for managing your email infrastructure, from creating templates to monitoring delivery performance. Every feature is designed with usability and efficiency in mind.

## Features

### ✨ User Experience
- **Modern Design**: Clean interface with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: Full theme support with CSS variables
- **Interactive Components**: Intuitive interactions throughout

### 🎯 Core Functionality
- **Authentication**: Secure signup and login with JWT tokens
- **Dashboard Home**: Real-time overview of your email operations
- **Send Emails**: Compose and send emails with template support
- **Template Management**: Create, edit, and test email templates
- **Analytics**: Track performance with interactive charts
- **Settings**: Manage account, API keys, and preferences

### 📊 Analytics & Insights
- Real-time delivery statistics
- Template performance comparison
- Engagement metrics (opens, clicks, deliveries)
- Interactive charts and visualizations
- Data export capabilities

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Installation

```bash
cd leapmailr-ui
npm install
```

## 🔧 Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
leapmailr-ui/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   ├── page.tsx        # Dashboard home
│   │   ├── send/           # Email sending page
│   │   ├── templates/      # Template management
│   │   ├── analytics/      # Analytics & charts
│   │   └── settings/       # Settings & API keys
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles & theme
├── components/
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── label.tsx
├── lib/
│   ├── api.ts              # API client & endpoints
│   ├── store.ts            # Zustand auth store
│   └── utils.ts            # Utility functions
└── tailwind.config.ts      # Tailwind configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple/Violet (`hsl(262, 83%, 58%)`)
- **Success**: Green for delivered emails
- **Error**: Red for failed emails
- **Warning**: Yellow for pending emails

### Typography
- **Font**: System font stack for optimal performance
- **Sizes**: Responsive text sizing with Tailwind classes

### Components
All components follow the shadcn/ui pattern for consistency and customizability.

## 🔐 Authentication Flow

1. **Register**: User creates account with email/password
2. **Login**: Returns JWT access token and refresh token
3. **Token Storage**: Tokens stored in Zustand + localStorage
4. **Auto-Refresh**: Axios interceptor handles token refresh
5. **Protected Routes**: Dashboard requires authentication

## 📧 Email Sending Workflow

1. Select a template from your library
2. Add recipient email addresses
3. Fill in template variables/parameters
4. Preview the rendered email
5. Send immediately or schedule for later

## 📊 Analytics Features

- **Email Volume**: Track sent, delivered, failed, pending
- **Engagement Rates**: Open rates, click rates, conversions
- **Template Performance**: Compare templates side-by-side
- **Time-based Charts**: View trends over 24h, 7d, 30d, 90d
- **Export Data**: Download analytics as CSV

## 🚧 Upcoming Features

- [ ] Bulk email import (CSV)
- [ ] Advanced template editor (drag-and-drop)
- [ ] A/B testing for templates
- [ ] Email scheduling
- [ ] Webhook configuration UI
- [ ] Team collaboration features
- [ ] Email attachment support
- [ ] Custom domain setup
- [ ] Real-time delivery tracking (WebSocket)
- [ ] Two-factor authentication

## 🔌 API Integration

The dashboard connects to the LeapMailr backend API:

```typescript
// Example API call
import { emailAPI } from '@/lib/api';

await emailAPI.send({
  template_id: 'template-uuid',
  to: 'user@example.com',
  subject: 'Welcome!',
  parameters: {
    name: 'John Doe',
    company: 'Your Company'
  }
});
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api/v1` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations
- **Recharts**: For beautiful charts

---

Built with ❤️ by the LeapMailr team