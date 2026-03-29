import { useState, useRef, useEffect } from 'react'

// ─── Typing Indicator Component ────────────────────────────
function TypingIndicator() {
  return (
    <div className="chat-bubble ai" style={{ opacity: 1 }}>
      <div className="chat-bubble-label">🤖 Market AI</div>
      <div className="chat-bubble-inner">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    text: "Welcome to Market ChatGPT — Next Gen. I'm connected to the live market via Yahoo Finance and Google News. Ask me about a stock (e.g., 'Analyze RELIANCE.NS') or general market trends.",
    citations: ['Live API Connection'],
  },
]

const SUGGESTIONS = [
  "Analyze RELIANCE.NS",
  "How is HDFCBANK.NS doing today?",
  "Tell me the latest Indian stock market news",
  "What is the P/E of TCS.NS?",
]

export default function MarketChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (overrideText) => {
    const text = overrideText || inputValue
    if (!text.trim()) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text,
      citations: [],
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const chatHistory = messages
        .filter((m) => m.role === 'user' || m.role === 'ai')
        .map((m) => ({ role: m.role, text: m.text }));

      // Call the live AI backend
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory }),
      });

      const data = await res.json();

      setIsTyping(false)

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            text: data.response,
          },
        ])
      } else {
        // Fallback or Error (e.g., No API Key)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            text: `⚠️ **API Error:** ${data.error}\n\n**Details:** ${data.details || 'Check terminal for logs'}\n\nSince no Gemini API key is configured or the key is invalid, I cannot generate AI responses yet.`,
          },
        ])
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: `Backend connection failed. Make sure the Node server is running on port 3001. Error: ${err.message}`,
        },
      ])
    }
  }

  const handleSuggestion = (text) => {
    handleSend(text)
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSend(transcript); 
    };

    recognition.start();
  }

  // Parses markdown bold (**) into strong tags for better display
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="chat-page" id="market-chat">
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.role}`}
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
          >
            <div className="chat-bubble-label">
              {msg.role === 'ai' ? '🤖 Market AI' : '👤 You'}
            </div>
            <div className="chat-bubble-inner">
              <div className="chat-bubble-text" style={{ whiteSpace: 'pre-wrap' }}>
                <p>{renderText(msg.text)}</p>
              </div>
              {msg.citations && msg.citations.length > 0 && (
                <div className="chat-source-citations">
                  {msg.citations.map((c, ci) => (
                    <span key={ci} className="citation-chip">
                      📄 {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-container">
          <button 
            className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={startListening}
            title="Voice Search"
          >
            {isListening ? '🎤' : '🎙️'}
          </button>
          <input
            type="text"
            placeholder={isListening ? "Listening..." : "Ask anything about stocks..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            id="chat-input"
          />
          <button className="chat-send-btn" onClick={() => handleSend()} id="chat-send">
            ➤
          </button>
        </div>
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
