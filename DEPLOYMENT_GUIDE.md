# Deployment Guide

This guide explains how to deploy your RFP Management System with the frontend on Vercel and backend on Render.

## Issues Fixed

The following issues have been resolved:
1. ✅ Frontend now uses `VITE_API_URL` environment variable to connect to backend
2. ✅ Backend CORS configured to accept requests from Vercel
3. ✅ All API calls updated to use dynamic URL based on environment

---

## Backend Deployment (Render)

### Prerequisites
- Render account (https://render.com)
- PostgreSQL database (Render provides free PostgreSQL)

### Steps

1. **Create a PostgreSQL Database on Render**
   - Go to Render Dashboard → New → PostgreSQL
   - Choose a name (e.g., `rfp-db`)
   - Select the free tier
   - Click "Create Database"
   - Copy the **Internal Database URL** (starts with `postgresql://`)

2. **Deploy Backend to Render**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `rfp-backend` (or your choice)
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables**
   
   In the Render dashboard for your backend service, add these environment variables:
   
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-internal-database-url>
   
   GEMINI_API_KEY=<your-gemini-api-key>
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<your-email>
   SMTP_PASS=<your-app-password>
   SMTP_FROM="RFP Bot <your-email>"
   
   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_SECURE=true
   IMAP_USER=<your-email>
   IMAP_PASS=<your-app-password>
   
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

   **Important Notes:**
   - Replace `<your-postgres-internal-database-url>` with the Internal Database URL from step 1
   - Use your actual Gemini API key
   - For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
   - Update `FRONTEND_URL` after deploying to Vercel (step below)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)
   - Copy your backend URL (e.g., `https://rfp-backend.onrender.com`)

5. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   You should see: `{"status":"ok"}`

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- Your backend URL from Render

### Steps

1. **Update Production Environment File**
   
   Edit `frontend/.env.production` with your actual Render backend URL:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Deploy to Vercel**
   
   Option A - Using Vercel CLI:
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```

   Option B - Using Vercel Dashboard:
   - Go to Vercel Dashboard → Add New Project
   - Import your Git repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**
   
   In Vercel project settings → Environment Variables, add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   
   Make sure to select "Production" for the environment.

4. **Deploy**
   - If using CLI, run `vercel --prod`
   - If using Dashboard, click "Deploy"
   - Copy your Vercel app URL (e.g., `https://rfp-management.vercel.app`)

5. **Update Backend CORS**
   
   Go back to Render backend service → Environment:
   - Update the `FRONTEND_URL` variable with your actual Vercel URL
   - Example: `FRONTEND_URL=https://rfp-management.vercel.app`
   - Click "Save Changes" (this will redeploy the backend)

---

## Verification

1. **Check Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Check Frontend**
   - Open your Vercel URL in a browser
   - Open browser DevTools (F12) → Network tab
   - Try creating a vendor
   - Verify requests go to your Render backend URL

3. **Test Full Workflow**
   - Create a vendor
   - Create an RFP using AI
   - Send RFP to vendor
   - Check email polling works

---

## Troubleshooting

### CORS Errors
**Symptom**: Browser console shows CORS errors

**Solution**:
- Verify `FRONTEND_URL` in Render backend matches your exact Vercel URL
- Check if both URLs use HTTPS
- Redeploy backend after changing `FRONTEND_URL`

### Frontend Can't Connect to Backend
**Symptom**: API calls fail, network errors in console

**Solution**:
- Check `VITE_API_URL` in Vercel environment variables
- Verify the backend URL is accessible: `curl https://your-backend-url.onrender.com/health`
- Check Render backend logs for errors

### Database Connection Issues
**Symptom**: Backend crashes with database errors

**Solution**:
- Verify `DATABASE_URL` in Render is the **Internal Database URL** (not External)
- Check if Prisma migrations ran during build:
  - Go to Render backend → Logs
  - Look for "Prisma migrate deploy" output
- If migrations didn't run, manually trigger redeploy

### Email Features Not Working
**Symptom**: Can't send or receive emails

**Solution**:
- For Gmail, ensure you're using an [App Password](https://support.google.com/accounts/answer/185833)
- Verify SMTP/IMAP credentials are correct in Render environment variables
- Check backend logs for specific email errors

### Render Free Tier Limitations
**Issue**: Backend spins down after 15 minutes of inactivity

**Solution**:
- Free tier instances sleep after inactivity
- First request after sleeping takes 30-60 seconds
- Consider upgrading to paid tier for production use
- Or set up a cron job to ping `/health` every 10 minutes

---

## Database Schema Note

The backend will automatically run migrations on deployment. If you need to run migrations manually:

```bash
# In Render Shell (Render Dashboard → your service → Shell)
npx prisma migrate deploy
```

---

## Cost Estimation

- **Vercel**: Free tier (hobby) should be sufficient for most use cases
- **Render Backend**: Free tier (spins down after 15 min inactivity)
- **Render PostgreSQL**: Free tier (1GB storage, 90 day data retention)

**Total**: $0/month for testing/development

For production with better performance:
- Render Starter ($7/month per service)
- PostgreSQL Starter ($7/month)

---

## Security Recommendations

1. **Environment Variables**: Never commit `.env` files to Git
2. **API Keys**: Rotate Gemini API key periodically
3. **Database**: Use Internal Database URL on Render (never External)
4. **CORS**: Keep `FRONTEND_URL` restricted to your actual domain
5. **Gmail**: Use App Passwords, not your actual Gmail password

---

## Next Steps

After successful deployment:

1. Test all features end-to-end
2. Set up monitoring (Render provides basic logs)
3. Consider adding error tracking (e.g., Sentry)
4. Set up database backups
5. Add rate limiting to API endpoints
6. Consider adding authentication for multi-user support
