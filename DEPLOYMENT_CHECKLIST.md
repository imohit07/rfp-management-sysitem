# Deployment Checklist

Use this checklist to ensure your deployment is successful.

## Pre-Deployment

- [ ] Code changes committed to Git repository
- [ ] Repository pushed to GitHub/GitLab
- [ ] Gmail App Password generated (if using Gmail)
- [ ] Gemini API key ready

## Backend (Render)

- [ ] PostgreSQL database created on Render
- [ ] Copied Internal Database URL
- [ ] Web Service created and connected to Git repo
- [ ] Root Directory set to `backend`
- [ ] Build command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL` (PostgreSQL URL)
  - [ ] `GEMINI_API_KEY`
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - [ ] `IMAP_HOST`, `IMAP_PORT`, `IMAP_SECURE`, `IMAP_USER`, `IMAP_PASS`
  - [ ] `FRONTEND_URL` (will update after Vercel deployment)
- [ ] Backend deployed successfully
- [ ] Backend URL copied
- [ ] Health check passing: `curl https://your-backend.onrender.com/health`

## Frontend (Vercel)

- [ ] Updated `frontend/.env.production` with backend URL
- [ ] New Project created on Vercel (or connected via CLI)
- [ ] Root Directory set to `frontend`
- [ ] Framework Preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added:
  - [ ] `VITE_API_URL` (your Render backend URL)
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied
- [ ] Can access frontend in browser

## Post-Deployment

- [ ] Updated `FRONTEND_URL` in Render backend with actual Vercel URL
- [ ] Backend redeployed after CORS update
- [ ] Browser DevTools shows no CORS errors
- [ ] Can create a vendor in the UI
- [ ] Can create an RFP using AI
- [ ] API requests go to correct backend URL (check Network tab)

## Testing

- [ ] Create a vendor
- [ ] Create an RFP from text (AI test)
- [ ] Send RFP to vendor (email test)
- [ ] Polling service status shows correctly
- [ ] Manual poll works
- [ ] Proposals appear after vendor replies
- [ ] AI comparison works

## Troubleshooting References

If something doesn't work, check:
- Render backend logs (Render Dashboard → your service → Logs)
- Browser console for errors (F12 → Console)
- Network tab for failed requests (F12 → Network)
- DEPLOYMENT_GUIDE.md Troubleshooting section

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| CORS error | Update `FRONTEND_URL` in Render backend, redeploy |
| API calls fail | Check `VITE_API_URL` in Vercel matches Render URL |
| Database error | Use Internal Database URL (not External) |
| Email not sending | Use Gmail App Password, not regular password |
| Backend slow | Render free tier sleeps; first request takes 30-60s |
