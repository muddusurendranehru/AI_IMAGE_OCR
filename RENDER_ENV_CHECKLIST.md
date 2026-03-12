# Render Environment Variables Checklist

Use this checklist to fix **500 Internal Server Error** on login/signup when deployed to Render (e.g. https://ai-image-ocr-5ejd.onrender.com).

## Where to set variables

**Render Dashboard** → Your **Web Service** → **Environment** tab → **Environment Variables**.

---

## Required (must be set for auth to work)

| Variable        | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | **Yes**  | Neon PostgreSQL connection string. Example: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`. Get it from Neon dashboard → Connection string. |
| `JWT_SECRET`   | **Yes**  | Secret used to sign JWT tokens. If missing, **login and signup return 500**. Use a long random string (e.g. 32+ chars). Example: `openssl rand -hex 32`. |

---

## Optional (recommended for production)

| Variable        | Required | Description |
|----------------|----------|-------------|
| `NODE_ENV`     | No       | Set to `production` on Render. |
| `FRONTEND_URL` | No       | Your frontend origin for CORS (e.g. `https://your-app.onrender.com` or Vercel URL). |
| `PORT`         | No       | Render sets this automatically; only override if needed. |

---

## Optional (for OCR / lab reports)

| Variable               | Required | Description |
|------------------------|----------|-------------|
| `USE_TESSERACT`        | No       | Set to `true` to use local Tesseract instead of Google Vision. |
| `GOOGLE_VISION_API_KEY`| No       | Path to Google service account JSON or API key; needed if not using Tesseract. |

---

## Quick debug after deploy

1. **Check logs on deploy**  
   After deploy, open **Logs** in Render. You should see:
   - `Environment (Render): { DATABASE_URL: true, JWT_SECRET: true, ... }`  
   If `JWT_SECRET: false` or `DATABASE_URL: false`, add the missing variable and redeploy.

2. **Call the health endpoint**  
   Open in browser or curl:
   ```text
   https://ai-image-ocr-5ejd.onrender.com/api/health
   ```
   Response tells you:
   - `env.hasJwtSecret` / `env.hasDatabaseUrl` — are env vars set?
   - `database.connected` — can the app reach Neon?
   - `database.error` — DB error message if connection failed.

3. **Redeploy**  
   After changing Environment variables, use **Manual Deploy** → **Deploy latest commit** (or push a new commit) so the new env is picked up.

---

## Summary

- **Login/signup 500** is often caused by **missing `JWT_SECRET`** or **wrong/missing `DATABASE_URL`**.
- Set `DATABASE_URL` and `JWT_SECRET` in Render → Environment, then redeploy.
- Use **Logs** and **GET /api/health** to confirm env and DB status.

---

## Test commands (after redeploy)

**1. Health check** (expect `status: "ok"` and `database.connected: true` when env is set):

```bash
curl https://ai-image-ocr-5ejd.onrender.com/api/health | jq
```

Expected when OK:

```json
{
  "success": true,
  "status": "ok",
  "env": { "hasDatabaseUrl": true, "hasJwtSecret": true, "NODE_ENV": "production" },
  "database": { "connected": true }
}
```

**2. Invalid login** (must return **401**, not 500):

```bash
curl -X POST https://ai-image-ocr-5ejd.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

Expected: `401` with `"error": "Invalid email or password."`

**3. Force a DB error to test logging**

- In Render Dashboard → your Web Service → **Environment**, remove or rename `DATABASE_URL`.
- **Manual Deploy** → Deploy latest commit.
- Check **Logs** for the new `[AUTH] Login error:` and `[/api/health] DB check failed:` messages.
- Call `GET /api/health` — should return `503`, `database.connected: false`, and `database.error` set.
- Restore `DATABASE_URL` and redeploy.
