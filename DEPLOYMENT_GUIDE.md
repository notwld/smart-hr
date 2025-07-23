# 🚀 Production Deployment Guide - Fix Authentication Issues

This guide addresses the common issue where admin pages work on localhost but redirect to login in production.

## 🔥 **Critical Environment Variables for Production**

### **1. NextAuth Configuration**
```bash
# CRITICAL: Must be set to your production domain
NEXTAUTH_URL=https://yourdomain.com

# CRITICAL: Must be a secure random string (32+ characters)
NEXTAUTH_SECRET=your-super-secure-secret-min-32-chars

# Optional: Enable debug in production for troubleshooting
NEXTAUTH_DEBUG=false

# Optional: For cookie domain configuration
COOKIE_DOMAIN=.yourdomain.com
```

### **2. Database Configuration**
```bash
# Production database connection
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## 🛠️ **Deployment Platform Specific Settings**

### **Vercel Deployment**

1. **Environment Variables in Vercel Dashboard:**
   ```bash
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   DATABASE_URL=your-production-database-url
   ```

2. **Vercel System Environment Variables:**
   - ✅ Enable "Automatically expose System Environment Variables"
   - This allows the app to use `VERCEL_URL` for dynamic URL configuration

### **Other Platforms (Netlify, Railway, etc.)**

Set all environment variables manually in your platform's dashboard:
```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-database-url
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: NEXTAUTH_URL not set correctly**
**Symptoms:** Redirects to login, console shows `CLIENT_FETCH_ERROR`

**Solution:**
```bash
# For Vercel
NEXTAUTH_URL=https://your-project.vercel.app

# For custom domain
NEXTAUTH_URL=https://yourdomain.com

# For subdomain
NEXTAUTH_URL=https://app.yourdomain.com
```

### **Issue 2: NEXTAUTH_SECRET missing or weak**
**Symptoms:** JWT decode errors, session not persisting

**Solution:**
```bash
# Generate a strong secret
openssl rand -base64 32

# Or use this online generator
# https://generate-secret.vercel.app/32

NEXTAUTH_SECRET=your-generated-32-char-secret
```

### **Issue 3: Cookie Domain Issues**
**Symptoms:** Login works but sessions don't persist across subdomain

**Solution:**
```bash
# For main domain
COOKIE_DOMAIN=yourdomain.com

# For subdomain sharing
COOKIE_DOMAIN=.yourdomain.com
```

### **Issue 4: Database Connection Issues**
**Symptoms:** 500 errors, can't authenticate users

**Solution:**
```bash
# Ensure SSL for production databases
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Check connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&connection_limit=10"
```

## 🔧 **Debugging Steps**

### **1. Enable Debug Logging**
```bash
# In production (temporarily)
NEXTAUTH_DEBUG=true
```

### **2. Check Browser Console**
Look for these errors:
- `CLIENT_FETCH_ERROR` → NEXTAUTH_URL issue
- `JSON.parse: unexpected character` → CORS or URL issue
- `Failed to fetch` → Network/CORS issue

### **3. Check Network Tab**
- Verify `/api/auth/session` returns 200
- Check if cookies are being set with correct domain
- Verify HTTPS is used in production

### **4. Test Authentication Flow**
```bash
# Test session endpoint directly
curl https://yourdomain.com/api/auth/session

# Should return either session data or null, not error
```

## 🧪 **Testing Production Locally**

To test production configuration locally:

1. **Build and start production server:**
```bash
npm run build
npm start
```

2. **Use production environment variables:**
```bash
# Create .env.production.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-database-url
```

## 🚀 **Deployment Checklist**

- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` set to secure random string (32+ chars)
- [ ] `DATABASE_URL` configured for production
- [ ] SSL/HTTPS enabled on domain
- [ ] Cookies configured for production domain
- [ ] Database migrations run
- [ ] Test login flow after deployment
- [ ] Verify admin routes accessible
- [ ] Check session persistence

## 🆘 **Emergency Debugging**

If still having issues:

1. **Enable verbose logging:**
```typescript
// In app/api/auth/[...nextauth]/route.ts
debug: true
```

2. **Add console logs to middleware:**
```typescript
console.log("Middleware token:", token);
console.log("Environment:", process.env.NODE_ENV);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
```

3. **Test direct API calls:**
```bash
# Test if API auth works
curl -X POST https://yourdomain.com/api/auth/signin/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

## 📋 **Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| `CLIENT_FETCH_ERROR` | NEXTAUTH_URL mismatch | Set correct NEXTAUTH_URL |
| `Configuration error` | Missing secret | Add NEXTAUTH_SECRET |
| `CSRF token mismatch` | Cookie domain issue | Fix COOKIE_DOMAIN |
| `Session not found` | Database connection | Check DATABASE_URL |
| `Unauthorized` | Role not set correctly | Check user role in database |

## 🔄 **Migration from Dev to Production**

1. **Export development database:**
```bash
pg_dump development_db > backup.sql
```

2. **Import to production:**
```bash
psql production_db < backup.sql
```

3. **Update environment variables**
4. **Test authentication flow**
5. **Monitor logs for errors**

---

## ⚡ **Quick Fix Commands**

Generate new secret:
```bash
openssl rand -base64 32
```

Test production build locally:
```bash
npm run build && npm start
```

Check environment variables:
```bash
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
```

---

**Need more help?** Check the console logs in your deployment platform and compare them with the error patterns above. 