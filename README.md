# InvestorAI: Real-Time Market Intelligence Dashboard

InvestorAI is a premium, real-time financial intelligence platform for the Indian stock market. It transforms raw market data into actionable insights using AI-driven analysis, technical pattern detection, and automated video generation.

## 🚀 Core Features (LIVE DATA)

*   **📡 Opportunity Radar**: Real-time monitoring of NSE/BSE news, regulatory filings, and market-moving events via live RSS feeds.
*   **📊 Chart Pattern Intelligence**: Dynamic technical analysis (SMA, RSI, Trend detection) of trending NSE stocks using real-time price & volume data via Yahoo Finance.
*   **🎬 AI Market Video Engine**: Automated generation of video scripts and visualizations based on live trending market data.
*   **💬 Market ChatGPT**: An intelligent, context-aware AI analyst powered by the **Gemini 2.0 Flash API**, providing data-driven responses for any stock query with live financial stats.
*   **👤 Real Authentication**: Fully implemented backend signup/signin flow (in-memory user store) replacing all mock simulation tags.

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Glassmorphism UI (Vanilla CSS), Lucide Icons.
*   **Backend**: Node.js (Express), Proxy for Yahoo Finance API, SSR/RSS Parser.
*   **AI**: Google Generative AI (Gemini SDK).
*   **Data Sources**: Yahoo Finance (Stock quotes & technicals), Google News (RSS Market Feed).

## 📦 Getting Started

1.  **Clone/Copy the project folder**.
2.  **Add your Gemini API Key**:
    *   Open `.env` in the root folder.
    *   Set `GEMINI_API_KEY=YOUR_KEY_HERE`.
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Run in Dev Mode**:
    ```bash
    npm run dev
    ```
    *   Frontend runs at: `http://localhost:5173`
    *   Backend runs at: `http://localhost:3001`

## 📂 Project Structure

```text
investor-ai-app/
├── server/             # Express.js Backend (Proxy & Auth)
│   └── index.js        # Core server logic & API endpoints
├── src/                # React Frontend
│   ├── components/     # Reusable UI components (Sidebar/Nav)
│   └── pages/          # Feature modules (Radar, Charts, Chat, etc.)
├── .env                # API Keys & Configuration
├── package.json        # Unified scripts & dependencies
└── README.md           # Documentation
```

## 🔒 Security & Performance
- **Zero Mock Data**: All data points (prices, changes, news) are pulled live.
- **CORS Proxy**: Backend acts as a secure bridge for financial APIs.
- **Optimized UI**: High-refresh frequency for market indices and tickers.

---
*Built for the Modern Indian Investor.*
