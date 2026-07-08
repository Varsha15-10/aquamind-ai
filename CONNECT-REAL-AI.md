# 🤖 Connecting the Real AI Chatbot (Google Gemini API)

Your app already works with a built-in advisor (no setup needed). This guide
adds the **real Gemini AI** on top — so answers become fully conversational
instead of keyword-matched. If anything here isn't set up, the app quietly
falls back to the built-in advisor, so nothing ever breaks.

## Step 1: Get your free API key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **Create API Key** (choose "Create key in new project" if asked)
4. Copy the key that appears (a long string of letters/numbers) — keep this tab open in case you need it again

## Step 2: Add the key to the server

1. In your project folder, go into the `server` folder
2. Find the file called `.env.example`
3. Make a **copy** of it and rename the copy to exactly: `.env`
   (In VS Code: right-click `.env.example` → Copy → Paste → rename the pasted file to `.env`)
4. Open the new `.env` file and replace `paste_your_real_key_here` with your real key, e.g.:
   ```
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=3001
   ```
5. Save the file

⚠️ Never share this `.env` file or upload it to GitHub — it contains your
private key. A `.gitignore` file is already set up to prevent this automatically.

## Step 3: Install and run the backend server

You'll now run **two things at once**: your existing website (frontend) and
this new small server (backend). Keep both terminals open while testing.

1. In VS Code, open a **new terminal**: `Terminal > New Terminal`
2. Move into the server folder by typing:
   ```
   cd server
   ```
3. Install its dependencies (only needed once):
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. You should see:
   ```
   AquaMind AI backend proxy running at http://localhost:3001
   Gemini API key loaded ✔
   ```

## Step 4: Run the website like before (in a separate terminal)

1. Open **another** new terminal (`Terminal > New Terminal` again — don't close the server one)
2. Make sure you're in the main project folder (not `server`) — if needed type `cd ..`
3. Run:
   ```
   npm run dev
   ```
4. Open the `localhost:5173` link like before

## Step 5: Test it

1. Go to the **AI Water Advisor** page
2. Ask a question
3. If the server is running with a valid key, you'll get a real Gemini-generated answer
4. If you stop the server or the key isn't set, the chatbot automatically uses the
   built-in advisor instead — so your demo is always safe

## Troubleshooting

- **"No GEMINI_API_KEY found"** in the server terminal → your `.env` file
  isn't named exactly `.env`, or the key wasn't pasted in correctly.
- Chatbot gives good-but-generic answers → that means it's using the built-in
  fallback, meaning the server isn't running or isn't reachable. Check the
  server terminal for errors.
- Always keep **both** terminals (server + website) running at the same time
  while demoing.
