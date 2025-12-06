# 🚀 Deploy Frontend to Vercel - Quick Guide

Your backend is already deployed and working!
✅ Backend: https://rfp-management-sysitem.onrender.com

## Next Steps: Deploy Frontend

### Option 1: Using Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Go to frontend directory
cd /Users/aaravairan/Downloads/rfp-management-sysitem/frontend

# 3. Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? rfp-management (or your choice)
# - In which directory is your code located? ./
# - Want to override settings? No

# 4. Deploy to production
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://rfp-management-sysitem.onrender.com`
   - **Environment**: Production
5. Click "Deploy"

## After Frontend Deploys

Once Vercel gives you your frontend URL (e.g., `https://rfp-management-abc123.vercel.app`):

### Update Backend CORS

1. Go to https://dashboard.render.com
2. Select your backend service: `rfp-management-sysitem`
3. Go to "Environment" tab
4. Add or update environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-vercel-url.vercel.app` (your actual Vercel URL)
5. Click "Save Changes" (this will redeploy your backend)

## Test Your Deployment

1. Open your Vercel URL in browser
2. Press F12 to open DevTools → Network tab
3. Try creating a vendor
4. Verify requests go to `https://rfp-management-sysitem.onrender.com/api/...`

## Troubleshooting

### CORS Error in Browser Console

**Problem**: You see "CORS policy" errors

**Solution**: 
- Make sure you set `FRONTEND_URL` in Render backend to your exact Vercel URL
- Wait for backend to finish redeploying (check Render dashboard logs)

### API Calls Fail with 404

**Problem**: Requests go to wrong URL

**Solution**:
- Verify `VITE_API_URL` is set in Vercel environment variables
- Redeploy frontend after adding the variable

### Backend Is Slow (30-60 seconds for first request)

**Explanation**: Render free tier sleeps after 15 minutes of inactivity

**Solution**: This is normal. Consider upgrading to Render Starter ($7/mo) for always-on backend.

## What's Already Configured

✅ Frontend configured to use: `https://rfp-management-sysitem.onrender.com`
✅ Backend health check passing: `{"status":"ok"}`
✅ All API calls will route through your backend URL
✅ Build tested and working locally

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_API_URL=https://rfp-management-sysitem.onrender.com
```

### Backend (Render)
```
FRONTEND_URL=https://your-vercel-url.vercel.app   # Update after deploying
DATABASE_URL=<your-postgres-url>                   # Already set
GEMINI_API_KEY=<your-key>                         # Already set
# ... other variables already set
```

---

**Ready?** Run the commands above to deploy! 🚀

For more details, see DEPLOYMENT_GUIDE.md
