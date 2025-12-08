# Frontend Production Deployment Checklist

## Pre-deployment Steps

### 1. Environment Configuration
- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Update all production URLs in `.env.production`:
  - [ ] `NEXT_PUBLIC_SITE_URL` (your production domain)
  - [ ] `NEXT_PUBLIC_BACKEND_URL` (your backend domain)
  - [ ] `NEXT_PUBLIC_META_REDIRECT_URI` (update with production backend URL)
- [ ] Verify all API keys are production-ready
- [ ] Remove any development-only environment variables

### 2. Code Quality
- [ ] Run `npm run lint:fix` to fix linting issues
- [ ] Run `npm run type-check` to verify TypeScript
- [ ] Run `npm run build` to test production build
- [ ] Review and fix any build warnings

### 3. Performance Optimizations
- [ ] Optimize images (use Next.js Image component)
- [ ] Remove unused dependencies
- [ ] Enable compression in deployment platform
- [ ] Configure CDN if needed

### 4. Security
- [ ] Security headers are configured in `next.config.ts`
- [ ] Remove any debug logs or sensitive information
- [ ] Verify CSP policies if implemented
- [ ] Enable HTTPS in production

### 5. SEO & Analytics
- [ ] Add Google Analytics ID to environment variables
- [ ] Configure meta tags for all pages
- [ ] Add sitemap.xml and robots.txt
- [ ] Test social media previews

## Deployment Commands

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or connect GitHub for automatic deployments
```

### Docker Deployment
```bash
# Build production container
docker build -t realty-genie-frontend .

# Run container
docker run -p 3000:3000 realty-genie-frontend
```

### Manual Build & Deploy
```bash
# Build for production
npm run build:production

# Start production server
npm run start
```

## Post-deployment Verification

### 1. Functionality Testing
- [ ] All authentication flows work
- [ ] API connections to backend are successful
- [ ] File uploads work correctly
- [ ] Email generation functions properly
- [ ] Meta/Facebook integration works

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals scores are good
- [ ] Mobile responsiveness works
- [ ] Error handling works correctly

### 3. Monitoring Setup
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] User analytics

## Environment Variables Required for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wkgpytqjrwvryufkewpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
NEXT_PUBLIC_META_APP_SECRET=your_meta_app_secret
NEXT_PUBLIC_META_REDIRECT_URI=https://your-backend-domain.com/api/autopost/meta/callback
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

## Build Verification

Current build status: ✅ PASSING
- Compiled successfully
- All routes generated
- No critical TypeScript errors
- Production optimizations enabled

## Known Issues to Address in Production

1. **Linting Warnings**: 141 warnings (mostly unused variables - not build-breaking)
2. **TypeScript**: Some `any` types used (acceptable for MVP)
3. **Images**: Some images use `<img>` instead of `<Image>` (performance impact)
4. **Accessibility**: Review for WCAG compliance

## Performance Optimizations Applied

- ✅ SWC minification enabled
- ✅ Compression enabled
- ✅ Security headers configured
- ✅ Development indicators disabled in production
- ✅ Turbopack configuration for faster builds
- ✅ Image optimization configured

## Recommended Production Infrastructure

- **Hosting**: Vercel (optimized for Next.js)
- **CDN**: Vercel Edge Network or Cloudflare
- **Database**: Supabase (already configured)
- **Monitoring**: Vercel Analytics + Sentry
- **SSL**: Automatic with Vercel/Cloudflare