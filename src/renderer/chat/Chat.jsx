import { useState, useEffect, useRef } from 'react';
import './chat.css';

const WELCOME = {
  id: 1,
  role: 'ai',
  type: 'text',
  text: "Hi, I'm IMPRO. I'm here to help you grow.\nDrop a file to analyse your skill profile, or just chat.",
};

let nextId = 2;
const uid = () => nextId++;

function SkillBar({ label, score, color }) {
  return (
    <div className="skill-row">
      <span className="skill-label">{label}</span>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="skill-score">{score}</span>
    </div>
  );
}

function SkillCard({ data }) {
  // Derive scores from real data (ratio of strengths to total mentions)
  const score = (cat) => {
    const s = cat?.strengths?.length ?? 0;
    const g = cat?.gaps?.length ?? 0;
    return s + g === 0 ? 50 : Math.round((s / (s + g)) * 100);
  };

  const techScore = data ? score(data.technical) : 72;
  const cogScore  = data ? score(data.cognitive)  : 58;
  const socScore  = data ? score(data.social)     : 45;
  const topGap    = data
    ? (data.technical?.gaps?.[0] ?? data.cognitive?.gaps?.[0] ?? data.social?.gaps?.[0] ?? 'None identified')
    : 'Distributed systems';
  const recNote   = data ? data.recommendations?.[0] : '— trending up in market';

  return (
    <div className="skill-card">
      <div className="skill-role">
        <span className="skill-role-icon">⬡</span>
        {data ? 'Skill Profile' : 'Full Stack Developer'}
      </div>
      <SkillBar label="Technical" score={techScore} color="linear-gradient(90deg,#6366f1,#818cf8)" />
      <SkillBar label="Cognitive" score={cogScore}  color="linear-gradient(90deg,#3b82f6,#60a5fa)" />
      <SkillBar label="Social"    score={socScore}   color="linear-gradient(90deg,#0ea5e9,#38bdf8)" />
      <div className="skill-gap">
        <span className="gap-icon">↑</span>
        <div>
          <strong>Top gap:</strong> {topGap}<br />
          {recNote && <span className="gap-sub">{recNote}</span>}
        </div>
      </div>
      <a href="#" className="skill-link" onClick={() => window.electronAPI.openReport()}>
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

  // Listen for file drop relayed from orb window
  useEffect(() => {
    if (!window.electronAPI?.onFileDrop) return;
    const unsub = window.electronAPI.onFileDrop((name, filePath) => handleFileAnalysis(name, filePath));
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
