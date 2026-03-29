import { useState, useEffect, useMemo } from 'react'

function VideoThumbBars({ barColor, seed }) {
    const bars = useMemo(() => {
        const count = 15;
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(20 + Math.sin(i * 0.8 + seed) * 30 + 30);
        }
        return result;
    }, [seed]);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
            {bars.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: barColor, borderRadius: '2px', opacity: 0.6 }} />
            ))}
        </div>
    );
}

function RaceChartSimulation({ data }) {
    return (
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', height: '100%' }}>
            <h4 style={{ color: 'inherit', marginBottom: '15px' }}>🚀 Top Movers Race (Intraday)</h4>
            {data.slice(0, 5).map((stock, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                        <span>{stock.symbol}</span>
                        <span>{stock.changePercent.toFixed(2)}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min(100, Math.abs(stock.changePercent) * 20)}%`,
                            background: stock.changePercent > 0 ? '#00f2fe' : '#ff4d4d',
                            transition: 'width 2s ease-out',
                            animation: 'grow 2s ease-out'
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function FIIDIIFlows({ flows }) {
    return (
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ color: 'inherit', marginBottom: '20px' }}>🏦 Institutional Money Flows</h4>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', border: '2px solid #00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#00f2fe', marginBottom: '10px', animation: 'pulse 2s infinite' }}>FII</div>
                    <div style={{ color: '#00f2fe', fontWeight: 'bold' }}>₹{flows?.fii?.net} Cr</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 77, 77, 0.1)', border: '2px solid #ed193b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#ed193b', marginBottom: '10px' }}>DII</div>
                    <div style={{ color: '#ed193b', fontWeight: 'bold' }}>₹{flows?.dii?.net} Cr</div>
                </div>
            </div>
            
            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(0,0,0,0.03)', borderLeft: '4px solid #ed193b', borderRadius: '8px', maxWidth: '80%' }}>
                <strong style={{ display: 'block', fontSize: '0.75rem', color: '#ed193b', fontWeight: 'bold', marginBottom: '5px' }}>🐋 WHALE WATCH INSIGHT:</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{flows?.insight || 'Analyzing institutional footprints...'}</span>
            </div>
        </div>
    );
}

function IPOSimulation({ ipos }) {
    return (
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', height: '100%' }}>
            <h4 style={{ color: 'inherit', marginBottom: '20px' }}>📈 IPO Listing Gains Tracker</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {ipos?.map((ipo, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '100px', fontSize: '0.8rem', color: '#cbd5e1' }}>{ipo.name}</div>
                        <div style={{ flex: 1, height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.abs(ipo.gain) * 3}%`,
                                background: ipo.gain > 0 ? 'linear-gradient(90deg, #00f2fe, #50e3c2)' : 'linear-gradient(90deg, #ff4d4d, #b91d1d)',
                                transition: 'width 2.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
                                animation: 'slideIn 2.5s ease-out'
                            }} />
                            <span style={{ position: 'absolute', right: '10px', top: '5px', fontSize: '0.8rem', fontWeight: 'bold' }}>{ipo.gain > 0 ? '+' : ''}{ipo.gain}%</span>
                        </div>
                    </div>
                ))}
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Live Listing Gain Simulation based on NSE/BSE gray market premiums (GMP).</p>
        </div>
    );
}

function SentimentHeatmap({ data, flows }) {
    const topGainer = data && data.length > 0 ? data[0] : { symbol: 'NIFTY' };
    const topLoser = data && data.length > 0 ? data[data.length - 1] : { symbol: 'N/A' };
    
    return (
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', height: '100%', overflowY: 'auto' }}>
            <h4 style={{ color: 'inherit', marginBottom: '15px' }}>🎬 AI Generated 60-Second Daily Wrap Script</h4>
            
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(0, 242, 254, 0.3)' }}>
                <p style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>[00:00 - INTRO: ENERGETIC MUSIC PLAYS]</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '15px' }}>
                    "What a wild ride for the markets today, investors! Straight to the numbers: we saw aggressive sector rotation, with capital massively shifting focus."
                </p>

                <p style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>[00:15 - RACE CHART OVERLAY APPEARS]</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '15px' }}>
                    "Looking at our Live Top Movers Race, {topGainer.symbol?.split('.')[0]} absolute dominated the pack, securing a massive breakout today! On the flip side, {topLoser.symbol?.split('.')[0]} faced sharp downward momentum—if you're a holder, it's time to review your stop losses."
                </p>

                <p style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>[00:35 - FII/DII WHALE WATCH OVERLAY]</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '15px' }}>
                    "But the real Alpha is in the footprint. Total FII Net comes sitting at ₹{flows?.fii?.net || '0'} Cr, and domestic boys clocking ₹{flows?.dii?.net || '0'} Cr. Bottom line insight? {flows?.insight || 'Institutions are restructuring portfolios.'}"
                </p>

                <p style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>[00:50 - OUTRO]</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    "That's the Signal-Finder intelligence. We'll track if these breakouts hold tomorrow morning at 9:15. Join us back at InvestorAI for the edge!"
                </p>
            </div>
        </div>
    );
}

export default function VideoEngine() {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [flows, setFlows] = useState(null);
    const [ipos, setIpos] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [trendingRes, flowsRes, ipoRes] = await Promise.all([
                    fetch('/api/market/trending'),
                    fetch('/api/market/flows'),
                    fetch('/api/market/ipo')
                ]);
                const trendingData = await trendingRes.json();
                const flowsData = await flowsRes.json();
                const ipoData = await ipoRes.json();

                setLiveData(trendingData);
                setFlows(flowsData);
                setIpos(ipoData);

                const features = [
                    { id: 'race', category: 'Race Chart', title: 'Top NSE Movers Race', type: 'ANIMATION', color: '#00f2fe' },
                    { id: 'flows', category: 'FII/DII Flows', title: 'Institutional Money Tracking', type: 'FLOW', color: '#ff4d4d' },
                    { id: 'ipo', category: 'IPO Tracker', title: 'New Listings & Gray Market', type: 'IPO', color: '#f7931a' },
                    { id: 'wrap', category: 'Daily Wrap', title: 'Market Sentiment Heatmap', type: 'HEATMAP', color: '#9d50bb' }
                ];
                setVideos(features);
            } catch (err) { } finally { setIsLoading(false) }
        }
        fetchAllData();
    }, []);

    return (
        <div className="video-page" id="video-engine">
            <div className="video-header">
                <h2>AI Dynamic Visualization Engine <span className="live-dot" style={{ background: '#00f2fe' }}></span></h2>
                <p>Zero editing needed. Generating race charts, FII flows, and sentiment maps directly from live NSE streams.</p>
            </div>

            {selectedVideo && (
                <div className="video-modal" onClick={() => setSelectedVideo(null)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div className="video-container" style={{ width: '100%', maxWidth: '900px', height: '520px', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '40px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: 20, right: 20, color: 'inherit', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer' }} onClick={() => setSelectedVideo(null)}>✕ ESC</button>

                        {selectedVideo.id === 'race' && <RaceChartSimulation data={liveData || []} />}
                        {selectedVideo.id === 'flows' && <FIIDIIFlows flows={flows} />}
                        {selectedVideo.id === 'ipo' && <IPOSimulation ipos={ipos} />}
                        {selectedVideo.id === 'wrap' && <SentimentHeatmap data={liveData} flows={flows} />}

                        <div style={{ position: 'absolute', bottom: 20, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold' }}>● GENERATING LIVE: {selectedVideo.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Real-time Data Synthesis Engine v4.0</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {isLoading ? <div style={{ color: 'inherit' }}>Generating engine...</div> : videos.map((v) => (
                    <div className="video-card" key={v.id} onClick={() => setSelectedVideo(v)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s' }}>
                        <div style={{ height: '160px', background: '#ffffff', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '100%' }}><VideoThumbBars barColor={v.color} seed={Math.random()} /></div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '0.7rem', color: v.color, fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>{v.category.toUpperCase()}</div>
                            <div style={{ fontSize: '1.1rem', color: 'inherit', fontWeight: 'bold' }}>{v.title}</div>
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zero Editing • 90s Engine</span>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: v.color }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes grow { from { width: 0; } }
                @keyframes slideIn { from { width: 0; } }
                @keyframes glow { from { box-shadow: 0 0 5px currentColor; } to { box-shadow: 0 0 15px currentColor; } }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    )
}
