import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import AuthPage from './pages/AuthPage'
import OpportunityRadar from './pages/OpportunityRadar'
import ChartPatterns from './pages/ChartPatterns'
import MarketChat from './pages/MarketChat'
import VideoEngine from './pages/VideoEngine'
import IntelligenceHub from './pages/IntelligenceHub'
import Portfolio from './pages/Portfolio'
import './App.css'

const PAGES = {
  radar: { component: OpportunityRadar, label: 'Opportunity Radar' },
  portfolio: { component: Portfolio, label: 'Live Portfolio' },
  hub: { component: IntelligenceHub, label: 'AI Intelligence Hub' },
  charts: { component: ChartPatterns, label: 'Chart Patterns' },
  chat: { component: MarketChat, label: 'Market ChatGPT' },
  video: { component: VideoEngine, label: 'Video Engine' },
}

function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('radar')
  const ActiveComponent = PAGES[activePage].component

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setActivePage('radar')
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} />
      <div className="main-area">
        <TopNav pageTitle={PAGES[activePage].label} user={user} onLogout={handleLogout} />
        <main className="content-area">
          <ActiveComponent />
        </main>
      </div>
    </div>
  )
}

export default App
