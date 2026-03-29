import { useState, useEffect } from 'react'

export default function IntelligenceHub() {
    // 1. Reality Check State
    const [tipText, setTipText] = useState('')
    const [checkResult, setCheckResult] = useState(null)
    const [isChecking, setIsChecking] = useState(false)

    // 2. Shadow Portfolio State
    const [symbol, setSymbol] = useState('')
    const [amount, setAmount] = useState(10000)
    const [shadowTrade, setShadowTrade] = useState(null)
    const [isShadowLoading, setIsShadowLoading] = useState(false)

    // 3. Regret State
    const [regrets, setRegrets] = useState([])
    const [pastSymbol, setPastSymbol] = useState('')
    const [sellPrice, setSellPrice] = useState('')
    const [isRegretLoading, setIsRegretLoading] = useState(false)

    // 4. Advanced Intelligence States
    const [predictionSymbol, setPredictionSymbol] = useState('')
    const [prediction, setPrediction] = useState(null)
    const [isPredicting, setIsPredicting] = useState(false)

    const [sentiment, setSentiment] = useState(null)
    const [buzzingStocks, setBuzzingStocks] = useState([])
    const [isBuzzingLoading, setIsBuzzingLoading] = useState(false)

    const [backtestInfo, setBacktestInfo] = useState({ symbol: '', strategy: 'RSI_BREAKOUT' })
    const [backtestResult, setBacktestResult] = useState(null)
    const [isBacktesting, setIsBacktesting] = useState(false)

    useEffect(() => {
        // Fetch regret list
        fetch('/api/intelligence/regret-analysis')
            .then(res => res.json())
            .then(data => setRegrets(data))
        
        // Fetch general sentiment & buzzing stocks
        fetch('/api/intelligence/sentiment')
            .then(res => res.json())
            .then(data => setSentiment(data))
        
        setIsBuzzingLoading(true)
        fetch('/api/market/buzzing')
            .then(res => res.json())
            .then(data => setBuzzingStocks(data))
            .finally(() => setIsBuzzingLoading(false))
    }, [])

    const handleBacktest = async () => {
        if(!backtestInfo.symbol) return
        setIsBacktesting(true)
        setBacktestResult(null)
        try {
            const sym = backtestInfo.symbol.includes('.') ? backtestInfo.symbol.toUpperCase() : backtestInfo.symbol.toUpperCase() + '.NS'
            const res = await fetch(`/api/intelligence/backtest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: sym, strategy: backtestInfo.strategy })
            })
            const data = await res.json()
            setBacktestResult(data)
        } catch (err) { alert('Backtest engine failed') }
        setIsBacktesting(false)
    }

    const handlePredict = async () => {
        if(!predictionSymbol) return
        setIsPredicting(true)
        setPrediction(null)
        try {
            const sym = predictionSymbol.includes('.') ? predictionSymbol.toUpperCase() : predictionSymbol.toUpperCase() + '.NS'
            const res = await fetch(`/api/intelligence/predict/${sym}`)
            const data = await res.json()
            setPrediction({ ...data, symbol: sym })
        } catch (err) { alert('Prediction engine failed') }
        setIsPredicting(false)
    }

    const handleAddRegret = async () => {
        if (!pastSymbol || !sellPrice) return
        setIsRegretLoading(true)
        try {
            const res = await fetch('/api/intelligence/regret-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: pastSymbol, soldAt: Number(sellPrice) })
            })
            const data = await res.json()
            if (res.ok && Array.isArray(data)) {
                setRegrets(data)
                setPastSymbol('')
                setSellPrice('')
            } else {
                alert(data.error || 'Regret analysis failed')
            }
        } catch (err) {
            alert('Connection failed to backend')
        }
        setIsRegretLoading(false)
    }

    const handleRealityCheck = async () => {
        if (!tipText) return
        setIsChecking(true)
        try {
            const res = await fetch('/api/intelligence/reality-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipText })
            })
            const data = await res.json()
            setCheckResult(data)
        } catch (err) { }
        setIsChecking(false)
    }

    const handleShadowInvest = async () => {
        if (!symbol) return
        setIsShadowLoading(true)
        setShadowTrade(null)
        try {
            const res = await fetch('/api/intelligence/shadow/invest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: symbol.toUpperCase() + '.NS', amount })
            })
            const data = await res.json()
            if (res.ok) {
                setShadowTrade(data)
            } else {
                setShadowTrade({ error: data.error || 'Shadow trade failed' })
            }
        } catch (err) {
            setShadowTrade({ error: 'Connection failed. Check server.' })
        }
        setIsShadowLoading(false)
    }

    return (
        <div className="intelligence-page" id="intelligence-hub" style={{ padding: '2rem', color: 'inherit' }}>
            <div className="hub-header" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>AI Intelligence Hub <span className="live-dot"></span></h2>
                <p style={{ color: 'var(--text-secondary)' }}>Advanced AI surveillance for fake tips, shadow portfolios, and regret minimization.</p>
            </div>

            <div className="hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* 1. REALITY CHECK ENGINE */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#00f2fe' }}>🕵️ Reality Check Engine</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Paste any WhatsApp tip or news snippet here to verify its authenticity.</p>
                    <textarea
                        value={tipText}
                        onChange={(e) => setTipText(e.target.value)}
                        placeholder="Ex: BUY RELIANCE NOW! TARGET 3500 IN 2 DAYS..."
                        style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'inherit', fontSize: '0.9rem', marginBottom: '1rem' }}
                    />
                    <button
                        onClick={handleRealityCheck}
                        disabled={isChecking}
                        className="action-btn"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(90deg, #00f2fe, #4facfe)', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {isChecking ? 'Scanning Tip...' : 'Analyze Tip Logic'}
                    </button>

                    {checkResult && (
                        <div style={{ marginTop: '1.5rem', padding: '15px', borderRadius: '12px', background: checkResult.risk_score > 60 ? 'rgba(255,77,77,0.1)' : 'rgba(0,242,254,0.1)', border: `1px solid ${checkResult.risk_score > 60 ? '#ff4d4d' : '#00f2fe'}` }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>Verdict: {checkResult.verdict}</div>
                            <div style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Risk Score: {checkResult.risk_score}/100</div>
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>{checkResult.reason}</div>
                            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.75rem', color: '#f9cb28', marginBottom: '10px' }}>🔍 HISTORY: {checkResult.historical_cases}</div>
                            <div style={{ fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 'bold' }}>⚠️ {checkResult.warning}</div>
                        </div>
                    )}
                </div>

                {/* 2. SHADOW PORTFOLIO */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#ff4d4d' }}>🌓 Shadow Portfolio (AI vs You)</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>AI bas advice nahi deta- khud prove karta hai ki wo better hai ya nahi.</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            placeholder="Stock Symbol (ex: TCS)"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ width: '100px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                    </div>
                    <button
                        onClick={handleShadowInvest}
                        disabled={isShadowLoading}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(90deg, #ff4d4d, #f9cb28)', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', opacity: isShadowLoading ? 0.6 : 1 }}
                    >
                        {isShadowLoading ? '🧠 AI Analyzing...' : 'Deploy Shadow Trade'}
                    </button>

                    {shadowTrade && (
                        <div style={{ marginTop: '1.5rem' }}>
                            {shadowTrade.error ? (
                                <div style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '12px', borderLeft: '4px solid #ff4d4d', color: '#ff4d4d' }}>
                                    ⚠️ {shadowTrade.error}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid #cbd5e1' }}>
                                            <div style={{ fontSize: '0.7rem' }}>YOUR PICK</div>
                                            <div style={{ fontWeight: 'bold' }}>{shadowTrade.user.symbol}</div>
                                        </div>
                                        <div style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '12px', borderLeft: '4px solid #ff4d4d' }}>
                                            <div style={{ fontSize: '0.7rem' }}>AI CHALLENGER</div>
                                            <div style={{ fontWeight: 'bold' }}>{shadowTrade.ai.symbol}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '15px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '12px', border: '1px dashed #00f2fe' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 'bold', marginBottom: '5px' }}>🤖 AI CHALLENGE LOG:</div>
                                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>"{shadowTrade.critique}"</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. REGRET MINIMIZER */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#f7931a' }}>⏮️ Regret Minimizer</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter a share you sold too early to see much you missed out (No hardcoded data!).</p>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                            value={pastSymbol}
                            onChange={(e) => setPastSymbol(e.target.value)}
                            placeholder="Stock (ex: ZOMATO)"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                        <input
                            type="number"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            placeholder="Sold Price"
                            style={{ width: '100px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                    </div>
                    <button
                        onClick={handleAddRegret}
                        disabled={isRegretLoading}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f7931a', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}
                    >
                        {isRegretLoading ? 'Analyzing Regret...' : 'Analyze My Decision'}
                    </button>

                    <div className="regret-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                        {regrets.length === 0 ? (
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '20px' }}>No analysis yet. Add your past trade!</div>
                        ) : regrets.map((r, i) => (
                            <div key={r.id || i} style={{ padding: '12px', background: 'rgba(255,147,26,0.05)', borderRadius: '12px', border: '1px solid rgba(247,147,26,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold' }}>{r.stock}</span>
                                    <span style={{ color: Number(r.missedGain.replace('%', '')) > 0 ? '#ff4d4d' : '#00f2fe' }}>
                                        {Number(r.missedGain.replace('%', '')) > 0 ? `-${r.missedGain} Missed` : `+${Math.abs(Number(r.missedGain.replace('%', '')))}% Saved`}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Sold: ₹{r.soldAt} | Current: ₹{r.currentPrice}</div>
                                <div style={{ fontSize: '0.8rem', color: '#f7931a', fontStyle: 'italic' }}>AI: "{r.insight}"</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                
                {/* 4. PREDICTIVE ANALYTICS */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#00f2fe' }}>🔮 Predictive Alpha (Target Projections)</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>AI modeling for future price targets based on multi-quarter trend behavior.</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            value={predictionSymbol}
                            onChange={(e) => setPredictionSymbol(e.target.value)}
                            placeholder="Stock (ex: HDFCBANK)"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                        <button 
                            onClick={handlePredict}
                            disabled={isPredicting}
                            style={{ padding: '0 20px', borderRadius: '10px', background: '#00f2fe', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isPredicting ? '...' : 'Predict'}
                        </button>
                    </div>
                    {prediction && (
                        <div style={{ padding: '15px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '12px', borderLeft: '4px solid #00f2fe' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>{prediction.symbol} Target</span>
                                <span style={{ color: '#00f2fe', fontWeight: 'bold' }}>₹{prediction.target}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>{prediction.prediction}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Confidence: {prediction.confidence}% • Horizon: {prediction.term}</div>
                        </div>
                    )}
                </div>

                {/* 5. SENTIMENT & BUZZING SCANNER */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(237, 25, 59, 0.2)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#ed193b' }}>📊 Market Mood & Buzzing Stocks</h3>
                    
                    {sentiment && (
                        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #ed193b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '900', color: '#ed193b' }}>
                                {sentiment.score}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#ed193b' }}>Sentiment: {sentiment.mood}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Key Driver: {sentiment.key_driver}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', color: 'inherit' }}>🔥 UNUSUAL VOLUME / OI SHIFTS:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {isBuzzingLoading ? <div>Scanning NSE noise...</div> : buzzingStocks.map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontWeight: 'bold', color: s.sentiment === 'bullish' ? '#00f2fe' : '#ed193b' }}>{s.symbol}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. ALGO BACKTESTING */}
                <div className="hub-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(74, 158, 254, 0.2)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#4facfe' }}>⚙️ Strategy Backtester (Algo)</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Test technical strategies against 12 months of historical candle data.</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                            value={backtestInfo.symbol}
                            onChange={(e) => setBacktestInfo({ ...backtestInfo, symbol: e.target.value })}
                            placeholder="Symbol"
                            style={{ flex: 1, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }}
                        />
                        <select 
                            value={backtestInfo.strategy}
                            onChange={(e) => setBacktestInfo({ ...backtestInfo, strategy: e.target.value })}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px', padding: '5px' }}
                        >
                            <option value="RSI_BREAKOUT">RSI 70/30</option>
                            <option value="MACD_CROSS">MACD Cross</option>
                            <option value="VOL_SPIKE">Volume Spike</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleBacktest}
                        disabled={isBacktesting}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#4facfe', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}
                    >
                        {isBacktesting ? 'Running 252 Day Simulation...' : 'Run Simulation'}
                    </button>

                    {backtestResult && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ padding: '10px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>WIN RATE</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4facfe' }}>{backtestResult.winRate}%</div>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>NET ROI</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>+{backtestResult.roi}%</div>
                            </div>
                            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', textAlign: 'center', marginTop: '5px' }}>
                                "{backtestResult.insight}"
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
