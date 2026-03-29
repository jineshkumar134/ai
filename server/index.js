import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import YahooFinance from 'yahoo-finance2';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const app = express();
const PORT = process.env.PORT || 3001;
const rssParser = new Parser();

app.use(cors());
app.use(express.json());

// ─── STORES ──────────────────────────────────────────────
let signalHistory = [];
let shadowPortfolio = { user: [], ai: [], initialCapital: 100000 };

// ─── AUTHENTICATION ───────────────────────────────────────
const users = [];
app.post('/api/auth/signup', (req, res) => {
    const { fullName, email, password } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });
    users.push({ id: Date.now(), fullName, email, password });
    res.status(201).json({ message: 'Success', user: { fullName, email, initials: 'UK' } });
});

app.post('/api/auth/signin', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid' });
    res.json({ user: { fullName: user.fullName, email: user.email, initials: 'UK' } });
});

// ─── STOCK DATA ──────────────────────────────────────────
app.get('/api/stocks/quote/:symbol', async (req, res) => {
    try {
        const quote = await yahooFinance.quote(req.params.symbol);
        res.json(quote);
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/market/indices', async (req, res) => {
    try {
        const symbols = ['^NSEI', '^BSESN', '^NSEBANK'];
        const results = await Promise.allSettled(symbols.map(s => yahooFinance.quote(s)));
        const indices = results.filter(r => r.status === 'fulfilled').map(r => ({ symbol: r.value.symbol, name: r.value.shortName, price: r.value.regularMarketPrice, changePercent: r.value.regularMarketChangePercent }));
        res.json(indices);
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/market/trending', async (req, res) => {
    try {
        let symbols = [];
        try {
            const trendingResponse = await yahooFinance.trendingSymbols('IN', {}, { validateResult: false });
            symbols = (trendingResponse.quotes || []).slice(0, 15).map(q => q.symbol);
        } catch (e) {
            symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'AXISBANK.NS', 'ITC.NS', 'MARUTI.NS'];
        }
        const results = await Promise.allSettled(symbols.map(s => yahooFinance.quote(s)));
        const trendingData = results.filter(r => r.status === 'fulfilled' && r.value).map(r => ({
            symbol: r.value.symbol, name: r.value.shortName || r.value.symbol, price: r.value.regularMarketPrice, changePercent: r.value.regularMarketChangePercent, volume: r.value.regularMarketVolume, fiftyTwoWeekHigh: r.value.fiftyTwoWeekHigh, fiftyTwoWeekLow: r.value.fiftyTwoWeekLow
        }));
        res.json(trendingData);
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ─── INTELLIGENCE HUB ENDPOINTS ──────────────────────────
app.post('/api/intelligence/shadow/invest', async (req, res) => {
    try {
        const { symbol, amount } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        console.log(`[Shadow] User picked: ${symbol}, Amount: ${amount}`);
        
        const userStock = await yahooFinance.quote(symbol);
        console.log(`[Shadow] User stock price: ${userStock.regularMarketPrice}`);

        // AI selects a challenger - guaranteed fallback pool
        const fallbackPool = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS'];
        const filtered = fallbackPool.filter(s => s !== symbol);
        let challengerSymbol = filtered[Math.floor(Math.random() * filtered.length)];
        
        try {
            const trendingRes = await yahooFinance.trendingSymbols('IN', {}, { validateResult: false });
            if (trendingRes.quotes && trendingRes.quotes.length > 0) {
                const trendingFiltered = trendingRes.quotes.map(q => q.symbol).filter(s => s !== symbol);
                if (trendingFiltered.length > 0) {
                    challengerSymbol = trendingFiltered[Math.floor(Math.random() * Math.min(5, trendingFiltered.length))];
                }
            }
        } catch(e) { console.log('[Shadow] Trending failed, using fallback'); }

        console.log(`[Shadow] AI challenger: ${challengerSymbol}`);
        const aiStock = await yahooFinance.quote(challengerSymbol);

        const critiqueResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a competitive stock analyst. Compare two Indian stocks. Explain in 3-4 sentences why the AI's pick (second stock) could outperform the user's pick (first stock). Be direct, use real market reasoning. Respond strictly in clear, professional English." },
                { role: "user", content: `User picked: ${userStock.shortName} (${userStock.symbol}) at ₹${userStock.regularMarketPrice}. AI picked: ${aiStock.shortName} (${aiStock.symbol}) at ₹${aiStock.regularMarketPrice}. Compare them.` }
            ]
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });

        const investment = {
            id: Date.now(),
            user: { symbol: userStock.symbol, buyPrice: userStock.regularMarketPrice, name: userStock.shortName },
            ai: { symbol: aiStock.symbol, buyPrice: aiStock.regularMarketPrice, name: aiStock.shortName },
            capital: amount,
            critique: critiqueResponse.data.choices[0].message.content
        };
        shadowPortfolio.user.push(investment);
        res.json(investment);
    } catch (err) {
        console.error('[Shadow Error]', err.response?.data || err.message);
        res.status(500).json({ error: 'Shadow invest failed: ' + (err.response?.data?.error?.message || err.message) });
    }
});

app.post('/api/intelligence/reality-check', async (req, res) => {
    try {
        const { tipText } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Scam Detector. Output JSON: {risk_score: 1-100, verdict: string, reason: string, warning: string, historical_cases: string}" }, { role: "user", content: tipText }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { res.status(500).json({ error: 'Reality check failed' }); }
});

let userRegrets = [];

app.post('/api/intelligence/regret-analysis', async (req, res) => {
    try {
        const { symbol, soldAt } = req.body;
        const sym = symbol.includes('.') ? symbol : symbol.toUpperCase() + '.NS';
        const quote = await yahooFinance.quote(sym);
        if (!quote || !quote.regularMarketPrice) {
            return res.status(404).json({ error: `Could not fetch live price for ${symbol}. Check symbol.` });
        }
        const apiKey = process.env.GROQ_API_KEY;

        const current = quote.regularMarketPrice;
        const diff = (((current - soldAt) / soldAt) * 100).toFixed(1);

        const aiRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Explain in 1 sentence if selling this stock earlier was a mistake. Be direct and helpful." }, { role: "user", content: `Stock: ${symbol}, Sold: ${soldAt}, Current: ${current}, Gain Missed: ${diff}%` }]
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });

        const newRegret = {
            id: Date.now(),
            stock: symbol.toUpperCase(),
            soldAt: soldAt,
            currentPrice: current.toFixed(2),
            missedGain: `${diff}%`,
            insight: aiRes.data.choices[0].message.content
        };
        userRegrets.unshift(newRegret);
        res.json(userRegrets);
    } catch (err) { 
        console.error('[Regret Error]', err.response?.data || err.message);
        res.status(500).json({ error: 'Regret analysis failed. Check symbol or API key. ' + (err.message) }); 
    }
});

app.get('/api/intelligence/regret-analysis', (req, res) => {
    res.json(userRegrets);
});

let userBrokerKeys = { apiKey: '', accessToken: '' };

app.post('/api/portfolio/broker/sync', async (req, res) => {
    const { apiKey, accessToken } = req.body;
    console.log(`[Broker Sync] Attempting sync with Key: ${apiKey.substring(0, 5)}...`);
    if (!apiKey || !accessToken) return res.status(400).json({ error: 'Missing keys' });

    try {
        const response = await axios.get('https://api.kite.trade/portfolio/holdings', {
            headers: { 'X-Kite-Version': '3', 'Authorization': `token ${apiKey}:${accessToken}` }
        });

        console.log(`[Broker Sync] Kite returned ${response.data.data?.length} holdings`);
        const kiteHoldings = response.data.data.map(h => ({
            symbol: h.tradingsymbol.includes('.') ? h.tradingsymbol : h.tradingsymbol + '.NS',
            qty: h.quantity,
            avgPrice: h.average_price
        }));

        userPortfolio = kiteHoldings;
        res.json({ message: 'Synced', count: kiteHoldings.length });
    } catch (err) {
        console.error(`[Broker Sync Error]`, err.response?.data || err.message);
        res.status(500).json({ error: 'Broker sync failed. Error: ' + (err.response?.data?.message || err.message) });
    }
});

let userPortfolio = [];

app.post('/api/portfolio/sync', async (req, res) => {
    try {
        const symbols = userPortfolio.map(h => h.symbol);
        const quotes = await Promise.all(symbols.map(s => yahooFinance.quote(s)));

        const holdings = userPortfolio.map((h, i) => {
            const current = quotes[i].regularMarketPrice;
            const pnl = ((current - h.avgPrice) * h.qty).toFixed(2);
            const pnlPercent = (((current - h.avgPrice) / h.avgPrice) * 100).toFixed(2);
            return {
                ...h,
                currentPrice: current.toFixed(2),
                pnl,
                pnlPercent,
                invested: (h.avgPrice * h.qty).toFixed(2),
                currentValue: (current * h.qty).toFixed(2)
            };
        });
        res.json(holdings);
    } catch (err) { res.status(500).json({ error: 'Sync failed' }); }
});

app.post('/api/portfolio/add', (req, res) => {
    const { symbol, qty, avgPrice } = req.body;
    const sym = symbol.includes('.') ? symbol : symbol.toUpperCase() + '.NS';
    userPortfolio.push({ symbol: sym, qty: Number(qty), avgPrice: Number(avgPrice) });
    res.json({ message: 'Added' });
});

app.get('/api/stocks/why/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const apiKey = process.env.GROQ_API_KEY;
        let mockContext = `Stock: ${symbol}`;
        try {
            const quote = await yahooFinance.quote(symbol);
            const news = await rssParser.parseURL(`https://news.google.com/rss/search?q=${symbol}+stock+latest+news&hl=en-IN&gl=IN&ceid=IN:en`);
            const snippets = news.items.slice(0, 3).map(i => i.title).join(". ");
            mockContext = `Stock: ${symbol}, Price: ${quote.regularMarketPrice}, Change: ${quote.regularMarketChangePercent}%. News: ${snippets}`;
        } catch(e) { console.log("Why context fetch failed for " + symbol); }

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Analyze stock logic. JSON: {reasons: [string], risks: [string], scam_risk: boolean, scam_warning: string}" }, { role: "user", content: mockContext }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });

        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { 
        console.error('[Why Engine Error]', err.message);
        res.json({ 
            reasons: ["Dynamic market accumulation", "Sector-wide bullish trend"], 
            risks: ["Low liquidity risk", "Standard market volatility"], 
            scam_risk: false, 
            scam_warning: "" 
        }); 
    }
});

// ─── OPPORTUNITY RADAR ────────────────────────────────────
app.get('/api/radar/signals', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        // Fetch more items and randomize to avoid stale data
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=NSE+BSE+corporate+announcements+bulk+deal+insider+trading&hl=en-IN&gl=IN&ceid=IN:en');
        const allNews = feed.items.slice(0, 20);
        // Fisher-Yates shuffle
        for (let i = allNews.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNews[i], allNews[j]] = [allNews[j], allNews[i]];
        }
        const randomNews = allNews.slice(0, 7);

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `You are a Senior Quantitative Analyst. Extract high-conviction Alpha signals from the provided headlines. Focus on: Promoter buying, Bulk deals, and management shifts. Randomize selection for variety. Format JSON: {signals: [{symbol, type, title, urgency: 'high'|'medium'|'low', score: number, differential_insight: string}]}` },
                { role: "user", content: `Generate 4 UNIQUE signals from these latest snippets (Session: ${Date.now()}): ${JSON.stringify(randomNews.map(i => i.title))}` }
            ],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        
        let rawSignals = JSON.parse(response.data.choices[0].message.content).signals || [];
        // Normalization layer
        const signals = rawSignals.map(s => ({
            symbol: (s.symbol || s.ticker || 'NIFTY').toUpperCase().replace('.NS', ''),
            type: s.type || 'Signal',
            title: s.title || 'Significant Activity Detected',
            urgency: s.urgency || 'medium',
            score: s.score || 70,
            differential_insight: s.differential_insight || 'Institutional patterns suggesting accumulation.'
        }));
        
        if(signals.length === 0) throw new Error("Empty signals");
        res.json(signals);
    } catch (err) { 
        console.error('[Radar Error]', err?.response?.data || err.message);
        res.json([{
            symbol: 'SYSTEM',
            type: 'Notice',
            title: 'Live AI Feed Rate Limited',
            urgency: 'high',
            score: 0,
            differential_insight: 'The AI server is temporarily busy fetching huge data. Please refresh in a minute to get live real signals!'
        }]); 
    }
});

// ─── FLOWS & IPO (REAL) ──────────────────────────────────
app.get('/api/market/flows', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=FII+DII+net+investment+NSE+BSE+today+data&hl=en-IN&gl=IN&ceid=IN:en');
        const snippets = feed.items.slice(0, 3).map(i => i.title).join(". ");
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "You are a Senior Quantitative Analyst. Extract FII/DII net investment in Cr. Generate a 1-sentence 'Whale Watch' correlation insight (e.g. 'FIIs are exiting but DIIs absorbing the supply; possible bottoming.'). Format JSON: {fii_net: number, dii_net: number, insight: string}" }, { role: "user", content: snippets }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        const data = JSON.parse(response.data.choices[0].message.content);
        res.json({ fii: { net: data.fii_net, status: data.fii_net > 0 ? 'buy' : 'sell' }, dii: { net: data.dii_net, status: data.dii_net > 0 ? 'buy' : 'sell' }, insight: data.insight || 'Institutional activity remains mixed with no clear sector rotation bias yet.' });
    } catch (err) { res.json({ fii: { net: 0 }, dii: { net: 0 }, insight: 'Data temporarily unavailable. Flow neutral.' }); }
});

app.get('/api/market/ipo', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=latest+IPO+listing+gains+NSE+BSE+today&hl=en-IN&gl=IN&ceid=IN:en');
        const snippets = feed.items.slice(0, 5).map(i => i.title).join(". ");
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Extract 3 IPO names and listing gain %. JSON: {ipos: [{name: string, gain: number}]}" }, { role: "user", content: snippets }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        const data = JSON.parse(response.data.choices[0].message.content);
        res.json(data.ipos || []);
    } catch (err) { res.json([]); }
});

// ─── NEW ADVANCED INTELLIGENCE ENDPOINTS ──────────────────
app.get('/api/intelligence/predict/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const apiKey = process.env.GROQ_API_KEY;
        let quoteData = `Symbol: ${symbol}`;
        try {
            const quote = await yahooFinance.quote(symbol);
            quoteData = `Stock: ${symbol}, LastPrice: ${quote.regularMarketPrice}, Volume: ${quote.regularMarketVolume}`;
        } catch (e) {
            console.log(`Quote failed for ${symbol}, using basic context`);
        }

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Predict future stock trend (3-6 months). JSON: {prediction: string, target: number, confidence: number, term: string}" }, { role: "user", content: quoteData }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { 
        console.error('[Predict Error]', err.response?.data || err.message);
        res.json({ prediction: "Consolidation expected with mild bullish bias.", target: 0, confidence: 65, term: '3-6 Months' }); 
    }
});

app.get('/api/intelligence/sentiment', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        let snippets = "Stock market news today, Nifty 50 trend, RBI policy impact";
        try {
            const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=NIFTY+50+market+sentiment+news&hl=en-IN&gl=IN&ceid=IN:en');
            snippets = feed.items.slice(0, 5).map(i => i.title).join(". ");
        } catch(e) { console.log("Sentiment RSS failed"); }

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Analyze market sentiment from news headlines. Return score 0-100. JSON: {score: number, mood: string, key_driver: string}" }, { role: "user", content: snippets }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { 
        console.error('[Sentiment Error]', err.message);
        res.json({ score: 68, mood: 'Bullish Bias', key_driver: 'Strong DII inflows absorbing global pressure' }); 
    }
});

app.get('/api/market/buzzing', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        let snippets = "Nifty 50 breakout, market volume surge, high OI stocks";
        try {
            const news = await rssParser.parseURL('https://news.google.com/rss/search?q=NSE+stocks+unusual+volume+breakout&hl=en-IN&gl=IN&ceid=IN:en');
            snippets = news.items.slice(0, 5).map(i => i.title).join(". ");
        } catch(e) { console.log("Buzzing RSS failed"); }

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Scan for buzzing stocks. JSON: {stocks: [{symbol, reason, sentiment: 'bullish'|'bearish'}]}" }, { role: "user", content: snippets }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content).stocks || []);
    } catch (err) { 
        console.error('[Buzzing Error]', err.message);
        res.json([
            { symbol: 'RELIANCE', reason: 'Volume Breakout', sentiment: 'bullish' },
            { symbol: 'HDFCBANK', reason: 'Major Support Holding', sentiment: 'bullish' },
            { symbol: 'WIPRO', reason: 'Unusual OI Build-up', sentiment: 'bearish' }
        ]); 
    }
});

app.post('/api/portfolio/analysis', async (req, res) => {
    try {
        const { portfolio } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Analyze portfolio for risks (over-leverage, sector concentration) and suggest rebalancing. JSON: {alerts: [string], suggestions: [string]}" }, { role: "user", content: `Portfolio symbols: ${portfolio.map(p => p.symbol).join(', ')}` }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { 
        console.error('[Portfolio Analysis Error]', err.message);
        res.json({ alerts: [], suggestions: ['Keep diverse picks.'] }); 
    }
});

app.post('/api/intelligence/backtest', async (req, res) => {
    try {
        const { symbol, strategy } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        // Simulate historical win rate calculation via AI logic
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Simulate a technical strategy backtest over the last 252 trading days. JSON: {winRate: number, roi: number, insight: string}" }, { role: "user", content: `Stock: ${symbol}, Strategy: ${strategy}` }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) { 
        console.error('[Backtest Error]', err.message);
        res.json({ winRate: 55, roi: 12, insight: 'Strategy shows moderate success.' }); 
    }
});

// ─── MARKET CHATGPT ENDPOINT ─────────────────────────────
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'No GROQ_API_KEY configured' });

        // Try to extract stock symbols from message
        const symbolMatch = message.match(/([A-Z]{2,20})(\.NS|\.BO)?/gi);
        let stockContext = '';
        
        if (symbolMatch && symbolMatch.length > 0) {
            const sym = symbolMatch[0].includes('.') ? symbolMatch[0] : symbolMatch[0] + '.NS';
            try {
                const quote = await yahooFinance.quote(sym);
                stockContext = `\nLive Data for ${quote.symbol}: Price=₹${quote.regularMarketPrice}, Change=${quote.regularMarketChangePercent?.toFixed(2)}%, DayHigh=₹${quote.regularMarketDayHigh}, DayLow=₹${quote.regularMarketDayLow}, 52WkHigh=₹${quote.fiftyTwoWeekHigh}, 52WkLow=₹${quote.fiftyTwoWeekLow}, Volume=${quote.regularMarketVolume}, PE=${quote.trailingPE || 'N/A'}, MarketCap=${quote.marketCap || 'N/A'}`;
            } catch(e) { /* no stock data */ }
        }

        // Fetch latest news
        let newsContext = '';
        try {
            const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=indian+stock+market+today&hl=en-IN&gl=IN&ceid=IN:en');
            newsContext = '\nLatest News: ' + feed.items.slice(0, 5).map(i => i.title).join('. ');
        } catch(e) { /* no news */ }

        const chatMessages = [
            { role: "system", content: `You are a Senior Quantitative Analyst and Financial AI Architect for the Indian Stock Market. Your goal is to identify "Actionable Alpha" (hidden insights) by correlating multiple data points. Avoid simple summaries. Highlight technical patterns (e.g., breakout, divergence, Bullish Traps). Always cite sources at the end (e.g. "Source: Live NSE Data & Latest News Feed").${stockContext}${newsContext}` },
            ...(history || []).slice(-6).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text
            })),
            { role: "user", content: message }
        ];

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: chatMessages
        }, { headers: { 'Authorization': `Bearer ${apiKey}` } });

        res.json({ response: response.data.choices[0].message.content });
    } catch (err) {
        console.error('[Chat Error]', err.response?.data || err.message);
        res.status(500).json({ error: 'Chat failed', details: err.response?.data?.error?.message || err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 InvestorAI Backend (INTELLIGENCE HUB READY) running on http://localhost:${PORT}`);
});
