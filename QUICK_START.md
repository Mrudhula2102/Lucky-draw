# Quick Start Guide

Get up and running with Lucky Draw Frontend in 5 minutes!

## ⚡ Installation (One-Time Setup)

```bash
# 1. Navigate to project
cd Lucky-Draw-Frontend

# 2. Install dependencies
npm install

# 3. Create environment file
copy .env.example .env
```

## 🚀 Start Development

```bash
npm start
```

Application opens at: **http://localhost:3000**

## 🔐 Login

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `any password`

## 📱 Main Features

### 1. Dashboard (`/dashboard`)
- View statistics and trends
- Monitor active contests
- Check pending actions

### 2. Contests (`/contests`)
- Create new contests
- Edit existing contests
- Manage prizes and rules

### 3. Participants (`/participants`)
- View all participants
- Import from CSV/Excel
- Export participant data
- Remove duplicates

### 4. Lucky Draw (`/draw`)
- Select contest and prize
- Execute random draw
- View animated winner reveal
- Re-draw if needed

### 5. Winners (`/winners`)
- View all winners
- Update prize status
- Send notifications
- Export reports

### 6. Communication (`/communication`)
- Send messages to participants
- Use pre-built templates
- View message history

### 7. Analytics (`/analytics`)
- View participation trends
- Contest performance metrics
- Export reports

### 8. Users (`/users`)
- Manage admin users
- Set roles and permissions
- View activity logs

### 9. Settings (`/settings`)
- Configure general settings
- Set notification preferences
- Security settings
- Email configuration

## 🎨 Customization Quick Tips

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color',
    // ...
  }
}
```

### Change Logo
Edit `src/components/layout/Sidebar.tsx` - Replace the `<Sparkles>` icon

### Change Site Name
1. Update `.env`: `REACT_APP_APP_NAME=Your Name`
2. Update `src/components/layout/Sidebar.tsx`

## 🔧 Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name
```

## 🐛 Quick Fixes

### Server won't start?
```bash
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Changes not showing?
- Save file (Ctrl+S)
- Hard refresh browser (Ctrl+Shift+R)

### Port 3000 in use?
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📚 Documentation

- **Full Guide**: `README.md`
- **All Features**: `FEATURES.md`
- **Setup Help**: `SETUP_GUIDE.md`
- **API Integration**: `API_INTEGRATION.md`
- **Components**: `COMPONENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Deployment**: `DEPLOYMENT_CHECKLIST.md`

## 🎯 Next Steps

1. ✅ Start the server
2. ✅ Login with demo credentials
3. ✅ Explore the dashboard
4. ✅ Create a test contest
5. ✅ Add test participants
6. ✅ Execute a lucky draw
7. ✅ Customize to your needs

## 💡 Pro Tips

- Use **React DevTools** browser extension for debugging
- Check **browser console** (F12) for errors
- All data is **mock data** - connect your backend API
- Read `API_INTEGRATION.md` to connect backend
- Use `COMPONENT_GUIDE.md` to understand components

## 🆘 Need Help?

1. Check `TROUBLESHOOTING.md`
2. Review error in browser console
3. Search error message online
4. Check project documentation

## 🎉 You're Ready!

The application is fully functional with mock data. Start exploring and customizing!

---

**Happy Coding! 🚀**
