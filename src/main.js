/**
 * PrettyProof - Capture the Proof of Your Happiness
 * Vanilla ES Modules - Static GitHub Pages Compatible
 */

// App State
const state = {
  currentStep: 'landing', // landing, layout-selection, booth, editing, export
  theme: localStorage.getItem('pretty-theme') || 'pink',
  selectedLayout: 'A',
  capturedPhotos: [],
  cameraActive: false,
  stream: null,
  activeFilter: 'none',
  frameColor: 'white',
  frameTheme: 'minimal-studio',
  isMirrored: true,
  timer: 3
};

const THEMES = {
  pink: { class: 'from-pink-100 via-rose-50 to-white', accent: '#ec4899', text: 'text-rose-900' },
  purple: { class: 'from-purple-100 via-indigo-50 to-white', accent: '#a855f7', text: 'text-indigo-900' },
  sky: { class: 'from-sky-100 via-blue-50 to-white', accent: '#0ea5e9', text: 'text-blue-900' },
  black: { class: 'from-zinc-200 via-zinc-100 to-white', accent: '#18181b', text: 'text-zinc-900' },
  yellow: { class: 'from-amber-100 via-orange-50 to-white', accent: '#f59e0b', text: 'text-orange-900' },
  orange: { class: 'from-orange-100 via-red-50 to-white', accent: '#f97316', text: 'text-red-900' },
  green: { class: 'from-emerald-100 via-teal-50 to-white', accent: '#10b981', text: 'text-teal-900' }
};

const LAYOUTS = {
  A: { name: 'Strip (4)', photos: 4, grid: '1x4', ratio: '3:4' },
  B: { name: 'Strip (3)', photos: 3, grid: '1x3', ratio: '3:4' },
  C: { name: 'Strip (2)', photos: 2, grid: '1x2', ratio: '3:4' },
  D: { name: 'Grid (2x2)', photos: 4, grid: '2x2', ratio: '3:4' },
  E: { name: 'Extended (6)', photos: 6, grid: '2x3', ratio: '3:4' }
};

const FILTERS = {
  none: 'none',
  vintage: 'sepia(0.5) contrast(1.1) brightness(1.1) saturate(0.8)',
  bw: 'grayscale(1)',
  sepia: 'sepia(1)',
  warm: 'sepia(0.2) saturate(1.4) hue-rotate(-10deg)',
  cool: 'saturate(1.2) hue-rotate(180deg) brightness(1.1)',
  blur: 'blur(2px)',
  sharpen: 'contrast(1.5) brightness(1.1)',
  retro: 'hue-rotate(20deg) saturate(0.5) contrast(1.2)',
  cinematic: 'contrast(1.2) saturate(1.1) brightness(0.9) hue-rotate(-5deg)',
  softGlow: 'brightness(1.1) blur(0.5px) saturate(1.1)',
  dreamy: 'brightness(1.2) saturate(0.8) blur(1px) hue-rotate(-15deg)'
};

const FRAME_THEMES = {
  'minimal-studio': { bg: '#ffffff', text: '#000000', decorative: 'STUDIO' },
  'dark-room': { bg: '#111111', text: '#ffffff', decorative: 'NOIR' },
  'soft-blush': { bg: '#fff1f2', text: '#881337', decorative: 'SOFT' },
  'vintage-sepia': { bg: '#fef3c7', text: '#78350f', decorative: 'VNTG' },
  'neon-vibe': { bg: '#000000', text: '#22c55e', decorative: 'NEON' }
};

// --- Initialization ---

function init() {
  document.documentElement.style.setProperty('--accent-color', THEMES[state.theme].accent);
  renderBackground();
  renderApp();
  
  window.addEventListener('resize', () => {
    // Optional: add debounce if needed
  });
}

// --- Navigation & State Management ---

function setStep(step) {
  state.currentStep = step;
  if (step !== 'booth') stopCamera();
  renderApp();
}

function setTheme(themeKey) {
  state.theme = themeKey;
  localStorage.setItem('pretty-theme', themeKey);
  document.documentElement.style.setProperty('--accent-color', THEMES[themeKey].accent);
  renderBackground();
  renderApp();
}

// --- Render Functions ---

function renderBackground() {
  const app = document.getElementById('app');
  let bg = document.getElementById('app-bg');
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'app-bg';
    bg.className = 'fixed inset-0 -z-10 transition-all duration-1000 ease-in-out';
    app.appendChild(bg);
  }
  bg.className = `fixed inset-0 -z-10 transition-all duration-1000 ease-in-out bg-gradient-to-br ${THEMES[state.theme].class} ${THEMES[state.theme].text}`;
}

function updateBoothSidebar() {
  const list = document.getElementById('captured-list');
  const counter = document.getElementById('photo-counter');
  const finishBtn = document.getElementById('btn-finish-booth');
  
  if (!list) return;

  const layout = LAYOUTS[state.selectedLayout];
  
  // Update images
  list.innerHTML = `
    ${state.capturedPhotos.map((photo, i) => `
      <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/20 shadow-lg border border-white/20 group animate-slide-in">
        <img src="${photo}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button onclick="removePhoto(${i})" class="bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4 text-white"></i>
          </button>
        </div>
        <div class="absolute bottom-2 left-2 px-3 py-1 bg-white/40 backdrop-blur-md rounded-lg text-[9px] font-black uppercase">Slot ${i+1}</div>
      </div>
    `).join('')}
    ${Array(Math.max(0, layout.photos - state.capturedPhotos.length)).fill().map((_, i) => `
      <div class="aspect-[3/4] bg-white/30 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center opacity-30 gap-2">
         <i data-lucide="camera" class="w-5 h-5"></i>
         <span class="text-[8px] font-black uppercase tracking-widest">Awaiting</span>
      </div>
    `).join('')}
  `;

  if (counter) {
    counter.textContent = `${state.capturedPhotos.length} / ${layout.photos}`;
  }

  if (finishBtn) {
    finishBtn.disabled = state.capturedPhotos.length < layout.photos;
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderApp() {
  const container = document.getElementById('app');
  const oldContent = document.getElementById('current-page');
  if (oldContent) oldContent.remove();

  const page = document.createElement('div');
  page.id = 'current-page';
  page.className = `w-full h-screen flex flex-col relative fade-in ${THEMES[state.theme].text}`;

  page.appendChild(createNavbar());

  const main = document.createElement('main');
  main.className = 'flex-1 overflow-hidden relative flex flex-col';

  switch (state.currentStep) {
    case 'landing': main.appendChild(createLandingPage()); break;
    case 'layout-selection': main.appendChild(createLayoutSelection()); break;
    case 'booth': main.appendChild(createBoothPage()); break;
    case 'editing': main.appendChild(createEditingPage()); break;
    case 'export': main.appendChild(createExportPage()); break;
  }

  page.appendChild(main);
  page.appendChild(createFooter());
  container.appendChild(page);

  if (window.lucide) window.lucide.createIcons();
}

function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'h-8 border-t border-zinc-200 backdrop-blur-sm bg-white/40 flex items-center justify-between px-8 text-[9px] opacity-70 font-black uppercase tracking-wider';
  footer.innerHTML = `
    <span>© 2024 PRETTYPROOF STUDIO</span>
    <span class="hidden md:inline"><span>A simple project of <span class="text-zinc-900">Jasper Manlusoc</span></span></span>

  `;
  return footer;
}

// --- Components ---

function createNavbar() {
  const nav = document.createElement('nav');
  const isLanding = state.currentStep === 'landing';
  nav.className = `w-full h-16 flex items-center justify-between px-8 z-50 transition-all duration-500 ${isLanding ? 'bg-transparent border-transparent' : 'border-b border-white/30 backdrop-blur-xl bg-white/20'}`;
  
  const logo = document.createElement('div');
  logo.className = 'flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform';
  logo.innerHTML = `
    <span class="text-3xl font-black italic tracking-tight font-display drop-shadow-sm">Pretty<span class="opacity-70">Proof</span></span>
  `;
  logo.onclick = () => {
      if (confirm('Return to home? Session details will be reset.')) setStep('landing');
  };

  const rightArea = document.createElement('div');
  rightArea.className = 'flex items-center gap-6';

  const themeSelector = document.createElement('div');
  themeSelector.className = 'flex items-center gap-2 bg-white/30 p-1 rounded-full border border-white/40 shadow-inner backdrop-blur-md';
  
  Object.keys(THEMES).forEach(key => {
    const btn = document.createElement('button');
    btn.className = `w-5 h-5 rounded-full border-2 transition-all hover:scale-125 ${state.theme === key ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent'}`;
    btn.style.backgroundColor = THEMES[key].accent;
    btn.onclick = () => setTheme(key);
    themeSelector.appendChild(btn);
  });

  const aboutBtn = document.createElement('button');
  aboutBtn.className = 'px-5 py-1.5 bg-white/40 hover:bg-white/60 border border-white/50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm';
  aboutBtn.textContent = 'About';
  aboutBtn.onclick = showAboutModal;

  rightArea.appendChild(themeSelector);
  rightArea.appendChild(aboutBtn);

  nav.appendChild(logo);
  nav.appendChild(rightArea);
  return nav;
}

function createLandingPage() {
  const hero = document.createElement('div');
  hero.className = 'flex-1 flex flex-col items-center justify-between py-12 px-6 overflow-hidden relative h-full';
  
  // Floating Decorative Elements (Floating Hearts + Icons)
  const floatingContainer = `
    <div id="hearts-container" class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"></div>
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-10">
      <div class="absolute top-[10%] right-[10%] text-indigo-500 animate-float-slow">
        <i data-lucide="sparkles" class="w-16 h-16"></i>
      </div>
      <div class="absolute top-[20%] left-[8%] text-blue-500 animate-float opacity-50">
        <i data-lucide="camera" class="w-12 h-12"></i>
      </div>
      <div class="absolute bottom-[20%] right-[8%] text-purple-500 animate-float-delayed opacity-50">
        <i data-lucide="send" class="w-10 h-10 -rotate-12"></i>
      </div>
    </div>
  `;

  hero.innerHTML = `
    ${floatingContainer}
    
    <div class="max-w-5xl w-full flex flex-col items-center justify-center h-full z-10 py-8">
      <!-- Title Section -->
      <div class="text-center space-y-4 md:space-y-6 mb-8 md:mb-10">
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] font-display text-zinc-900 drop-shadow-sm flex flex-col items-center">
           <span class="block">Every Moment,</span>
           <span style="color: var(--accent-color)" class="drop-shadow-sm italic block">Beautifully Captured</span>
        </h1>
        <p class="text-sm md:text-xl font-semibold opacity-70 max-w-2xl mx-auto leading-relaxed px-4">
          Welcome to your personal online photobooth made for capturing moments that deserve to be remembered.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 z-30">
        <button id="btn-start" class="group px-12 py-5 bg-zinc-950 text-white font-bold rounded-full hover:bg-zinc-800 transform active:scale-95 transition-all text-lg shadow-2xl flex items-center gap-4 uppercase tracking-widest">
          LAUNCH STUDIO <i data-lucide="arrow-right" class="w-6 h-6 group-hover:translate-x-2 transition-transform"></i>
        </button>
        <button id="btn-demo" class="px-12 py-5 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-zinc-200 text-zinc-900 font-bold rounded-full transform active:scale-95 transition-all text-lg flex items-center gap-3 uppercase tracking-widest">
          HOW IT WORKS <i data-lucide="play" class="w-5 h-5 fill-current text-zinc-600"></i>
        </button>
      </div>
    </div>
  `;

  hero.querySelector('#btn-start').onclick = () => setStep('layout-selection');
  hero.querySelector('#btn-demo').onclick = showAboutModal;

  // Initialize Heart Reactions
  initHearts(hero.querySelector('#hearts-container'));

  if (window.lucide) window.lucide.createIcons();

  return hero;
}

function initHearts(container) {
  const spawnHeart = () => {
    if (state.currentStep !== 'landing') return;
    const heart = document.createElement('div');
    heart.className = 'heart-reaction flex items-center justify-center';
    const size = Math.random() * 15 + 15;
    const xPos = Math.random() * 80 + 10; // keep away from edges
    heart.style.left = xPos + '%';
    heart.style.bottom = '10%';
    heart.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ec4899" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
  };

  // Recurring
  const interval = setInterval(() => {
    if (state.currentStep !== 'landing') {
      clearInterval(interval);
      return;
    }
    spawnHeart();
  }, 1200); // Slightly more frequent for that "reaction" feel
}

function createLayoutSelection() {
  const container = document.createElement('div');
  container.className = 'flex-1 flex flex-col items-center p-8 overflow-y-auto bg-white/5';
  
  container.innerHTML = `
    <div class="max-w-6xl w-full space-y-12 pb-12 fade-in">
      <div class="text-center space-y-3">
        <h2 class="text-5xl font-black tracking-tight uppercase">Studio Gallery</h2>
        <p class="text-xs font-black opacity-40 uppercase tracking-[0.3em]">Select your sequence format</p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        ${Object.keys(LAYOUTS).map(key => `
          <div id="layout-${key}" class="layout-card group relative bg-white/20 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-between cursor-pointer hover:bg-white/40 border border-white/30 transition-all transform hover:-translate-y-2 shadow-xl overflow-hidden">
            <div class="w-full flex-1 flex flex-col gap-2 p-3 bg-white/40 rounded-xl overflow-hidden aspect-[3/4] shadow-inner">
               ${renderLayoutPreview(key)}
            </div>
            <div class="mt-6 text-center">
              <span class="text-lg font-black uppercase tracking-tight">${LAYOUTS[key].name}</span>
              <p class="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1 font-bold">Standard Print</p>
            </div>
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <div class="bg-white text-black p-4 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300">
                 <i data-lucide="arrow-up-right" class="w-6 h-6"></i>
               </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  Object.keys(LAYOUTS).forEach(key => {
    container.querySelector(`#layout-${key}`).onclick = () => {
      state.selectedLayout = key;
      state.capturedPhotos = [];
      setStep('booth');
    };
  });

  return container;
}

function renderLayoutPreview(key) {
  const l = LAYOUTS[key];
  const item = '<div class="flex-1 bg-white/20 rounded-lg shadow-inner"></div>';
  if (l.grid === '1x4' || l.grid === '1x3' || l.grid === '1x2') return Array(l.photos).fill(item).join('');
  if (l.grid === '2x2') return `<div class="grid grid-cols-2 grid-rows-2 h-full gap-3">${Array(4).fill(item).join('')}</div>`;
  if (l.grid === '2x3') return `<div class="grid grid-cols-2 grid-rows-3 h-full gap-3">${Array(6).fill(item).join('')}</div>`;
  return '';
}

function createBoothPage() {
  const container = document.createElement('div');
  container.className = 'flex-1 flex overflow-hidden lg:flex-row flex-col';
  
  // Left: Session Monitor
  const left = document.createElement('aside');
  left.className = 'lg:w-64 w-full border-r border-white/20 bg-white/10 backdrop-blur-sm flex flex-col z-20 overflow-hidden';
  left.innerHTML = `
    <div class="p-6 border-b border-white/10 bg-white/10">
      <h3 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Sequence</h3>
      <div class="flex justify-between items-end">
        <span id="photo-counter" class="text-2xl font-black tracking-tight">${state.capturedPhotos.length} / ${LAYOUTS[state.selectedLayout].photos}</span>
        <div class="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded text-[9px] font-black tracking-[0.1em]">LIVE</div>
      </div>
    </div>
    <div id="captured-list" class="flex-1 overflow-y-auto p-6 space-y-4 pr-1">
      ${state.capturedPhotos.map((photo, i) => `
        <div class="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/20 shadow-lg border border-white/20 group">
          <img src="${photo}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onclick="removePhoto(${i})" class="bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition-colors">
              <i data-lucide="trash-2" class="w-4 h-4 text-white"></i>
            </button>
          </div>
          <div class="absolute bottom-2 left-2 px-3 py-1 bg-white/40 backdrop-blur-md rounded-lg text-[9px] font-black uppercase">Slot ${i+1}</div>
        </div>
      `).join('')}
      ${Array(Math.max(0, LAYOUTS[state.selectedLayout].photos - state.capturedPhotos.length)).fill().map((_, i) => `
        <div class="aspect-[3/4] bg-white/30 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center opacity-30 gap-2">
           <i data-lucide="camera" class="w-5 h-5"></i>
           <span class="text-[8px] font-black uppercase tracking-widest">Awaiting</span>
        </div>
      `).join('')}
    </div>
  `;

  // Center: Live Studio
  const center = document.createElement('section');
  center.className = 'flex-1 relative flex flex-col items-center justify-center p-8 z-10';
  center.innerHTML = `
    <div class="relative w-full max-w-2xl aspect-[4/3] bg-slate-900 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden border-[10px] border-white/30 flex items-center justify-center">
      <video id="booth-video" autoplay playsinline class="w-full h-full object-cover select-none ${state.isMirrored ? 'scale-x-[-1]' : ''} opacity-90"></video>
      <div id="countdown" class="absolute inset-0 flex items-center justify-center text-[12rem] font-black text-white pointer-events-none drop-shadow-2xl leading-none"></div>
      <div id="flash-overlay" class="absolute inset-0 bg-white opacity-0 pointer-events-none z-50 transition-opacity duration-75"></div>
      
      <!-- Studio UI -->
      <div class="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between">
        <div class="flex justify-between items-start">
           <div class="px-3 py-1 bg-white/20 backdrop-blur-md rounded border border-white/30 text-[10px] font-black tracking-widest flex items-center gap-2">
              <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> RECORDING
           </div>
           <div class="text-[9px] font-mono opacity-40">ISO 400 / 60FPS</div>
        </div>
        <div class="flex justify-center -mb-4">
           <span class="text-4xl font-black tracking-[0.5em] opacity-10 select-none uppercase">Studio</span>
        </div>
      </div>
    </div>
    
    <div class="mt-8 flex items-center gap-10">
      <div class="flex flex-col items-center gap-2">
         <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Timer</span>
         <div class="flex bg-white/20 p-1 rounded-full border border-white/30">
           ${[3, 5, 10].map(t => `
             <button onclick="setTimer(${t})" class="px-5 py-2 rounded-full text-[10px] font-black transition-all ${state.timer === t ? 'bg-white text-black shadow-lg' : 'hover:bg-white/10 opacity-60'} uppercase">${t}S</button>
           `).join('')}
         </div>
      </div>
      
      <button id="btn-capture" class="w-20 h-20 bg-white rounded-full flex items-center justify-center group transform active:scale-95 transition-all shadow-2xl border-4 border-white/30">
        <div class="w-16 h-16 border-4 border-transparent rounded-full flex items-center justify-center group-hover:border-black/5 transition-all">
           <div class="w-12 h-12 bg-black/10 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
              <i data-lucide="camera" class="w-5 h-5 opacity-40"></i>
           </div>
        </div>
      </button>
      
      <div class="flex flex-col items-center gap-2">
         <span class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Camera</span>
         <button onclick="toggleMirror()" class="p-4 bg-white/20 rounded-full border border-white/30 hover:bg-white/30 transition-all text-current shadow-sm">
            <i data-lucide="maximize" class="w-5 h-5"></i>
         </button>
      </div>
    </div>
  `;

  // Right: Studio Tools
  const right = document.createElement('aside');
  right.className = 'lg:w-80 w-full border-l border-white/20 bg-white/10 backdrop-blur-sm flex flex-col z-20 overflow-hidden';
  right.innerHTML = `
    <div class="p-6 border-b border-white/20 bg-white/10 flex items-center justify-between">
       <span class="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Filters</span>
       <i data-lucide="sliders" class="w-4 h-4 opacity-40"></i>
    </div>
    <div class="flex-1 overflow-y-auto p-6 space-y-8 pr-1">
      <div class="grid grid-cols-2 gap-3">
        ${Object.keys(FILTERS).map(key => `
          <button onclick="applyBoothFilter('${key}')" class="p-3 bg-white/20 rounded-2xl flex flex-col items-center gap-3 border border-white/10 hover:border-white/40 transition-all group ${state.activeFilter === key ? 'bg-white ring-4 ring-white/20 border-white text-black' : ''}">
            <div class="w-full aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
               <div class="w-full h-full bg-current opacity-20" style="filter: ${FILTERS[key]}"></div>
               <i data-lucide="palette" class="absolute w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity"></i>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest leading-none ${state.activeFilter === key ? 'text-black' : 'opacity-60'}">${key === 'none' ? 'RAW' : key}</span>
          </button>
        `).join('')}
      </div>
    </div>
    
    <div class="p-6 bg-white/5 border-t border-white/20">
      <button id="btn-finish-booth" class="w-full py-4 bg-white text-black font-black rounded-2xl disabled:opacity-30 transition-all shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2" ${state.capturedPhotos.length < LAYOUTS[state.selectedLayout].photos ? 'disabled' : ''}>
         Finalize Session <i data-lucide="check-circle-2" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  container.appendChild(left);
  container.appendChild(center);
  container.appendChild(right);

  // Use a ref-like check to prevent multiple startCamera calls
  if (!state.cameraActive) {
    setTimeout(() => startCamera(container.querySelector('#booth-video')), 200);
  } else {
    // If already active, just attach stream to new video element
    setTimeout(() => {
        const video = container.querySelector('#booth-video');
        if (video && state.stream) {
            video.srcObject = state.stream;
            video.style.filter = FILTERS[state.activeFilter];
            video.play();
        }
    }, 100);
  }

  container.querySelector('#btn-capture').onclick = () => takePhoto();
  container.querySelector('#btn-finish-booth').onclick = () => setStep('editing');

  return container;
}

function createEditingPage() {
  const container = document.createElement('div');
  container.className = 'flex-1 flex overflow-hidden lg:flex-row flex-col bg-white/10';
  
  const left = document.createElement('section');
  left.className = 'flex-1 p-10 flex items-center justify-center overflow-auto';
  left.innerHTML = `
    <div id="final-layout-preview" class="shadow-[0_60px_100px_rgba(0,0,0,0.3)] transition-all duration-700 hover:scale-[1.01]">
       ${renderFinalLayout()}
    </div>
  `;

  const right = document.createElement('aside');
  right.className = 'lg:w-96 w-full border-l border-white/20 bg-white/10 backdrop-blur-sm flex flex-col p-8 space-y-10 overflow-y-auto';
  right.innerHTML = `
    <div class="space-y-3">
      <h2 class="text-4xl font-black tracking-tight uppercase">Customize</h2>
      <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Fine-tune your Studio Print</p>
    </div>
    
    <div class="space-y-10">
      <div>
        <h3 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Frame Moods</h3>
        <div class="grid grid-cols-1 gap-3">
          ${Object.keys(FRAME_THEMES).map(t => `
            <button onclick="setFrameTheme('${t}')" class="w-full p-4 bg-white/20 rounded-2xl flex items-center justify-between group transition-all border border-white/10 ${state.frameTheme === t ? 'bg-white text-black ring-4 ring-white/20' : 'hover:bg-white/30'}">
              <div class="flex items-center gap-4">
                 <div class="w-8 h-8 rounded-lg shadow-sm" style="background-color: ${FRAME_THEMES[t].bg}; border: 1px solid rgba(0,0,0,0.1)"></div>
              </div>
              <span class="text-xl opacity-30 group-hover:opacity-100 transition-opacity">${FRAME_THEMES[t].decorative}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div>
        <h3 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Studio Accent</h3>
        <div class="flex flex-wrap gap-3">
          ${['white', '#111111', '#fce7f3', '#fef9c3', '#ecfdf5', '#eff6ff', '#fff1f2', '#f5f3ff'].map(c => `
             <button onclick="setFrameColor('${c}')" class="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg transform hover:scale-125 transition-transform ${state.frameColor === c ? 'ring-2 ring-white scale-125 border-transparent' : ''}" style="background-color: ${c}"></button>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="flex-1"></div>
    
    <div class="space-y-4 pt-8 border-t border-white/10">
      <button id="btn-export-final" class="w-full py-5 bg-white text-black font-black rounded-full hover:scale-[1.02] transition-all shadow-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
        EXPORT PRINT <i data-lucide="download" class="w-4 h-4"></i>
      </button>
      <button id="btn-retake" class="w-full py-3 bg-white/10 text-current opacity-60 hover:opacity-100 font-bold rounded-full transition-all text-[9px] uppercase tracking-[0.2em]">
        Discard Session
      </button>
    </div>
  `;

  container.appendChild(left);
  container.appendChild(right);

  container.querySelector('#btn-export-final').onclick = () => setStep('export');
  container.querySelector('#btn-retake').onclick = () => {
    if (confirm('Delete all captures and start fresh?')) {
      state.capturedPhotos = [];
      setStep('layout-selection');
    }
  };

  return container;
}

function renderFinalLayout() {
  const theme = FRAME_THEMES[state.frameTheme] || FRAME_THEMES['minimal-studio'];
  const bgColor = state.frameColor !== 'white' ? state.frameColor : theme.bg;
  const textColor = (state.frameColor === '#111111' || theme.bg === '#111111' || theme.bg === '#000000') ? '#ffffff' : theme.text;
  
  const layout = LAYOUTS[state.selectedLayout];
  const photos = state.capturedPhotos.slice(0, layout.photos);
  
  let contentHtml = '';
  // Check if grid is one column
  if (layout.grid === '1x4' || layout.grid === '1x3' || layout.grid === '1x2') {
    contentHtml = photos.map(src => `
      <div class="w-full aspect-square bg-zinc-200 rounded-sm overflow-hidden relative border border-black/5 shadow-sm">
        <img src="${src}" class="w-full h-full object-cover">
      </div>
    `).join('');
  } else {
    contentHtml = `
      <div class="grid grid-cols-2 gap-3">
        ${photos.map(src => `
          <div class="aspect-square bg-zinc-200 rounded-lg overflow-hidden relative border border-black/5 shadow-sm">
            <img src="${src}" class="w-full h-full object-cover">
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <div id="final-strip-container" class="flex flex-col items-center p-8 transition-all" style="background-color: ${bgColor}; color: ${textColor}; min-width: 320px; max-width: 450px;">
      <div class="w-full flex-1 space-y-4">
        ${contentHtml}
      </div>
      <div class="mt-8 flex flex-col items-center">
         <span class="text-[10px] font-black tracking-[0.6em] uppercase mb-1 opacity-60 font-display">${theme.decorative}</span>
         <h3 class="text-3xl font-black italic tracking-tight uppercase leading-none font-display">Pretty<span class="opacity-30">Proof</span></h3>
         <div class="mt-4 flex items-center gap-3 opacity-20 transform scale-75">
            <div class="w-10 h-[2px] bg-current"></div>
            <div class="text-[8px] font-black uppercase tracking-widest">${new Date().getFullYear()}</div>
            <div class="w-10 h-[2px] bg-current"></div>
         </div>
      </div>
    </div>
  `;
}

function createExportPage() {
  const container = document.createElement('div');
  container.className = 'flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto bg-white/5';
  
  container.innerHTML = `
    <div class="max-w-2xl w-full flex flex-col items-center space-y-12 fade-in">
       <div class="text-center space-y-4">
          <div id="status-badge" class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
             <i data-lucide="loader" class="w-3 h-3 animate-spin"></i> Developing...
          </div>
          <h2 class="text-6xl font-black tracking-tight uppercase leading-none">Developed.<br/>Processed.</h2>
          <p class="text-[11px] font-bold opacity-40 uppercase tracking-[0.3em]">Your Studio Print is now ready</p>
       </div>

       <div id="canvas-preview-container" class="p-8 bg-white/20 backdrop-blur-3xl rounded-[40px] border border-white/40 shadow-[0_80px_100px_-20px_rgba(0,0,0,0.3)] transform hover:rotate-2 transition-transform duration-500 flex items-center justify-center">
          <div id="html-preview-fallback">
            ${renderFinalLayout()}
          </div>
          <canvas id="export-canvas" class="max-w-full h-auto hidden rounded-sm shadow-2xl"></canvas>
       </div>

       <div class="flex flex-col items-center gap-6 w-full max-w-sm">
          <button id="btn-download" class="w-full py-6 bg-black text-white font-black rounded-full hover:bg-zinc-800 transition-all shadow-2xl flex items-center justify-center gap-4 text-sm tracking-[0.1em] uppercase border-b-8 border-zinc-900 active:border-b-0 active:translate-y-2">
            Download HD Print <i data-lucide="arrow-down" class="w-5 h-5"></i>
          </button>
          
          <button id="btn-new-session" class="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity">
            Start New Session
          </button>
       </div>
    </div>
  `;

  container.querySelector('#btn-download').onclick = downloadImage;
  container.querySelector('#btn-new-session').onclick = () => {
      state.capturedPhotos = [];
      setStep('landing');
  };

  // Run generation
  setTimeout(async () => {
    await generateFinalCanvas();
    const badge = container.querySelector('#status-badge');
    if (badge) {
        badge.className = 'inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20';
        badge.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Ready for Export';
        if (window.lucide) window.lucide.createIcons();
    }
    const canvas = container.querySelector('#export-canvas');
    const fallback = container.querySelector('#html-preview-fallback');
    if (canvas && fallback) {
        canvas.classList.remove('hidden');
        fallback.classList.add('hidden');
    }
  }, 100);

  return container;
}

function downloadImage() {
    const canvas = document.getElementById('export-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PrettyProof-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

// --- Utils & Assets ---

async function startCamera(videoElement) {
  if (state.cameraActive && state.stream) {
    if (videoElement) {
        videoElement.srcObject = state.stream;
        videoElement.onloadedmetadata = () => videoElement.play();
    }
    return;
  }
  
  try {
    const constraints = { 
      video: { 
        width: { ideal: 1920 }, 
        height: { ideal: 1080 },
        facingMode: 'user' 
      }, 
      audio: false 
    };
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.cameraActive = true;
    if (videoElement) {
        videoElement.srcObject = state.stream;
        videoElement.onloadedmetadata = () => videoElement.play();
    }
  } catch (err) {
    console.error('Camera Error:', err);
    state.cameraActive = false;
    alert('Access Denied: Please enable camera in browser settings to continue.');
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
    state.stream = null;
    state.cameraActive = false;
  }
}

function toggleMirror() {
  state.isMirrored = !state.isMirrored;
  const video = document.getElementById('booth-video');
  if (video) video.classList.toggle('scale-x-[-1]', state.isMirrored);
}

function applyBoothFilter(key) {
  state.activeFilter = key;
  const video = document.getElementById('booth-video');
  if (video) video.style.filter = FILTERS[key];
  
  // Update the sidebar filter buttons without full re-render
  const buttons = document.querySelectorAll('[onclick^="applyBoothFilter"]');
  buttons.forEach(btn => {
    const filterKey = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (filterKey === key) {
        btn.className = btn.className.replace('bg-white/20', 'bg-white ring-4 ring-white/20 border-white text-black');
    } else {
        btn.className = btn.className.replace('bg-white ring-4 ring-white/20 border-white text-black', 'bg-white/20');
    }
  });
}

function setTimer(v) {
  state.timer = v;
  // Update timer buttons
  const buttons = document.querySelectorAll('[onclick^="setTimer"]');
  buttons.forEach(btn => {
    const val = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
    if (val === v) {
        btn.className = 'px-5 py-2 rounded-full text-[10px] font-black transition-all bg-white text-black shadow-lg uppercase';
    } else {
        btn.className = 'px-5 py-2 rounded-full text-[10px] font-black transition-all hover:bg-white/10 opacity-60 uppercase';
    }
  });
}

function removePhoto(index) {
  state.capturedPhotos.splice(index, 1);
  updateBoothSidebar();
}

async function takePhoto() {
  const video = document.getElementById('booth-video');
  const countdown = document.getElementById('countdown');
  const btn = document.getElementById('btn-capture');
  const flash = document.getElementById('flash-overlay');
  
  if (!video || !btn) return;
  btn.disabled = true;

  let count = state.timer;
  countdown.textContent = count;
  
  const timerInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else {
      clearInterval(timerInterval);
      countdown.textContent = '';
      
      flash.classList.add('opacity-100');
      setTimeout(() => flash.classList.remove('opacity-100'), 150);

      const canvas = document.createElement('canvas');
      // Capture at video native resolution
      let w = video.videoWidth || 1280;
      let h = video.videoHeight || 720;
      
      // Safety check for invalid dimensions
      if (w < 100 || h < 100) {
        w = 1280;
        h = 720;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      
      // Mirror if needed
      if (state.isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      // APPLY THE FILTER TO THE CANVAS BEFORE DRAWING
      if (state.activeFilter !== 'none') {
        ctx.filter = FILTERS[state.activeFilter];
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.95);
      state.capturedPhotos.push(photoData);
      btn.disabled = false;
      
      // INCREMENTAL UPDATE
      updateBoothSidebar();

      if (state.capturedPhotos.length >= LAYOUTS[state.selectedLayout].photos) {
        setTimeout(() => setStep('editing'), 800);
      }
    }
  }, 1000);
}

function showAboutModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 fade-in';
  modal.innerHTML = `
    <div class="max-w-2xl w-full p-12 rounded-[32px] relative bg-white text-zinc-900 shadow-2xl animate-slide-in">
      <button id="close-modal" class="absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-zinc-900">
        <i data-lucide="x" class="w-6 h-6"></i>
      </button>
      <div class="space-y-10">
        <div class="flex items-center gap-6">
          <div>
            <h2 class="text-5xl font-black tracking-tight leading-none font-display text-zinc-950">Pretty<span class="opacity-30">Proof</span></h2>
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-2">Premium Studios</p>
          </div>
        </div>
        
      <div class="space-y-6">
        <p class="text-xl font-medium leading-relaxed text-zinc-600">
          PrettyProof is an effortlessly elegant studio experience designed to transform your digital moments into cinematic masterpieces and timeless memories.
        </p>
      </div>
        
        <button id="start-now" class="w-full py-5 bg-zinc-950 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-lg uppercase tracking-widest text-xs">
          START CAPTURING
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) window.lucide.createIcons();

  modal.querySelector('#close-modal').onclick = () => modal.remove();
  modal.querySelector('#start-now').onclick = () => {
    modal.remove();
    setStep('layout-selection');
  };
}

function setFrameColor(color) {
  state.frameColor = color;
  renderApp();
}

function setFrameTheme(theme) {
  state.frameTheme = theme;
  state.frameColor = 'white'; // Reset manual color when choosing a theme
  renderApp();
}

async function generateFinalCanvas() {
  const canvas = document.getElementById('export-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const photos = state.capturedPhotos;
  const layout = LAYOUTS[state.selectedLayout];
  const theme = FRAME_THEMES[state.frameTheme] || FRAME_THEMES['minimal-studio'];
  
  const baseWidth = 1200;
  let baseHeight;
  if (layout.grid === '1x4') baseHeight = 3600;
  else if (layout.grid === '1x3') baseHeight = 2800;
  else if (layout.grid === '1x2') baseHeight = 2000;
  else if (layout.grid === '2x2') baseHeight = 1800;
  else if (layout.grid === '2x3') baseHeight = 2600;
  
  canvas.width = baseWidth;
  canvas.height = baseHeight;
  
  // Background
  const fColor = state.frameColor !== 'white' ? state.frameColor : theme.bg;
  const tColor = (state.frameColor === '#111111' || theme.bg === '#111111' || theme.bg === '#000000') ? '#ffffff' : theme.text;
  ctx.fillStyle = fColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Pattern if any
  if (theme.pattern && state.frameColor === 'white') {
     // Patterns in canvas are tricky, so we'll just draw a solid color for the static export
     // Or simulate it with a loop. For simplicity, we'll keep it solid for now.
  }
  
  const padding = 80;
  const gap = 50;
  const footerSpace = 150;
  
  if (layout.grid.includes('1x')) {
    const imgWidth = baseWidth - (padding * 2);
    const availableHeight = baseHeight - (padding * 2) - footerSpace - (gap * (layout.photos - 1));
    const imgHeight = availableHeight / layout.photos;
    
    for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i]);
        const y = padding + (i * (imgHeight + gap));
        drawCoverImage(ctx, img, padding, y, imgWidth, imgHeight);
    }
  } else {
    const cols = 2;
    const rows = layout.photos / cols;
    const imgWidth = (baseWidth - (padding * 2) - gap) / cols;
    const availableHeight = baseHeight - (padding * 2) - footerSpace - (gap * (rows - 1));
    const imgHeight = availableHeight / rows;
    
    for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i]);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padding + (col * (imgWidth + gap));
        const y = padding + (row * (imgHeight + gap));
        drawCoverImage(ctx, img, x, y, imgWidth, imgHeight);
    }
  }
  
  // Branding Footer
  ctx.fillStyle = tColor;
  ctx.globalAlpha = 0.5;
  ctx.font = '900 24px Merriweather';
  ctx.textAlign = 'center';
  ctx.fillText('PRETTYPROOF STUDIO PRINT No. ' + Date.now().toString().slice(-6), canvas.width/2, canvas.height - 100);
  ctx.globalAlpha = 1.0;
  //ctx.font = '900 120px Merriweather';
  //ctx.fillText(theme.decorative, canvas.width/2, canvas.height - 160);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function drawCoverImage(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx, sy, sw, sh;
  
  if (imgRatio > targetRatio) {
    sh = img.height;
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  // Add thin border to image
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
}

// Global scope exposure for handlers
window.removePhoto = removePhoto;
window.setTimer = setTimer;
window.toggleMirror = toggleMirror;
window.applyBoothFilter = applyBoothFilter;
window.setFrameColor = setFrameColor;
window.setFrameTheme = setFrameTheme;

init();
