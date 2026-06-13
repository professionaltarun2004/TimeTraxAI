# Workforce Cost Copilot

An AI-powered executive dashboard that analyzes workforce meeting costs, detects cost leakages, and attributes time spent to specific projects using Google Calendar metadata and OpenRouter AI.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Authentication:** Google OAuth (`@react-oauth/google`)
- **Charts:** Recharts
- **AI Engine:** OpenRouter API (`openai/gpt-4o-mini`)
- **Icons:** Lucide React
- **Deployment:** Vercel Ready

## Features
1. **Google Calendar Sync:** Securely import calendar events via OAuth.
2. **AI Project Attribution:** Automatically classify meetings into Client, Internal, Operations, etc.
3. **Cost Leakage Detection:** AI detects bloated meetings, low attendance, and excessive recurring syncs.
4. **Project Risk Engine:** Algorithmically calculates risk scores based on cost overruns and meeting volume.
5. **Executive Copilot Brief:** Generates a high-level summary of "What happened?", "Why?", and "Potential Savings".
6. **Demo Mode:** Fully functional without API keys using realistic mock datasets.

## Getting Started

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Configure API Keys (in app):**
   - Enter your OpenRouter API Key in the top navigation bar.
   - Adjust the Blended Employee Hourly Rate.

### Vercel Deployment

This project is configured with a `vercel.json` file for immediate deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root and follow the prompts.
3. Your app is live!

*Note: For full Google Calendar functionality in production, ensure you replace `YOUR_GOOGLE_CLIENT_ID` in `main.jsx` with a valid Client ID from the Google Cloud Console.*
