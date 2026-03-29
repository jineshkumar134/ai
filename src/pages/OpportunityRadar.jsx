import { useState, useEffect } from 'react'

export default function OpportunityRadar() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [signals, setSignals] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [whyData, setWhyData] = useState(null)
    const [isWhyLoading, setIsWhyLoading] = useState(false)

    useEffect(() => {
        const fetchAISignals = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/radar/signals?category=${activeCategory}`)
                if (res.ok) {
                    const data = await res.json()
                    setSignals(Array.isArray(data) ? data : [])
                }
            } catch (err) { } finally { setIsLoading(false) }
        }
        fetchAISignals()
    }, [activeCategory])

    const handleWhyClick = async (symbol) => {
        if (!symbol) return alert('Invalid symbol detected')
        setIsWhyLoading(true)
        setWhyData(null)
        try {
            const sym = symbol.includes('.') ? symbol.toUpperCase() : symbol.toUpperCase() + '.NS'
            const res = await fetch(`/api/stocks/why/${sym}`)
            if (!res.ok) throw new Error('Network error')
            const data = await res.json()
            setWhyData({ ...data, symbol: symbol.toUpperCase() })
        } catch (err) { 
            console.error('Insight Error:', err)
            alert('Why Engine is temporarily offline. This signal is based on institutional bulk deals detected in the latest live announcements.')
        }
        setIsWhyLoading(false)
    }

    const getRelativeTime = (dateString) => {
        if (!dateString) return 'Just now'
        const diff = Date.now() - new Date(dateString).getTime()
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        if (hrs < 1) return 'Just now'
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    return (
        <div className="radar-page" id="opportunity-radar">
            {/* WHY MODAL */}
            {(whyData || isWhyLoading) && (
                <div className="video-modal" onClick={() => setWhyData(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="video-container" style={{ width: '90%', maxWidth: '500px', background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #00f2fe' }} onClick={e => e.stopPropagation()}>
                        {isWhyLoading ? <div style={{ textAlign: 'center', color: 'inherit' }}>🧠 Scanning market logic...</div> : (
                            <>
                                <h3 style={{ color: '#00f2fe', marginBottom: '15px' }}>💡 Why {whyData.symbol}?</h3>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontWeight: 'bold', color: 'inherit', marginBottom: '5px' }}>The 'Up' Reason:</div>
                                    {whyData.reasons?.map((r, i) => <div key={i} style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px' }}>• {r}</div>)}
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#ff4d4d', marginBottom: '5px' }}>The 'Risk':</div>
                                    {whyData.risks?.map((r, i) => <div key={i} style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px' }}>• {r}</div>)}
                                </div>
                                {whyData.scam_risk && (
                                    <div style={{ padding: '12px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        🛑 PUMP & DUMP WARNING: {whyData.scam_warning}
                                    </div>
                                )}
                                <button onClick={() => setWhyData(null)} style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'inherit', borderRadius: '8px', cursor: 'pointer' }}>Okay, Got it!</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="radar-header">
                <div>
                    <h2>Signal Engine <span className="live-dot" style={{ background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }}></span></h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
                        Differential analysis of BSE/NSE announcements. Detecting institutional entry, management tone shifts, and debt reduction signals.
                    </p>
                </div>
            </div>

            <div className="radar-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card cyan">
                    <div className="stat-card-value">{isLoading ? '...' : signals.length}</div>
                    <div className="stat-card-label">Active Signals</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">{isLoading ? '...' : signals.filter(s => s.urgency === 'high').length}</div>
                    <div className="stat-card-label">High Conviction</div>
                </div>
                <div className="stat-card gold">
                    <div className="stat-card-value">RAG</div>
                    <div className="stat-card-label">Pipeline Status</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-value">AI</div>
                    <div className="stat-card-label">Llama 3.3 Engine</div>
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                    <div className="auth-spinner" style={{ borderTopColor: '#00f2fe' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing management tone & promoter buying patterns...</p>
                </div>
            ) : (
                <div className="radar-feed" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {signals.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                            📡 No significant signals detected in the last fetch.
                        </div>
                    ) : signals.map((signal, i) => (
                        <div
                            key={i}
                            className="signal-card"
                            style={{
                                animationDelay: `${i * 0.1}s`,
                                border: signal.urgency === 'high' ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(0, 242, 254, 0.1)',
                                position: 'relative',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '16px',
                                padding: '1.5rem'
                            }}
                        >
                            <div className="signal-card-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span className={`badge ${signal.urgency === 'high' ? 'badge-red' : 'badge-gold'}`}>
                                    {signal.type.toUpperCase()}
                                </span>
                                <div style={{ fontSize: '0.8rem', color: '#00f2fe', fontWeight: 'bold' }}>
                                    SCORE: {signal.score}/100
                                </div>
                            </div>

                            <div className="signal-card-title" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'inherit' }}>
                                {signal.symbol}: {signal.title}
                            </div>

                            <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid #00f2fe' }}>
                                <strong style={{ fontSize: '0.75rem', display: 'block', color: '#00f2fe', marginBottom: '4px' }}>DIFFERENTIAL INSIGHT:</strong>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>{signal.differential_insight}</span>
                            </div>

                            <button
                                onClick={() => handleWhyClick(signal.symbol)}
                                style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid #00f2fe', color: '#00f2fe', padding: '10px', borderRadius: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem', transition: '0.3s' }}
                            >
                                💡 Why is this moving? (AI Insight)
                            </button>

                            <div className="signal-card-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                <span>Signal Rank #{i + 1}</span>
                                <span>Recent Disclosure</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
