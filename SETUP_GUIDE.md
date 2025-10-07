# Lucky Draw Frontend - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher (comes with Node.js)
- **Git**: For version control

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to the project directory
cd Lucky-Draw-Frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Lucky Draw
REACT_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm start
```

The application will open automatically at [http://localhost:3000](http://localhost:3000)

### 4. Login

Use the demo credentials:
- **Email**: admin@example.com
- **Password**: any password (for demo purposes)

## 🏗️ Build for Production

```bash
# Create production build
npm run build

# The build folder will contain optimized production files
```

## 📁 Project Structure Overview

```
Lucky-Draw-Frontend/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # UI components (Button, Card, Input, etc.)
│   │   ├── layout/       # Layout components (Sidebar, Header)
│   │   └── contests/     # Feature-specific components
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── Dashboard.tsx
│   │   ├── Contests.tsx
│   │   ├── Participants.tsx
│   │   ├── LuckyDraw.tsx
│   │   ├── Winners.tsx
│   │   ├── Communication.tsx
│   │   ├── Analytics.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── store/            # State management (Zustand)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── routes/           # Route configuration
│   ├── App.tsx           # Main app component
│   └── index.tsx         # Entry point
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... customize your color palette
      },
    },
  },
}
```

### Changing Logo

Replace the logo in the Sidebar component:
- File: `src/components/layout/Sidebar.tsx`
- Look for the `<Sparkles>` icon and replace with your logo

### Changing Site Name

Update in multiple places:
1. `.env` file: `REACT_APP_APP_NAME`
2. `src/components/layout/Sidebar.tsx`
3. `public/index.html` (title tag)

## 🔧 Configuration Options

### API Configuration

Update `src/utils/api.ts` to configure:
- Base URL
- Request/Response interceptors
- Error handling
- Authentication headers

### Authentication

Modify `src/store/authStore.ts` to:
- Change storage key
- Add custom authentication logic
- Modify user data structure

### Routing

Edit `src/App.tsx` to:
- Add new routes
- Modify route structure
- Change default redirects

## 📦 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Create production build
npm run eject      # Eject from Create React App (irreversible)
```

### Linting & Formatting
```bash
npm run lint       # Run ESLint (if configured)
npm run format     # Run Prettier (if configured)
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

Or change the port in `package.json`:
```json
"start": "PORT=3001 react-scripts start"
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear cache and rebuild
npm cache clean --force
npm run build
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# Type: "TypeScript: Restart TS Server"
```

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use HTTPS in production** - Configure your hosting platform
3. **Implement proper backend authentication** - This is a frontend demo
4. **Sanitize user inputs** - Always validate on backend
5. **Keep dependencies updated** - Run `npm audit` regularly

## 🌐 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `build` folder to your web server
3. Configure server to serve `index.html` for all routes

### Environment Variables in Production

Set these in your hosting platform:
- `REACT_APP_API_URL` - Your production API URL
- `REACT_APP_APP_NAME` - Your app name
- `REACT_APP_VERSION` - Your app version

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Chart.js Documentation](https://www.chartjs.org/)

## 💡 Tips

1. **Use React DevTools** - Install browser extension for debugging
2. **Use Redux DevTools** - Works with Zustand for state inspection
3. **Hot Module Replacement** - Changes reflect without full reload
4. **Component Organization** - Keep components small and focused
5. **Type Safety** - Leverage TypeScript for better code quality

## 🤝 Getting Help

If you encounter issues:
1. Check this guide first
2. Review the error message carefully
3. Search for the error online
4. Check the project's issue tracker
5. Ask in the project's discussion forum

## 📝 Next Steps

After setup:
1. Explore the Dashboard
2. Create a test contest
3. Add test participants
4. Execute a lucky draw
5. Manage winners
6. Customize the UI to your needs
7. Connect to your backend API

---

**Happy Coding! 🚀**
