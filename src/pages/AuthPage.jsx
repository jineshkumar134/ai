import { useState } from 'react'

export default function AuthPage({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        panCard: '',
        phone: '',
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' })
        }
    }

    const validate = () => {
        const newErrors = {}
        if (isSignUp && !formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters'
        if (isSignUp && formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match'
        if (isSignUp && !formData.phone.trim()) newErrors.phone = 'Phone number is required'
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setIsLoading(true)
        setErrors({})

        try {
            const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setErrors({ server: data.error || 'Authentication failed' })
                setIsLoading(false)
                return
            }

            // Success
            onLogin({
                name: data.user.fullName,
                email: data.user.email,
                initials: data.user.initials,
            })
        } catch (err) {
            setErrors({ server: 'Server connection error. Ensure backend is running.' })
        } finally {
            setIsLoading(false)
        }
    }

    const getInitials = (str) => {
        if (!str) return 'RI'
        const parts = str.split(' ').filter(Boolean)
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return str.slice(0, 2).toUpperCase()
    }

    return (
        <div className="auth-page">
            {/* Background decoration */}
            <div className="auth-bg-orb auth-bg-orb-1"></div>
            <div className="auth-bg-orb auth-bg-orb-2"></div>
            <div className="auth-bg-orb auth-bg-orb-3"></div>

            <div className="auth-container">
                {/* Left Hero Panel */}
                <div className="auth-hero">
                    <div className="auth-hero-content">
                        <div className="auth-hero-brand">
                            <div className="auth-hero-icon">AI</div>
                            <span>InvestorAI</span>
                        </div>
                        <h1 className="auth-hero-title">
                            Intelligence Layer for the
                            <span className="auth-gradient-text"> Indian Investor</span>
                        </h1>
                        <p className="auth-hero-desc">
                            Turn raw market data into actionable, money-making decisions. AI-powered signals, technical patterns, and deep market analysis — all in one platform.
                        </p>

                        <div className="auth-hero-features">
                            <div className="auth-feature">
                                <div className="auth-feature-icon">📡</div>
                                <div>
                                    <div className="auth-feature-title">Opportunity Radar</div>
                                    <div className="auth-feature-desc">Insider trades, bulk deals & regulatory alerts</div>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-icon">📊</div>
                                <div>
                                    <div className="auth-feature-title">Chart Pattern Intelligence</div>
                                    <div className="auth-feature-desc">Real-time pattern detection across NSE</div>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-icon">💬</div>
                                <div>
                                    <div className="auth-feature-title">Market ChatGPT</div>
                                    <div className="auth-feature-desc">Deep analysis with source-cited responses</div>
                                </div>
                            </div>
                            <div className="auth-feature">
                                <div className="auth-feature-icon">🎬</div>
                                <div>
                                    <div className="auth-feature-title">AI Video Engine</div>
                                    <div className="auth-feature-desc">Auto-generated market update videos</div>
                                </div>
                            </div>
                        </div>

                        <div className="auth-hero-stats">
                            <div className="auth-hero-stat">
                                <div className="auth-hero-stat-value">14 Cr+</div>
                                <div className="auth-hero-stat-label">Demat Accounts</div>
                            </div>
                            <div className="auth-hero-stat">
                                <div className="auth-hero-stat-value">2,000+</div>
                                <div className="auth-hero-stat-label">NSE Stocks Tracked</div>
                            </div>
                            <div className="auth-hero-stat">
                                <div className="auth-hero-stat-value">24/7</div>
                                <div className="auth-hero-stat-label">AI Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
                            <p>
                                {isSignUp
                                    ? 'Start your journey to smarter investing'
                                    : 'Sign in to access your AI-powered dashboard'}
                            </p>
                        </div>

                        {errors.server && (
                            <div className="auth-error-alert">
                                ⚠️ {errors.server}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form" id="auth-form">
                            {isSignUp && (
                                <div className="auth-field animate-fade-in-up">
                                    <label htmlFor="fullName">Full Name</label>
                                    <div className={`auth-input-wrap ${errors.fullName ? 'error' : ''}`}>
                                        <span className="auth-input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            placeholder="Rajesh Kumar"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.fullName && <span className="auth-error">{errors.fullName}</span>}
                                </div>
                            )}

                            <div className="auth-field">
                                <label htmlFor="email">Email Address</label>
                                <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                                    <span className="auth-input-icon">✉️</span>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="rajesh@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email && <span className="auth-error">{errors.email}</span>}
                            </div>

                            {isSignUp && (
                                <div className="auth-field animate-fade-in-up">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className={`auth-input-wrap ${errors.phone ? 'error' : ''}`}>
                                        <span className="auth-input-icon">📱</span>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.phone && <span className="auth-error">{errors.phone}</span>}
                                </div>
                            )}

                            {isSignUp && (
                                <div className="auth-field animate-fade-in-up">
                                    <label htmlFor="panCard">PAN Card <span className="auth-optional">(Optional)</span></label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon">🪪</span>
                                        <input
                                            type="text"
                                            id="panCard"
                                            name="panCard"
                                            placeholder="ABCDE1234F"
                                            value={formData.panCard}
                                            onChange={handleChange}
                                            maxLength={10}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                                    <span className="auth-input-icon">🔒</span>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.password && <span className="auth-error">{errors.password}</span>}
                            </div>

                            {isSignUp && (
                                <div className="auth-field animate-fade-in-up">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className={`auth-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
                                        <span className="auth-input-icon">🔒</span>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="auth-error">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            )}

                            {!isSignUp && (
                                <div className="auth-forgot">
                                    <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                                id="auth-submit"
                            >
                                {isLoading ? (
                                    <span className="auth-spinner"></span>
                                ) : isSignUp ? (
                                    'Create Account & Start Investing'
                                ) : (
                                    'Sign In to Dashboard'
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="auth-social-btns">
                            <button className="auth-social-btn" id="google-login">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button className="auth-social-btn" id="zerodha-login">
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e74c3c' }}>Z</span>
                                Zerodha
                            </button>
                            <button className="auth-social-btn" id="groww-login">
                                <span style={{ fontSize: '1rem' }}>📈</span>
                                Groww
                            </button>
                        </div>

                        <div className="auth-toggle">
                            {isSignUp ? (
                                <p>
                                    Already have an account?{' '}
                                    <button onClick={() => { setIsSignUp(false); setErrors({}) }} id="switch-to-signin">
                                        Sign In
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Don't have an account?{' '}
                                    <button onClick={() => { setIsSignUp(true); setErrors({}) }} id="switch-to-signup">
                                        Sign Up Free
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
