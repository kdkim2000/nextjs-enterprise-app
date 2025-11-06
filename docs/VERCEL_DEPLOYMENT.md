# Vercel Deployment Guide

This guide explains how to deploy the Next.js Enterprise App to Vercel.

## ✅ 완전히 통합된 배포!

**좋은 소식**: 백엔드가 이제 Next.js API Routes로 구현되어 **별도 서버 배포가 필요 없습니다**!

프론트엔드와 백엔드가 모두 Vercel에서 서버리스 함수로 실행됩니다.

## 🚀 빠른 배포 (권장)

### 단일 배포로 완전한 애플리케이션!

1. **GitHub에 푸시**
   ```bash
   git push origin main
   ```

2. **Vercel에서 Import**
   - https://vercel.com/new
   - GitHub 저장소 선택

3. **환경 변수 설정** (Vercel Dashboard)
   ```bash
   # API 설정 (Next.js API Routes 사용)
   NEXT_PUBLIC_API_URL=/api

   # JWT Secrets (보안 키 생성)
   JWT_SECRET=<생성된-보안-키>
   JWT_REFRESH_SECRET=<생성된-보안-키>

   # Session 설정
   SESSION_TIMEOUT=1800000
   SESSION_WARNING_TIME=120000
   ```

4. **배포!**
   - Deploy 버튼 클릭
   - 완료! 🎉

## 🔑 환경 변수 생성

보안 키 생성:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📋 이전 방식 (더 이상 필요 없음)

<details>
<summary>Option 2: Frontend + Separate Backend (레거시)</summary>

이전에는 Express 백엔드를 별도로 배포해야 했지만, 이제는 **필요 없습니다**!

모든 API 기능이 Next.js API Routes로 마이그레이션되었습니다.

#### Backend Deployment Options:

**A. Railway.app (Recommended)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy backend
railway login
railway init
railway up
```

**B. Render.com**
1. Create new Web Service
2. Connect your repository
3. Set Build Command: `npm install`
4. Set Start Command: `node backend/server.js`
5. Add environment variables

**C. Heroku**
```bash
# Create Procfile
echo "web: node backend/server.js" > Procfile

# Deploy
heroku create your-app-backend
git push heroku main
```

#### Vercel Frontend Setup:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select framework: Next.js

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:

   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.com/api
   ```

4. **Deploy**
   Click "Deploy" button

## Environment Variables Reference

### Required for Vercel (Frontend)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com/api` |

### Required for Backend Deployment
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | (generate secure random string) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (generate secure random string) |
| `BACKEND_PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |
| `SESSION_TIMEOUT` | Session timeout in ms | `1800000` |
| `SESSION_WARNING_TIME` | Warning time in ms | `120000` |

### Generate Secure Secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Post-Deployment Configuration

### 1. Update CORS Settings
Update `backend/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://your-app.vercel.app',
      'https://your-app-*.vercel.app', // Preview deployments
      /^http:\/\/localhost:\d+$/
    ];
    // ... validation logic
  },
  credentials: true
}));
```

### 2. Test the Deployment
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try logging in with test credentials
3. Check browser console for any API errors
4. Verify API calls are reaching your backend

## Troubleshooting

### Issue: 404 on Root Path
**Solution:** The app automatically redirects `/` to `/en/login`. Make sure `next.config.ts` has the redirect configured.

### Issue: API Calls Failing
**Causes:**
- Backend not deployed or not running
- CORS not configured for Vercel domain
- Wrong `NEXT_PUBLIC_API_URL` in environment variables

**Fix:**
1. Verify backend is accessible: `curl https://your-backend-url.com/health`
2. Check Vercel environment variables
3. Redeploy frontend after changing env vars

### Issue: Middleware Warning
The warning `middleware file convention is deprecated` is from Next.js 16. It doesn't affect functionality but you can update to use `proxy.ts` in the future.

### Issue: Build Failures
**Common causes:**
- TypeScript errors (run `npm run type-check`)
- Missing environment variables
- Node version mismatch

**Fix:**
- Set Node.js version in package.json:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

## Local Testing Before Deployment

```bash
# Build production version
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Commits to `main` branch
- **Preview:** Pull requests and other branches

## Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update CORS settings in backend to allow your custom domain

## Monitoring

- **Vercel Analytics:** Enable in project settings
- **Error Tracking:** Consider adding Sentry or similar
- **Backend Monitoring:** Use your backend host's monitoring tools

## Security Checklist

- [ ] Changed default JWT secrets
- [ ] Configured CORS properly
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables set in Vercel (not in code)
- [ ] Rate limiting enabled on backend
- [ ] Removed test/demo credentials in production

## Support

For issues specific to:
- **Vercel Deployment:** Check [Vercel Documentation](https://vercel.com/docs)
- **Next.js:** Check [Next.js Documentation](https://nextjs.org/docs)
- **This App:** Check project README.md

## Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "Deploy to production"
git push

# 2. Vercel will auto-deploy

# 3. For manual deployment via CLI (optional)
npm i -g vercel
vercel --prod
```

## Current Deployment Status

- **Frontend URL:** https://nextjs-enterprise-app-gamma.vercel.app
- **Backend:** Needs deployment (see options above)
- **Status:** Frontend deployed, backend required for full functionality
