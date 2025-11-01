# Quick Start Guide

## Getting Started with LeapMailr Pro UI

### Prerequisites
- Node.js 18+ installed
- LeapMailr backend running on `http://localhost:8080`
- npm or yarn package manager

### Step 1: Install Dependencies
```bash
cd leapmailr-ui
npm install
```

### Step 2: Configure Environment
Create `.env.local` file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1" > .env.local
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Access the Application
Open your browser and navigate to:
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard (after login)

### Default Test Account
Use these credentials for testing (if backend is seeded):
```
Email: demo@leapmailr.com
Password: password123
```

### Project Features

#### ✅ Completed Pages
1. **Landing Page** (`/`) - Hero section with features
2. **Login** (`/login`) - Authentication page
3. **Register** (`/register`) - User registration
4. **Dashboard Home** (`/dashboard`) - Overview with stats
5. **Send Email** (`/dashboard/send`) - Email composer
6. **Templates** (`/dashboard/templates`) - Template management
7. **Analytics** (`/dashboard/analytics`) - Charts and metrics
8. **Settings** (`/dashboard/settings`) - API keys and profile

#### 🎨 Design Highlights
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design
- **Theme**: Purple primary color with light/dark mode
- **Icons**: Lucide icons throughout
- **Charts**: Recharts for data visualization

#### 🔌 API Integration
All pages are connected to the backend API endpoints:
- Authentication (login, register, logout)
- Template CRUD operations
- Email sending with parameters
- Analytics data fetching

### Troubleshooting

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

#### API Connection Issues
1. Ensure backend is running on port 8080
2. Check CORS is enabled in backend
3. Verify `.env.local` has correct API URL

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Development Tips

#### Adding New Components
```bash
# Components go in components/ui/
touch components/ui/new-component.tsx
```

#### Testing API Calls
```typescript
import { emailAPI } from '@/lib/api';

// Send test email
const result = await emailAPI.send({
  template_id: 'your-template-id',
  to: 'test@example.com',
  subject: 'Test',
  parameters: { name: 'Test User' }
});
```

#### Checking Auth State
```typescript
import { useAuthStore } from '@/lib/store';

const { user, isAuthenticated } = useAuthStore();
console.log('Logged in as:', user?.email);
```

### Next Steps

1. **Start Backend**: Run the Go backend first
2. **Register Account**: Create your account via UI
3. **Create Templates**: Build your email templates
4. **Send Emails**: Use the send page to test
5. **View Analytics**: Check dashboard for metrics

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

### Support

For issues or questions:
1. Check the README.md for detailed docs
2. Review backend API documentation
3. Check browser console for errors
4. Verify network requests in DevTools

---

Happy emailing! 🚀