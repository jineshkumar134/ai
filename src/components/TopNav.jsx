import { useState, useEffect } from 'react'

export default function TopNav({ pageTitle, user, onLogout }) {
    const [searchValue, setSearchValue] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [whyData, setWhyData] = useState(null)
    const [isWhyLoading, setIsWhyLoading] = useState(false)
    const [indices, setIndices] = useState([
        { name: 'NIFTY 50', price: 23386.45, change: -110.2, percent: -0.5 },
        { name: 'SENSEX', price: 75273.45, change: 250.5, percent: 0.3 },
        { name: 'BANK NIFTY', price: 53708.10, change: -120.4, percent: -0.2 }
    ])

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                const res = await fetch('/api/market/indices')
                if (res.ok) {
                    const data = await res.json()
                    setIndices(
                        data.map(idx => ({
                            name: idx.name || idx.symbol,
                            price: idx.price,
                            change: idx.change,
                            percent: idx.changePercent
                        }))
                    )
                }
            } catch (err) {
                console.error("Live indices fetch failed, using fallback", err)
            }
        }

        fetchIndices()
        const interval = setInterval(fetchIndices, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleSearch = async () => {
        if (!searchValue.trim()) return;
        setIsWhyLoading(true);
        setWhyData(null);
        try {
            const sym = searchValue.includes('.') ? searchValue.toUpperCase() : searchValue.toUpperCase() + '.NS';
            const res = await fetch(`/api/stocks/why/${sym}`);
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            setWhyData({ ...data, symbol: sym });
        } catch (err) { 
            alert("Could not find data for this symbol. Please use valid NSE ticker (e.g. RELIANCE.NS)");
        }
        setIsWhyLoading(false);
    }

    return (
        <header className="topnav" id="top-nav">
            <div className="topnav-left">
                <h2 className="topnav-title">{pageTitle}</h2>
                <div className="topnav-live">
                    <span className="live-dot"></span>
                    Live Market
                </div>
            </div>

            <div className="topnav-right">
                <div className="topnav-market-ticker">
                    {indices.map((idx, i) => (
                        <div className="ticker-item" key={i}>
                            <span className="ticker-label">{idx.name?.replace('^', '')}</span>
                            <span className={`ticker-value ${idx.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
                                {idx.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {' '}
                                {idx.change >= 0 ? '↑' : '↓'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="topnav-search" id="search-bar">
                    <span className="topnav-search-icon" style={{ cursor: 'pointer' }} onClick={handleSearch}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search stock quotes (e.g., RELIANCE.NS)..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        id="search-input"
                    />
                </div>

                {/* SEARCH INSIGHT MODAL */}
                {(whyData || isWhyLoading) && (
                    <div className="video-modal" onClick={() => setWhyData(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="video-container" style={{ width: '90%', maxWidth: '500px', background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #ed193b', color: '#111827' }} onClick={e => e.stopPropagation()}>
                            {isWhyLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div className="auth-spinner" style={{ borderTopColor: '#ed193b', marginBottom: '15px' }}></div>
                                    <div style={{ color: '#111827', fontWeight: 'bold' }}>Scanning Data for {searchValue}...</div>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ color: '#ed193b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        🚀 Quick Insight: {whyData.symbol}
                                    </h3>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#6366f1', textTransform: 'uppercase', marginBottom: '10px' }}>Bullish Signals:</div>
                                        {whyData.reasons?.map((r, i) => <div key={i} style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#374151', lineHeight: '1.4' }}>• {r}</div>)}
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#ed193b', textTransform: 'uppercase', marginBottom: '10px' }}>Risk Assessment:</div>
                                        {whyData.risks?.map((r, i) => <div key={i} style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#374151', lineHeight: '1.4' }}>• {r}</div>)}
                                    </div>

                                    {whyData.scam_risk && (
                                        <div style={{ background: 'rgba(237, 25, 59, 0.1)', border: '1px solid #ed193b', borderRadius: '8px', padding: '15px' }}>
                                            <div style={{ color: '#ed193b', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>⚠️ SCAM WARNING:</div>
                                            <div style={{ fontSize: '0.85rem', color: '#ed193b' }}>{whyData.scam_warning}</div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => setWhyData(null)}
                                        style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#ed193b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Close Insight
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="topnav-user-area">
                    <div
                        className="topnav-avatar"
                        id="user-avatar"
                        title={user?.name || 'User'}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        {user?.initials || 'RI'}
                    </div>
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-dropdown-name">{user?.name}</div>
                                <div className="user-dropdown-email">{user?.email}</div>
                            </div>
                            <div className="user-dropdown-divider"></div>
                            <button className="user-dropdown-item" onClick={onLogout} id="logout-btn">
                                🚪 Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
