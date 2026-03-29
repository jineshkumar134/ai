export default function Sidebar({ activePage, onNavigate }) {
    const navItems = [
        { id: 'radar', icon: '📡', label: 'Opportunity Radar' },
        { id: 'portfolio', icon: '💼', label: 'Live Portfolio' },
        { id: 'hub', icon: '🧠', label: 'AI Intelligence Hub' },
        { id: 'charts', icon: '📊', label: 'Chart Patterns' },
        { id: 'chat', icon: '💬', label: 'Market ChatGPT' },
        { id: 'video', icon: '🎬', label: 'Video Engine' },
    ]

    return (
        <aside className="sidebar" id="sidebar-nav">
            <div className="sidebar-brand">
                <div className="sidebar-brand-logo">
                    <div className="brand-icon">AI</div>
                    <div className="brand-text">
                        <h1>InvestorAI</h1>
                        <span>Intelligence Layer</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">AI Modules</div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center' }}>
                    Data Source: NSE / Yahoo Finance
                </div>
            </div>
        </aside>
    )
}
