import { useState, useEffect, useRef } from 'react'; // useRef kept for future use
import './chat.css';

const WELCOME = {
  id: 1,
  role: 'ai',
  type: 'text',
  text: "Hi, I'm IMPRO. I'm here to help you grow.\nDrop a file to analyse your skill profile, or just chat.",
};

let nextId = 2;
const uid = () => nextId++;

function SkillCard() {
  return (
    <div className="skill-card">
      <div className="skill-card-orb" />
      <div className="skill-card-title">TCS Report Ready</div>
      <div className="skill-card-sub">Your skill analysis is complete</div>
      <a href="#" className="skill-link" onClick={(e) => { e.preventDefault(); window.electronAPI.openReport(); }}>
        View full report →
      </a>
    </div>
  );
}

function Message({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <div className={`msg-row ${isAI ? 'msg-row--ai' : 'msg-row--user'}`}>
      {isAI && <div className="msg-avatar">I</div>}
      <div className={`msg-bubble ${isAI ? 'msg-bubble--ai' : 'msg-bubble--user'}`}>
        {msg.type === 'card' ? (
          <SkillCard data={msg.cardData} />
        ) : (
          msg.text.split('\n').map((line, i) => (
            <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
          ))
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-row msg-row--ai">
      <div className="msg-avatar">I</div>
      <div className="msg-bubble msg-bubble--ai msg-bubble--typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [dropOver, setDropOver] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const addAI = (text, type = 'text', cardData = null) => {
    setMessages((m) => [...m, { id: uid(), role: 'ai', type, text, cardData }]);
  };

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  useEffect(() => { scrollBottom(); }, [messages, typing]);

  // Listen for file drop relayed from orb window (legacy path)
  useEffect(() => {
    if (!window.electronAPI?.onFileDrop) return;
    const unsub = window.electronAPI.onFileDrop((name, filePath) => handleFileAnalysis(name, filePath));
    return unsub;
  }, []);

  // Auto-analyse triggered by orb file drop (guaranteed-timing path)
  useEffect(() => {
    if (!window.electronAPI?.onAutoAnalyse) return;
    const unsub = window.electronAPI.onAutoAnalyse((name, filePath) => handleFileAnalysis(name, filePath));
    return unsub;
  }, []);

  const handleFileAnalysis = async (filename, filePath) => {
    const label = filename || 'your file';
    setTyping(true);
    await new Promise((r) => setTimeout(r, 400));
    setTyping(false);
    addAI(`Got it. Analysing ${label}...`);
    setTyping(true);

    try {
      if (filePath && window.electronAPI?.analyseFile) {
        const result = await window.electronAPI.analyseFile(filePath, filename);
        setTyping(false);
        if (result.success) {
          addAI("Analysis complete. Here's what I found:");
          setTimeout(() => addAI('', 'card', result.data), 300);
        } else {
          addAI(`Couldn't analyse that file: ${result.error}`);
        }
      } else {
        // Fallback mock when no path available
        await new Promise((r) => setTimeout(r, 2000));
        setTyping(false);
        addAI("Analysis complete. Here's what I found:");
        setTimeout(() => addAI('', 'card', null), 300);
      }
    } catch (err) {
      setTyping(false);
      addAI('Something went wrong during analysis. Please try again.');
      console.error('[IMPRO] handleFileAnalysis error:', err);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: uid(), role: 'user', type: 'text', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = [
        "That's a good point. Keep pushing on those skill gaps.",
        "I can help you map that to your current growth trajectory.",
        "Want me to pull up your latest skill profile?",
        "Let's dig into that. Drop a file and I'll give you a full breakdown.",
      ];
      addAI(replies[Math.floor(Math.random() * replies.length)]);
    }, 1200 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // File drop on chat window
  const handleDragOver = (e) => { e.preventDefault(); setDropOver(true); };
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDropOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      console.log('[IMPRO] File dropped (chat):', {
        name: file.name,
        size: file.size,
        path: file.path,
      });
      handleFileAnalysis(file.name, file.path);
    } else {
      handleFileAnalysis();
    }
  };

  const close = () => window.electronAPI?.closeChat();

  return (
    <div
      className={`chat-root ${dropOver ? 'chat-root--drop' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-orb" />
        <span className="chat-header-title">IMPRO</span>
        <span className="chat-header-sub">skill growth AI</span>
        <button className="chat-close" onClick={close} title="Close">✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Drop overlay */}
      {dropOver && (
        <div className="drop-overlay">
          <div className="drop-icon">⬡</div>
          <div className="drop-text">Drop to analyse</div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Message IMPRO..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className={`chat-send ${input.trim() ? 'chat-send--active' : ''}`}
          onClick={sendMessage}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
