import { useState, useEffect, useRef, useCallback } from 'react';
import './orb.css';

const MESSAGES = {
  greeting: "Good morning. How's work going today?",
  idle:     "Haven't checked your skill gaps recently. Want a quick update?",
};

export default function Orb() {
  const [nudging,  setNudging]  = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const [dropOver, setDropOver] = useState(false);
  const bubbleTimer = useRef(null);
  const idleTimer   = useRef(null);

  const showBubble = useCallback((type) => {
    setNudging(true);
    window.electronAPI?.showBubble(MESSAGES[type]);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => {
      window.electronAPI?.hideBubble();
      setNudging(false);
    }, 6000);
    // nudge animation is short — remove class after it finishes
    setTimeout(() => setNudging(false), 700);
  }, []);

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => showBubble('idle'), 60000);
  }, [showBubble]);

  useEffect(() => {
    const greetTimer = setTimeout(() => showBubble('greeting'), 3000);
    resetIdle();
    const events = ['mousemove', 'mousedown', 'keydown'];
    events.forEach((e) => document.addEventListener(e, resetIdle));
    return () => {
      clearTimeout(greetTimer);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((e) => document.removeEventListener(e, resetIdle));
    };
  }, [showBubble, resetIdle]);

  // Custom drag + click detection
  const dragState = useRef(null);

  const handleMouseDown = async (e) => {
    e.preventDefault();
    const pos = await window.electronAPI.getWindowPosition();
    dragState.current = {
      moved:   false,
      startMX: e.screenX,
      startMY: e.screenY,
      startWX: pos[0],
      startWY: pos[1],
    };

    const onMove = (ev) => {
      if (!dragState.current) return;
      if (!dragState.current.moved) {
        // First pixel of movement — dismiss bubble so it doesn't float orphaned
        window.electronAPI?.hideBubble();
      }
      dragState.current.moved = true;
      const dx = ev.screenX - dragState.current.startMX;
      const dy = ev.screenY - dragState.current.startMY;
      window.electronAPI.moveWindow(
        dragState.current.startWX + dx,
        dragState.current.startWY + dy,
      );
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragState.current && !dragState.current.moved) {
        window.electronAPI.openChat();
        window.electronAPI?.hideBubble();
        resetIdle();
      }
      dragState.current = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDropOver(true); };
  const handleDragLeave = () => setDropOver(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setDropOver(false);
    window.electronAPI.openChat();
    window.electronAPI.notifyFileDrop();
    resetIdle();
  };

  return (
    <div className="orb-root">
      <div
        className={[
          'orb-wrapper',
          hovered  ? 'orb-wrapper--hover' : '',
          nudging  ? 'orb-wrapper--nudge' : '',
          dropOver ? 'orb-wrapper--drop'  : '',
        ].join(' ')}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="orb">
          <div className="orb-blob orb-blob--1" />
          <div className="orb-blob orb-blob--2" />
          <div className="orb-blob orb-blob--3" />
        </div>
        <div className="orb-highlight" />
      </div>
    </div>
  );
}
