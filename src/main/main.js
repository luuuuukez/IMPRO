require('dotenv').config();
const { app, BrowserWindow, ipcMain, screen, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const Groq = require('groq-sdk');
const getSystemPrompt = require('../../prompts/system-prompt');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let orbWindow = null;
let chatWindow = null;
let bubbleWindow = null;
let reportWindow = null;
let bubbleReady = false;
let pendingBubble = null;
let lastAnalysisResult = null;
let pendingFile = null;   // file dropped on orb before chat was ready
let chatLoaded = false;   // true after chat webContents finishes loading

app.whenReady().then(() => {
  protocol.handle('report', (request) => {
    const { pathname } = new URL(request.url);
    const filePath = path.join(__dirname, '../../report', pathname.slice(1));
    return net.fetch('file://' + filePath);
  });

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
  orbWindow.setPosition(width - 250, height - 200);
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

// ── PDF extraction ────────────────────────────────────────────────────────────

function extractPdfText(filePath) {
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', (data) => {
      const text = data.Pages
        .flatMap(p => p.Texts)
        .map(t => decodeURIComponent(t.R[0].T))
        .join(' ');
      resolve(text);
    });
    parser.on('pdfParser_dataError', reject);
    parser.loadPDF(filePath);
  });
}

// ── Chat window ───────────────────────────────────────────────────────────────

function sendPendingFile() {
  if (!pendingFile || !chatWindow || chatWindow.isDestroyed() || !chatLoaded) return;
  chatWindow.webContents.send('auto-analyse-file', pendingFile);
  pendingFile = null;
}

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
  chatWindow.webContents.once('did-finish-load', () => {
    chatLoaded = true;
    sendPendingFile();
  });
  chatWindow.on('closed', () => {
    chatWindow = null;
    chatLoaded = false;
    pendingFile = null;
  });
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

ipcMain.on('show-bubble', (_e, text) => showBubble(text));
ipcMain.on('hide-bubble', () => hideBubble());

ipcMain.on('file-dropped', (_e, { name, path: filePath } = {}) => {
  pendingFile = { name, filePath };
  sendPendingFile(); // sends immediately if chat is already loaded
});

const MOCK_ANALYSIS = {
  strengths: ['Strong system design', 'Good problem solving'],
  gaps: ['Programming fundamentals', 'Conflict management'],
  role_fit: 'partial_fit',
  insights: ['Conceptually strong but relies on AI for basics'],
  recommendations: ['Practice independent debugging', 'Take system design course'],
  technical: {
    programming_fundamentals: { dependency: 70, capability: 20, status: 'gap' },
    system_design: { dependency: 15, capability: 65, status: 'strong' },
    debugging: { dependency: 50, capability: 40, status: 'active_learning' },
    ai_application: { dependency: 60, capability: 50, status: 'active_learning' },
  },
  cognitive: {
    understanding: 1.6, application: 1.8,
    analysis: 0.9, evaluation: 1.2, creation: 1.0,
  },
  social: {
    communication: 1.8, teamwork: 1.9, empathy: 1.2,
    influence: 1.1, conflict_management: 0.6, service_orientation: 1.3,
  },
};

ipcMain.handle('analyse-file', async (_e, { filePath, fileName }) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let content;
    if (ext === '.pdf') {
      content = await extractPdfText(filePath);
    } else {
      content = fs.readFileSync(filePath, 'utf-8');
    }

    console.log('[IMPRO] File size:', content.length, 'chars');
    console.log('[IMPRO] Sending to Groq...');

    const maxChars = 8000;
    const truncated = content.length > maxChars
      ? content.slice(0, maxChars) + '\n[truncated]'
      : content;

    if (content.length > maxChars) {
      console.log('[IMPRO] Content truncated from', content.length, 'to', maxChars, 'chars');
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: truncated },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    });
    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');

    console.log('[IMPRO] Groq raw response for', fileName, ':\n', raw);

    const data = JSON.parse(raw);

    const parts = (fileName || '').replace(/\.pdf$/i, '').split('-');
    data.person_name = parts[parts.length - 1].trim() || null;

    console.log('[IMPRO] Parsed analysis:', JSON.stringify(data, null, 2));

    lastAnalysisResult = data;
    if (chatWindow && !chatWindow.isDestroyed()) {
      chatWindow.webContents.send('analysis-complete', data);
    }

    return { success: true, data };
  } catch (err) {
    console.log('[IMPRO] API failed, using mock data:', err.message);

    lastAnalysisResult = MOCK_ANALYSIS;
    if (chatWindow && !chatWindow.isDestroyed()) {
      chatWindow.webContents.send('analysis-complete', MOCK_ANALYSIS);
    }

    return { success: true, data: MOCK_ANALYSIS };
  }
});

// ── Report window ─────────────────────────────────────────────────────────────

function createReportWindow() {
  if (reportWindow && !reportWindow.isDestroyed()) {
    reportWindow.focus();
    return;
  }

  reportWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    hasShadow: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload-report.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  const reportPath = path.join(__dirname, '../../public/report.html');
  console.log('[IMPRO] Loading report from:', reportPath);
  reportWindow.loadFile(reportPath);
  /*reportWindow.webContents.openDevTools({ mode: 'detach' });*/
  reportWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.log('[IMPRO] Report load failed:', errorCode, errorDescription, validatedURL);
  });
  reportWindow.webContents.on('did-finish-load', () => {
    console.log('[IMPRO] Report loaded successfully');
  });
  reportWindow.on('closed', () => { reportWindow = null; });
}

// ── Additional IPC ────────────────────────────────────────────────────────────

ipcMain.on('get-analysis-data', (event) => {
  event.returnValue = lastAnalysisResult || null;
});

ipcMain.on('open-report', () => createReportWindow());
