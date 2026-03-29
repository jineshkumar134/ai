import { useState, useEffect } from 'react'

export default function Portfolio() {
    const [holdings, setHoldings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBrokerConnected, setIsBrokerConnected] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [brokerKeys, setBrokerKeys] = useState({ apiKey: '', accessToken: '' })
    const [newStock, setNewStock] = useState({ symbol: '', qty: '', avgPrice: '' })
    const [analysis, setAnalysis] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleBrokerSync = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/portfolio/broker/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brokerKeys)
            })
            const data = await res.json()
            if (res.ok) {
                setIsBrokerConnected(true)
                setShowSettings(false)
                fetchPortfolio()
            } else { alert(data.error) }
        } catch (err) { }
    }

    const fetchPortfolio = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('http://localhost:3001/api/portfolio/sync', { method: 'POST' })
            const data = await res.json()
            if (Array.isArray(data)) {
                setHoldings(data)
            }
        } catch (err) { }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchPortfolio()
        const interval = setInterval(fetchPortfolio, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (holdings.length > 0) {
            analyzePortfolio()
        }
    }, [holdings.length])

    const analyzePortfolio = async () => {
        setIsAnalyzing(true)
        try {
            const res = await fetch('http://localhost:3001/api/portfolio/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portfolio: holdings })
            })
            const data = await res.json()
            setAnalysis(data)
        } catch (err) { }
        setIsAnalyzing(false)
    }

    const handleAddStock = async () => {
        if (!newStock.symbol || !newStock.qty) return
        try {
            await fetch('http://localhost:3001/api/portfolio/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStock)
            })
            setNewStock({ symbol: '', qty: '', avgPrice: '' })
            fetchPortfolio()
        } catch (err) { }
    }

    const handleLoadDemo = async () => {
        const demoStocks = [
            { symbol: 'RELIANCE.NS', qty: 10, avgPrice: 2450 },
            { symbol: 'TCS.NS', qty: 5, avgPrice: 3800 },
            { symbol: 'HDFCBANK.NS', qty: 25, avgPrice: 1650 },
            { symbol: 'INFY.NS', qty: 15, avgPrice: 1420 }
        ]
        for (const s of demoStocks) {
            await fetch('http://localhost:3001/api/portfolio/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(s)
            })
        }
        fetchPortfolio()
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = async (e) => {
            const content = e.target.result
            const lines = content.split('\n')
            const data = lines.filter(l => l.trim().length > 0).map(line => {
                return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim())
            })
            const headers = data[0].map(h => h.toLowerCase())
            const rows = data.slice(1)
            const symIdx = headers.findIndex(h => h.includes('symbol') || h.includes('stock') || h.includes('name'))
            const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('available'))
            const priceIdx = headers.findIndex(h => h.includes('avg') || h.includes('average') || h.includes('cost'))
            for (let row of rows) {
                const sym = row[symIdx >= 0 ? symIdx : 0]
                const qty = row[qtyIdx >= 0 ? qtyIdx : 1]
                const price = row[priceIdx >= 0 ? priceIdx : 2]
                if (sym && qty) {
                    await fetch('http://localhost:3001/api/portfolio/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ symbol: sym.toUpperCase(), qty: Number(qty), avgPrice: Number(price) })
                    })
                }
            }
            fetchPortfolio()
        }
        reader.readAsText(file)
    }

    const totalInvested = Array.isArray(holdings) ? holdings.reduce((acc, h) => acc + Number(h.invested || 0), 0) : 0
    const totalValue = Array.isArray(holdings) ? holdings.reduce((acc, h) => acc + Number(h.currentValue || 0), 0) : 0
    const totalPnl = (totalValue - totalInvested).toFixed(2)

    return (
        <div className="portfolio-page" id="live-portfolio" style={{ padding: '2rem', color: 'inherit' }}>
            {/* BROKER SETTINGS MODAL */}
            {showSettings && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '90%', maxWidth: '400px', background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #00f2fe' }}>
                        <h3 style={{ color: '#00f2fe', marginBottom: '1rem' }}>🔗 Connect Broker</h3>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#00f2fe' }}>Option A: Zerodha / Upstox</div>
                            <p style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Paste your Kite API Key & Access Token below.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input value={brokerKeys.apiKey} onChange={e => setBrokerKeys({...brokerKeys, apiKey: e.target.value})} placeholder="Kite API Key" style={{ width: '100%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }} />
                            <input value={brokerKeys.accessToken} onChange={e => setBrokerKeys({...brokerKeys, accessToken: e.target.value})} placeholder="Kite Access Token" style={{ width: '100%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'inherit' }} />
                            <button onClick={handleBrokerSync} style={{ background: '#00f2fe', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Connect Zerodha</button>
                        </div>
                        <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80' }}>Option B: Groww</div>
                            <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '10px' }}>Groww lacks a public API. Use CSV Import to see live P&L.</p>
                            <label htmlFor="groww-import" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '100px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                📥 Upload Groww CSV
                            </label>
                        </div>
                        <button onClick={() => setShowSettings(false)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '10px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel & Close</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Real-Time Portfolio <span className="live-dot"></span></h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Synced with NSE Live Feed • Automated P&L tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' }}>⚙️</button>
                    <input type="file" id="groww-import" style={{ display: 'none' }} accept=".csv" onChange={handleFileUpload} />
                    <label htmlFor="groww-import" style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(74, 158, 254, 0.1)', border: '1px solid #4facfe', color: '#4facfe', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>📥 Import Groww</label>
                    <button onClick={handleLoadDemo} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(249, 203, 40, 0.1)', border: '1px solid #f9cb28', color: '#f9cb28', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Demo Portfolio</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '5px' }}>Total Invested</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalInvested.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '5px' }}>Current Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalValue.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: Number(totalPnl) >= 0 ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255, 77, 77, 0.05)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${Number(totalPnl) >= 0 ? '#4ade8055' : '#ff4d4d55'}` }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '5px' }}>Unrealized P&L</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: Number(totalPnl) >= 0 ? '#4ade80' : '#ff4d4d' }}>
                        {Number(totalPnl) >= 0 ? '+' : ''}₹{Math.abs(Number(totalPnl)).toLocaleString('en-IN')}
                    </div>
                </div>

                {analysis && (
                    <div style={{ background: 'rgba(249, 203, 40, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(249, 203, 40, 0.3)', gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#f9cb28', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>⚠️ Risk Alerts (AI Nudge)</div>
                                {analysis.alerts?.map((a, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '5px', color: '#cbd5e1' }}>• {a}</div>)}
                            </div>
                            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                                <div style={{ color: '#4facfe', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>🎯 AI Suggestions</div>
                                {analysis.suggestions?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '5px', color: '#cbd5e1' }}>• {s}</div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Current Holdings</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Symbol" value={newStock.symbol} onChange={e => setNewStock({...newStock, symbol: e.target.value})} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'inherit', width: '120px' }} />
                        <input placeholder="Qty" type="number" value={newStock.qty} onChange={e => setNewStock({...newStock, qty: e.target.value})} style={{ width: '80px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'inherit' }} />
                        <input placeholder="Avg Price" type="number" value={newStock.avgPrice} onChange={e => setNewStock({...newStock, avgPrice: e.target.value})} style={{ width: '100px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'inherit' }} />
                        <button onClick={handleAddStock} style={{ background: '#00f2fe', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add</button>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px' }}>Stock</th>
                            <th>Qty</th>
                            <th>Avg Price</th>
                            <th>Live Price</th>
                            <th>Change%</th>
                            <th style={{ textAlign: 'right', paddingRight: '15px' }}>P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && holdings.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Syncing with NSE feeds...</td></tr>
                        ) : holdings.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '80px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📤</div>
                                    <h3 style={{ marginBottom: '10px' }}>Your Portfolio is Empty</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 30px' }}>
                                        Click "🚀 Demo Portfolio" to load sample stocks with live prices, or import your Groww CSV.
                                    </p>
                                    <button onClick={handleLoadDemo} style={{ padding: '15px 40px', borderRadius: '15px', background: '#00f2fe', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', border: 'none' }}>
                                        🚀 Load Demo Portfolio
                                    </button>
                                </td>
                            </tr>
                        ) : holdings.map((h, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.95rem' }}>
                                <td style={{ padding: '20px', fontWeight: 'bold' }}>{h.symbol?.replace('.NS', '') || '—'}</td>
                                <td>{h.qty}</td>
                                <td>₹{h.avgPrice}</td>
                                <td style={{ color: '#00f2fe' }}>₹{h.currentPrice || '—'}</td>
                                <td style={{ color: Number(h.pnlPercent) >= 0 ? '#4ade80' : '#ff4d4d' }}>{h.pnlPercent || 0}%</td>
                                <td style={{ textAlign: 'right', paddingRight: '15px', color: Number(h.pnl) >= 0 ? '#4ade80' : '#ff4d4d' }}>
                                    {Number(h.pnl) >= 0 ? '+' : ''}₹{h.pnl || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
