const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let orbWindow = null;
let chatWindow = null;
let bubbleWindow = null;
let bubbleReady = false;
let pendingBubble = null;

app.whenReady().then(() => {
  createOrbWindow();
  createBubbleWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Orb window ────────────────────────────────────────────────────────────────

function createOrbWindow() {
  orbWindow = new BrowserWindow({
    width: 200,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  orbWindow.loadFile(path.join(__dirname, '../../public/orb.html'));

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  orbWindow.setPosition(width - 175, height - 175);
}

// ── Bubble window ─────────────────────────────────────────────────────────────

function createBubbleWindow() {
  bubbleWindow = new BrowserWindow({
    width: 280,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  bubbleWindow.setAlwaysOnTop(true, 'screen-saver');
  bubbleWindow.setIgnoreMouseEvents(true);
  bubbleWindow.loadFile(path.join(__dirname, '../../public/bubble.html'));

  bubbleWindow.webContents.once('did-finish-load', () => {
    bubbleReady = true;
    if (pendingBubble) {
      showBubble(pendingBubble);
      pendingBubble = null;
    }
  });

  bubbleWindow.hide();
}

function showBubble(text) {
  if (!bubbleReady || !orbWindow || !bubbleWindow || bubbleWindow.isDestroyed()) {
    pendingBubble = text;
    return;
  }

  const orb = orbWindow.getBounds();
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
  const bw = 280, bh = 100;

  // Center over orb, 8px gap above the orb sphere (which has 40px top padding)
  let bx = orb.x + orb.width / 2 - bw / 2;
  bx = Math.max(5, Math.min(bx, sw - bw - 5));

  const orbPadding = 60;
  let by = orb.y + orbPadding - bh - 8; // default: above
  if (by < 5) by = orb.y + orb.height + 8; // flip below if near top

  bubbleWindow.setPosition(Math.round(bx), Math.round(by));
  bubbleWindow.webContents.send('set-bubble-text', text);
  bubbleWindow.showInactive();
}

function hideBubble() {
  if (bubbleWindow && !bubbleWindow.isDestroyed()) {
    bubbleWindow.hide();
  }
}

// ── Chat window ───────────────────────────────────────────────────────────────

function positionChatWindow() {
  if (!orbWindow || !chatWindow) return;
  const orb = orbWindow.getBounds();
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  // Always place to the RIGHT of the orb with a gap
  let cx = orb.x + orb.width + 12;
  if (cx + 360 > sw) cx = orb.x - 360 - 12; // flip left if needed

  const cy = Math.max(10, Math.min(orb.y + orb.height - 520, sh - 530));
  chatWindow.setPosition(cx, cy);
}

function createChatWindow() {
  if (chatWindow && !chatWindow.isDestroyed()) {
    if (chatWindow.isVisible()) {
      chatWindow.hide();
    } else {
      positionChatWindow();
      chatWindow.show();
      chatWindow.focus();
    }
    return;
  }

  chatWindow = new BrowserWindow({
    width: 360,
    height: 520,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  chatWindow.loadFile(path.join(__dirname, '../../public/chat.html'));
  chatWindow.once('ready-to-show', () => {
    positionChatWindow();
    chatWindow.show();
  });
  chatWindow.on('closed', () => { chatWindow = null; });
}

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.handle('open-chat', () => createChatWindow());

// close-chat: send (not handle) — closes the window entirely
ipcMain.on('close-chat', () => {
  if (chatWindow && !chatWindow.isDestroyed()) chatWindow.close();
});

ipcMain.handle('get-window-position', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  return win ? win.getPosition() : [0, 0];
});

ipcMain.on('move-window', (e, { x, y }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win) {
    win.setPosition(Math.round(x), Math.round(y));
    // Reposition bubble if orb moved
    if (win === orbWindow && bubbleWindow && !bubbleWindow.isDestroyed() && bubbleWindow.isVisible()) {
      const orb = win.getBounds();
      const { width: sw } = screen.getPrimaryDisplay().workAreaSize;
      const bw = 280, bh = 100;
      let bx = orb.x + orb.width / 2 - bw / 2;
      bx = Math.max(5, Math.min(bx, sw - bw - 5));
      const orbPadding = 60;
      let by = orb.y + orbPadding - bh - 8;
      if (by < 5) by = orb.y + orb.height + 8;
      bubbleWindow.setPosition(Math.round(bx), Math.round(by));
    }
  }
});

ipcMain.on('show-bubble', (e, text) => showBubble(text));
ipcMain.on('hide-bubble', () => hideBubble());

ipcMain.on('file-dropped', () => {
  if (chatWindow && !chatWindow.isDestroyed()) {
    chatWindow.webContents.send('file-dropped');
  }
});
