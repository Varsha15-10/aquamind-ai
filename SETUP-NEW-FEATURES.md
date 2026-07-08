# 🔐 New Features Setup Guide: Login, Database, PDF Reports & More

This guide covers the **newly added** features only. Everything that worked before
still works exactly the same, with zero setup — this is purely additive.

## ✅ Works instantly, no setup needed
- Dark/Light mode toggle (bottom of sidebar)
- Language selector — English / Tamil / Hindi (bottom of sidebar)
- Drought Risk Score (Dashboard) — uses free live weather data
- Leak Alert History Log (Dashboard) — saved in your browser automatically
- SMS Alert Simulation — a toast notification appears when a leak is detected
- Municipal Report PDF download (Dashboard) — generates instantly in your browser

## 🔧 Requires setup: User Login, Registration & Database

To enable **My Profile / Login** (creating real accounts, saving usage history,
alerts, and chat history to a real database), you need a free MongoDB database.

### Step 1: Create a free MongoDB Atlas database
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free)
2. Create a free **M0 cluster** (no credit card required for the free tier)
3. Under "Database Access," create a database user with a username/password
4. Under "Network Access," click "Add IP Address" → "Allow Access From Anywhere" (fine for a hackathon demo)
5. Click "Connect" → "Drivers" → copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `username` and `password` in that string with your actual database user credentials

### Step 2: Add it to your server
1. Open `server/.env` (the same file where your Gemini key lives)
2. Add these two lines:
   ```
   MONGODB_URI=paste_your_connection_string_here
   JWT_SECRET=any_long_random_string_you_make_up
   ```
3. Save the file

### Step 3: Install the new backend dependencies
In your terminal (inside the `server` folder):
```
npm install
```
This installs `mongoose`, `bcryptjs`, and `jsonwebtoken` (added for auth/database support).

### Step 4: Restart the server
```
npm start
```
You should see `MongoDB connected ✔` in the terminal.

### Step 5: Try it
1. Go to **My Profile / Login** in the sidebar (under "Admin")
2. Click "New here? Create an account"
3. Register, then you're logged in — your JWT token and profile are stored securely

## 📡 New REST API Endpoints (for your technical documentation / pitch)

```
POST   /api/auth/register       Create a new account
POST   /api/auth/login          Log in, returns a JWT token
GET    /api/usage                Get your usage history (requires login)
POST   /api/usage                Save a usage record (requires login)
GET    /api/alerts                Get your alerts (requires login)
POST   /api/alerts                Create an alert (requires login)
PATCH  /api/alerts/:id/resolve    Mark an alert resolved (requires login)
GET    /api/water-score           Get your calculated water credit score (requires login)
GET    /api/chat/history           Get saved chatbot conversations (requires login)
POST   /api/chat/history           Save a chatbot conversation (requires login)
GET    /api/admin/users            List all users (admin role only)
```

All protected endpoints require an `Authorization: Bearer <token>` header, using
the token returned from login/register.

## 🚀 Deploying the Backend Online (so it works without your laptop running)

1. Push your project to GitHub (if not already)
2. Go to https://render.com (free tier) → "New" → "Web Service"
3. Connect your GitHub repo, set the **root directory** to `server`
4. Build command: `npm install` — Start command: `npm start`
5. Add environment variables in Render's dashboard: `GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, `PORT` (Render sets this automatically, but you can leave your default too)
6. Deploy — you'll get a live URL like `https://aquamind-server.onrender.com`
7. Update the `API_BASE` constant at the top of `src/components/AuthPage.jsx` (and similarly in `Chatbot.jsx` if it calls the backend) to point to this live URL instead of `http://localhost:3001`

## 👑 Role-Based Access

New accounts default to the `user` role. To create an `admin` account for testing
the admin-only endpoint, you can manually update a user's role field to `"admin"`
directly in MongoDB Atlas (Collections → users → edit the document) — a full
admin-invite flow is a good "next step" item for your pitch's roadmap slide.
