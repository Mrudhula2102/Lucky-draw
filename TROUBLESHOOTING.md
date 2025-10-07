# Troubleshooting Guide

Common issues and their solutions for the Lucky Draw Frontend application.

## 🔧 Installation Issues

### Issue: Module not found errors

**Symptoms:**
```
Cannot find module 'lucide-react'
Cannot find module 'react-hot-toast'
Cannot find module 'zustand'
```

**Solution:**
```bash
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install --force
```

### Issue: Dependency conflicts

**Symptoms:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Issue: React version mismatch

**Solution:**
The package.json has been configured with React 18.2.0 for compatibility. If you need React 19, update all related packages.

---

## 🚀 Runtime Issues

### Issue: Port 3000 already in use

**Windows:**
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Or change port:**
```bash
# Set PORT environment variable
$env:PORT=3001; npm start
```

### Issue: White screen on load

**Possible causes:**
1. JavaScript errors in console
2. Routing issues
3. Missing environment variables

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify `.env` file exists
4. Clear browser cache

### Issue: API calls failing

**Symptoms:**
- Login not working
- Data not loading
- Network errors

**Solution:**
1. Check `.env` file has correct API URL
2. Verify backend is running
3. Check browser console for CORS errors
4. Verify network tab in DevTools

---

## 🎨 Styling Issues

### Issue: Tailwind classes not working

**Solution:**
1. Verify `tailwind.config.js` exists
2. Check `index.css` has Tailwind directives
3. Restart development server
4. Clear browser cache

### Issue: CSS warnings about @tailwind

**This is normal!** The warnings about `@tailwind` and `@apply` directives are expected and can be ignored. These are Tailwind CSS directives that work correctly at runtime.

---

## 📦 Build Issues

### Issue: Build fails with TypeScript errors

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix specific errors shown
# Most common: missing type definitions
npm install --save-dev @types/[package-name]
```

### Issue: Build succeeds but app doesn't work

**Solution:**
1. Check environment variables are set for production
2. Verify routing configuration
3. Test build locally:
```bash
npm run build
npx serve -s build
```

---

## 🔐 Authentication Issues

### Issue: Can't login

**Solution:**
1. For demo: Use any email/password
2. For production: Verify backend API is running
3. Check browser console for errors
4. Verify JWT token storage in DevTools > Application > Local Storage

### Issue: Logged out unexpectedly

**Possible causes:**
1. Token expired
2. Local storage cleared
3. Backend session ended

**Solution:**
1. Check token expiration logic
2. Implement refresh token mechanism
3. Add better error handling

---

## 🗄️ State Management Issues

### Issue: State not persisting

**Solution:**
1. Check Zustand persist configuration
2. Verify localStorage is not disabled
3. Check browser privacy settings
4. Clear localStorage and try again

### Issue: State updates not reflecting

**Solution:**
1. Verify you're using the store correctly
2. Check component is subscribed to store
3. Use React DevTools to inspect state

---

## 📊 Chart Issues

### Issue: Charts not displaying

**Solution:**
1. Verify Chart.js is installed
2. Check console for Chart.js errors
3. Verify data format matches chart requirements
4. Check chart container has height/width

### Issue: Charts look distorted

**Solution:**
1. Add explicit height to chart container
2. Set `maintainAspectRatio: false` in options
3. Use responsive container

---

## 🔄 Hot Reload Issues

### Issue: Changes not reflecting

**Solution:**
1. Save the file (Ctrl+S)
2. Check terminal for compilation errors
3. Hard refresh browser (Ctrl+Shift+R)
4. Restart development server

---

## 💾 Import/Export Issues

### Issue: CSV/Excel import not working

**Solution:**
1. Verify XLSX package is installed
2. Check file format is correct
3. Verify file size is reasonable
4. Check browser console for errors

### Issue: Export downloads empty file

**Solution:**
1. Verify data exists before export
2. Check export function logic
3. Test with small dataset first

---

## 🌐 Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Issue: App not working in older browsers

**Solution:**
1. Update browser to latest version
2. Check for polyfills if needed
3. Verify ES6+ features are supported

---

## 📱 Mobile Issues

### Issue: Layout broken on mobile

**Solution:**
1. Test responsive breakpoints
2. Check Tailwind responsive classes
3. Verify viewport meta tag in index.html
4. Test on actual device, not just emulator

### Issue: Touch events not working

**Solution:**
1. Use onClick instead of onMouseDown
2. Test on actual mobile device
3. Add touch-action CSS if needed

---

## 🐛 Common TypeScript Errors

### Error: Parameter implicitly has 'any' type

**Solution:**
Add type annotations:
```typescript
// Before
const handleClick = (item) => { }

// After
const handleClick = (item: Contest) => { }
```

### Error: Cannot find module

**Solution:**
```bash
npm install [missing-package]
# or for types
npm install --save-dev @types/[package-name]
```

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Add to your component:
```typescript
useEffect(() => {
  console.log('Component mounted', { props, state });
}, []);
```

### React DevTools

1. Install React DevTools browser extension
2. Inspect component tree
3. View props and state
4. Profile performance

### Network Debugging

1. Open DevTools > Network tab
2. Filter by XHR/Fetch
3. Inspect request/response
4. Check status codes

---

## 🆘 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search error message online
3. ✅ Check browser console
4. ✅ Verify all dependencies installed
5. ✅ Try clean install

### When Asking for Help

Include:
- Error message (full text)
- Browser and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Steps to reproduce
- What you've already tried

---

## 📝 Quick Fixes Checklist

When something isn't working:

- [ ] Check browser console for errors
- [ ] Verify all dependencies installed
- [ ] Check `.env` file exists and is correct
- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check network tab for failed requests
- [ ] Verify backend is running (if applicable)
- [ ] Check file paths are correct
- [ ] Look for typos in code

---

## 🔄 Reset Everything

If all else fails:

```bash
# Stop development server (Ctrl+C)

# Clean everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install --force

# Restart
npm start
```

---

## 📞 Support Resources

- **Documentation**: Check all .md files in project root
- **React Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/
- **Tailwind Docs**: https://tailwindcss.com/
- **Stack Overflow**: Search for specific errors

---

**Last Updated**: October 1, 2025

**Remember**: Most issues can be solved by reading error messages carefully and checking the browser console! 🔍
