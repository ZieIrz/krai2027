/**
 * ABU ROBOCON 2027 SOLO, INDONESIA - "THE PURSUIT OF MUSTIKA NUSANTARA"
 * Official Interactive Rulebook & Strategy Deck Engine
 * Features:
 * - Web Audio API Synthesizer (Zero External Dependencies)
 * - Interactive 2.5D Arena Blueprint Inspector (11x11 Meter Map)
 * - Live Scoring Calculator with Sanctuary Mandate Verification Engine
 * - Playable Mini-Game: Mustika Arena Quest (Canvas 2D, 90s Timer, D-Pad)
 * - Command Palette (Ctrl+K), Object Specs Modals, & Tactile Soundboard
 */

// -----------------------------------------------------------------------------
// 1. SOUND FX ENGINE (Pure Web Audio API Synthesis)
// -----------------------------------------------------------------------------
let audioCtx = null;
let isSoundEnabled = localStorage.getItem('sound_enabled') !== 'false';

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.04) {
  if (!isSoundEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.debug('Audio blip suppressed:', err);
  }
}

function playSpecificSound(type) {
  if (!isSoundEnabled) return;
  initAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  switch (type) {
    case 'relay': {
      // 5V mechanical relay snap
      playTone(190, 'triangle', 0.02, 0.08);
      setTimeout(() => playTone(130, 'square', 0.03, 0.05), 25);
      showToast('⚡ Relai 5V terpicu: Klik mekanikal');
      break;
    }
    case 'lidar': {
      // LiDAR 360 pulse sweep
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(2600, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.12);
      } catch (e) {}
      showToast('📡 Pulsa LiDAR: Sinyal 360° dipancarkan');
      break;
    }
    case 'motor': {
      // Planetary motor / servo whir
      playTone(170, 'sawtooth', 0.14, 0.05);
      setTimeout(() => playTone(260, 'sine', 0.12, 0.04), 45);
      break;
    }
    case 'pneumatic': {
      // 600 kPa pneumatic valve air burst (noise synthesis)
      try {
        const bufferSize = audioCtx.sampleRate * 0.08;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(2.5, now);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
        noise.stop(now + 0.08);
      } catch (e) {
        playTone(300, 'square', 0.05, 0.05);
      }
      showToast('💨 Pneumatik 600 kPa: Aktuator silinder aktif');
      break;
    }
    case 'whistle': {
      // Referee whistle / match buzzer (two harmonic tones)
      playTone(2800, 'sine', 0.22, 0.06);
      playTone(3100, 'triangle', 0.22, 0.05);
      showToast('🎺 Peluit Wasit: Sinyal Mulai / Akhir Pertandingan 3 Menit');
      break;
    }
    case 'victory': {
      // Mustika Nusantara 250 Pts Victory Fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.2, 0.06), idx * 100);
      });
      showToast('🏆 MUSTIKA ENSHRINED: 250 POIN KEMENANGAN!');
      break;
    }
    case 'coin': {
      // Block pickup / score chime
      playTone(987.77, 'sine', 0.07, 0.06);
      setTimeout(() => playTone(1318.51, 'sine', 0.12, 0.07), 70);
      break;
    }
    case 'boost': {
      // Jet boost sweep
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.2);
      } catch (e) {}
      break;
    }
    case 'error': {
      // Buzzer warning tone
      playTone(220, 'sawtooth', 0.15, 0.06);
      setTimeout(() => playTone(196, 'sawtooth', 0.18, 0.06), 120);
      break;
    }
    case 'click':
    default: {
      playTone(640, 'sine', 0.04, 0.03);
      break;
    }
  }
}

// -----------------------------------------------------------------------------
// 2. TOAST NOTIFICATION SYSTEM
// -----------------------------------------------------------------------------
const toastEl = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
let toastTimer = null;

function showToast(message) {
  if (!toastEl || !toastText) return;
  toastText.textContent = message;
  toastEl.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2800);
}

// -----------------------------------------------------------------------------
// 3. THEME SYSTEM: DARK & LIGHT MODE
// -----------------------------------------------------------------------------
const themeToggleBtn = document.getElementById('theme-toggle');
const floatingThemeBtn = document.getElementById('btn-floating-theme');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');
const themeText = document.querySelector('.theme-text');
const metaThemeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, notify = false) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  if (theme === 'dark') {
    if (iconSun) iconSun.style.display = 'none';
    if (iconMoon) iconMoon.style.display = 'inline-block';
    if (themeText) themeText.textContent = 'Dark';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#070b12');
    if (notify) showToast('🌙 Mode Gelap (Cyber Arena) diaktifkan');
  } else {
    if (iconSun) iconSun.style.display = 'inline-block';
    if (iconMoon) iconMoon.style.display = 'none';
    if (themeText) themeText.textContent = 'Light';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#f8fafc');
    if (notify) showToast('☀️ Mode Terang (Precision White) diaktifkan');
  }
  playSpecificSound('click');
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme, false);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });
}

if (floatingThemeBtn) {
  floatingThemeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });
}

// -----------------------------------------------------------------------------
// 4. DYNAMIC ACCENT COLOR ENGINE
// -----------------------------------------------------------------------------
const btnPalette = document.getElementById('btn-palette');
const paletteMenu = document.getElementById('palette-menu');
const swatchBtns = document.querySelectorAll('.color-swatch-btn');

if (btnPalette && paletteMenu) {
  btnPalette.addEventListener('click', (e) => {
    e.stopPropagation();
    paletteMenu.classList.toggle('open');
    playSpecificSound('click');
  });

  document.addEventListener('click', () => {
    paletteMenu.classList.remove('open');
  });
}

function applyAccentColor(color, notify = true) {
  document.documentElement.setAttribute('data-accent', color);
  localStorage.setItem('accent_color', color);

  swatchBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === color);
  });

  const names = {
    cyan: 'Cyber Cyan 🔵',
    purple: 'Neon Violet 🟣',
    emerald: 'Matrix Emerald 🟢',
    amber: 'Solar Amber 🟠',
    rose: 'Crimson Plasma 🔴'
  };

  if (notify) {
    showToast(`Aksen warna: ${names[color] || color}`);
    playSpecificSound('lidar');
  }
}

const savedAccent = localStorage.getItem('accent_color') || 'cyan';
applyAccentColor(savedAccent, false);

swatchBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyAccentColor(btn.dataset.color, true);
    if (paletteMenu) paletteMenu.classList.remove('open');
  });
});

// -----------------------------------------------------------------------------
// 5. SOUND TOGGLE BUTTON
// -----------------------------------------------------------------------------
const soundToggleBtn = document.getElementById('sound-toggle');
const iconSoundOff = document.querySelector('.icon-sound-off');
const iconSoundOn = document.querySelector('.icon-sound-on');

function updateSoundUI() {
  if (iconSoundOff && iconSoundOn) {
    iconSoundOff.style.display = isSoundEnabled ? 'none' : 'inline-block';
    iconSoundOn.style.display = isSoundEnabled ? 'inline-block' : 'none';
  }
}
updateSoundUI();

if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    initAudioContext();
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('sound_enabled', String(isSoundEnabled));
    updateSoundUI();
    if (isSoundEnabled) {
      playTone(659.25, 'sine', 0.1, 0.05);
      showToast('🔊 Efek suara diaktifkan');
    } else {
      showToast('🔇 Efek suara dimatikan');
    }
  });
}

// -----------------------------------------------------------------------------
// 6. MOBILE NAVIGATION DRAWER
// -----------------------------------------------------------------------------
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open', !isOpen);
    playSpecificSound('click');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      playSpecificSound('click');
    });
  });
}

// -----------------------------------------------------------------------------
// 7. INTERACTIVE BLUEPRINT FIELD INSPECTOR DATA & HANDLER
// -----------------------------------------------------------------------------
const zoneDatabase = {
  central_pillar: {
    badge: 'ZONA TERTINGGI / APEX MISI',
    title: 'Central Pillar (Level 2)',
    desc: 'Tiang silinder tertinggi di puncak Level 2 tempat bola Mustika wajib disemayamkan oleh Builder Robot (BR) setelah Sanctuary Mandate terpenuhi. Mengunci raihan 250 poin kemenangan!',
    dim: 'Tinggi 800 mm, Diameter 270 mm (PVC pipe with wooden cap)',
    bowl: 'Diameter 180 mm, Kedalaman 100 mm (Cekungan penahan bola)',
    access: 'Hanya Builder Robot (BR) 100% Otonom',
    req: 'Sanctuary Mandate Wajib Aktif (Min. 2 Menara, 1 di Shared Area)',
    pts: '250 Poin Kemenangan (Pertandingan tetap lanjut hingga 3 menit)'
  },
  transfer_red: {
    badge: 'ZONA LOGISTIK & SERAH TERIMA',
    title: 'Transfer Area (Red Team)',
    desc: 'Area 1000 × 1000 mm di perbatasan Level 1 tempat TR menyerahkan blok dan Mustika kepada BR. TR boleh menaruh blok di lantai area ini, namun Mustika WAJIB diserahkan langsung (direct handover) tanpa menyentuh lantai.',
    dim: '1000 mm × 1000 mm (Plywood, Water Paint RGB: 245-170-60)',
    bowl: 'Batas lantai elevasi Level 1 (+600 mm)',
    access: 'TR & BR diizinkan bertemu di batas area ini',
    req: 'Mustika dilarang sentuh lantai (Dropped Mustika jika jatuh). TR dilarang taruh blok selagi roda di Ground.',
    pts: '5 Poin per blok yang sukses diantar TR'
  },
  transfer_blue: {
    badge: 'ZONA LOGISTIK & SERAH TERIMA',
    title: 'Transfer Area (Blue Team)',
    desc: 'Area 1000 × 1000 mm di perbatasan Level 1 tim Biru untuk transfer blok dan bola Mustika antara TR dan BR.',
    dim: '1000 mm × 1000 mm (Plywood, Water Paint RGB: 60-170-245)',
    bowl: 'Elevasi Level 1 (+600 mm)',
    access: 'TR & BR diizinkan bertemu di sini',
    req: 'Mustika dilarang menyentuh lantai (Direct Handover mutlak)',
    pts: '5 Poin per blok yang sukses diantar TR'
  },
  ground_shared: {
    badge: 'ZONA BEREBUT SKY BLOCK',
    title: 'Ground Shared Area',
    desc: 'Area netral di Ground Level berukuran 1200 × 1200 mm yang menampung 12 unit Sky Block (kardus 200 mm 2 warna) dalam pola papan catur 5×5 dengan bagian tengah kosong. Dapat diakses oleh TR kedua tim.',
    dim: '1200 mm × 1200 mm (Plywood, RGB: 245-240-200)',
    bowl: '12 Sky Blocks (Merah di satu sisi, Biru di sisi lain)',
    access: 'TR kedua tim diizinkan masuk dan memanen',
    req: 'Dilarang mendorong/menyeret blok di lantai! Wajib diangkat aktif.',
    pts: 'Sky Block bernilai 40 pt (L1) atau 80 pt (L2)'
  },
  mustika_pillar: {
    badge: 'PEDESTAL AWAL ARTEFAK',
    title: 'Mustika Pillar (Ground Area)',
    desc: 'Tiang silinder di Ground Area tempat bola Mustika diletakkan panitia sebelum laga dimulai. TR hanya boleh mengambil Mustika dari tiang ini setelah tim memenuhi Sanctuary Mandate. Wasit akan selalu mengisi ulang pilar jika bola diambil/jatuh sampai ada yang sah di Central Pillar.',
    dim: 'Tinggi 500 mm, Diameter 270 mm',
    bowl: 'Cekungan: Diameter 180 mm, Kedalaman 100 mm',
    access: 'TR (hanya setelah Sanctuary Mandate aktif)',
    req: 'Jika Mustika jatuh saat laga, tiang diisi ulang wasit saat aman',
    pts: 'Kunci merebut 250 Poin di Central Pillar'
  },
  level_1: {
    badge: 'PLATFORM TINGKAT 1 (+600 mm)',
    title: 'Level 1 Platform',
    desc: 'Platform 6000 × 6000 mm dengan elevasi 600 mm dari Ground. Diakses melalui ramp (3500 mm) atau tangga (anak tangga 150 mm). Memuat Building Spot eksklusif kedua tim dan 1 Building Spot Shared.',
    dim: '6000 mm × 6000 mm, Tinggi 600 mm dari lantai Ground',
    bowl: 'Building Spots hijau 500 × 500 mm',
    access: 'Builder Robot (BR) saja. TR DILARANG MASUK!',
    req: 'Area violation jika ada bagian TR melanggar batas L1 (Forced Retry)',
    pts: 'Menara L1: Dasar 10pt, Tengah 20pt, Puncak 40pt (Total 70 pt)'
  },
  level_2: {
    badge: 'PLATFORM TINGKAT 2 (+900 mm - ALL SHARED)',
    title: 'Level 2 Platform (Upper Shared Area)',
    desc: 'Platform tertinggi 3000 × 3000 mm, 300 mm di atas L1 (900 mm dari lantai). PEMBARUAN V1.1: Anak tangga antara L1 dan L2 resmi DIHAPUS. BR bebas memanjat dari sisi mana pun di L1! Seluruh permukaan L2 adalah Shared Area yang terbuka untuk kedua tim.',
    dim: '3000 mm × 3000 mm, Tinggi 900 mm dari Ground (+300 mm dari L1)',
    bowl: 'Memuat Central Pillar dan L2 Building Spots',
    access: 'Builder Robot (BR) kedua tim',
    req: 'BR harus memiliki kemampuan memanjat elevasi 300 mm tanpa tangga',
    pts: 'Menara L2: Dasar 20pt, Tengah 40pt, Puncak 80pt (Total 140 pt)'
  },
  storage_red: {
    badge: 'GUDANG LOGISTIK TIM MERAH',
    title: 'Storage Area (Red Team)',
    desc: 'Area eksklusif 1000 × 2000 mm di Ground Area tim Merah yang menampung 20 unit Earth Block (350 × 350 × 350 mm, 600 gram). Tumpukan awal maksimal 2 blok per kolom.',
    dim: '1000 mm × 2000 mm (RGB: 240-210-210)',
    bowl: '20 Earth Blocks kardus 3 lapis',
    access: 'TR Tim Merah saja',
    req: 'TR dilarang membawa lebih dari 3 blok sekaligus',
    pts: 'Bahan baku penegak fondasi menara'
  },
  storage_blue: {
    badge: 'GUDANG LOGISTIK TIM BIRU',
    title: 'Storage Area (Blue Team)',
    desc: 'Area eksklusif 1000 × 2000 mm di Ground Area tim Biru yang menampung 20 unit Earth Block kubus kardus.',
    dim: '1000 mm × 2000 mm (RGB: 170-210-230)',
    bowl: '20 Earth Blocks kubus kardus',
    access: 'TR Tim Biru saja',
    req: 'TR dilarang membawa lebih dari 3 blok sekaligus',
    pts: 'Bahan baku penegak fondasi menara'
  },
  bspot_l1_red: {
    badge: 'TITIK BANGUN EKSKLUSIF MERAH',
    title: 'Building Spot L1 (Red Team)',
    desc: 'Titik pembangunan menara eksklusif tim Merah di Level 1. BR tim Merah menyusun menara lengkap (2 Earth Blocks + 1 Sky Block merah). Tim lawan dilarang memanipulasi balok di sini.',
    dim: '500 mm × 500 mm (Plywood, Paint RGB: 40-100-50)',
    bowl: 'Kapasitas 1 Complete Tower',
    access: 'BR Tim Merah',
    req: 'Urutan wajib: Earth Dasar ➔ Earth Tengah ➔ Sky Block',
    pts: '1 Complete Tower L1 bernilai 70 Poin'
  },
  bspot_l1_blue: {
    badge: 'TITIK BANGUN EKSKLUSIF BIRU',
    title: 'Building Spot L1 (Blue Team)',
    desc: 'Titik pembangunan menara eksklusif tim Biru di Level 1. BR tim Biru menyusun menara lengkap dengan Sky Block menghadap biru.',
    dim: '500 mm × 500 mm (Plywood, Paint RGB: 40-100-50)',
    bowl: 'Kapasitas 1 Complete Tower',
    access: 'BR Tim Biru',
    req: 'Urutan wajib: Earth Dasar ➔ Earth Tengah ➔ Sky Block',
    pts: '1 Complete Tower L1 bernilai 70 Poin'
  },
  bspot_l1_shared: {
    badge: 'TITIK BANGUN BERSAMA (L1 SHARED)',
    title: 'Building Spot (L1 Shared Area)',
    desc: 'Titik pembangunan di perbatasan netral Level 1. Menara yang dibangun di sini memenuhi syarat MANDAT SANCTUARY! Menara dapat tersusun dari balok campuran kedua tim (Multi-team tower).',
    dim: '500 mm × 500 mm (Plywood, Paint RGB: 40-100-50)',
    bowl: 'Kapasitas 1 Complete Tower (Contested)',
    access: 'BR kedua tim (Shared Area)',
    req: 'Dilarang mengganggu manipulasi objek lawan. Kontak fisik = Forced Retry.',
    pts: 'Kunci pembuka Sanctuary Mandate!'
  },
  bspot_l2: {
    badge: 'TITIK BANGUN APEX (LEVEL 2 SHARED)',
    title: 'Building Spot (Level 2 Platform)',
    desc: 'Titik pembangunan di platform Level 2 dengan nilai poin pengganda tertinggi! Menara yang dibangun di sini bernilai dua kali lipat dibanding Level 1 dan otomatis memenuhi syarat wilayah Shared untuk Sanctuary Mandate.',
    dim: '500 mm × 500 mm (Plywood, Paint RGB: 40-100-50)',
    bowl: 'Kapasitas 1 Complete Tower',
    access: 'BR kedua tim (Level 2 All Shared)',
    req: 'BR harus memanjat L2 secara otonom tanpa tangga.',
    pts: 'Dasar 20pt, Tengah 40pt, Sky 80pt (Total 140 Pts!)'
  }
};

const inspBadge = document.getElementById('insp-badge');
const inspTitle = document.getElementById('insp-title');
const inspDesc = document.getElementById('insp-desc');
const inspDim = document.getElementById('insp-dim');
const inspBowl = document.getElementById('insp-bowl');
const inspAccess = document.getElementById('insp-access');
const inspReq = document.getElementById('insp-req');
const inspPts = document.getElementById('insp-pts');

window.inspectQuickZone = function(zoneKey) {
  playSpecificSound('click');
  const z = zoneDatabase[zoneKey] || zoneDatabase['central_pillar'];

  if (inspBadge) inspBadge.textContent = z.badge;
  if (inspTitle) inspTitle.textContent = z.title;
  if (inspDesc) inspDesc.textContent = z.desc;
  if (inspDim) inspDim.textContent = z.dim;
  if (inspBowl) inspBowl.textContent = z.bowl;
  if (inspAccess) inspAccess.textContent = z.access;
  if (inspReq) inspReq.textContent = z.req;
  if (inspPts) inspPts.textContent = z.pts;

  // Highlight pill buttons
  document.querySelectorAll('.btn-zone-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(zoneKey));
  });

  // Highlight SVG node
  document.querySelectorAll('.arena-zone-node').forEach(node => {
    node.classList.toggle('active-zone', node.dataset.zone === zoneKey);
  });
};

// SVG Node Click Handlers
document.querySelectorAll('.arena-zone-node').forEach(node => {
  node.addEventListener('click', () => {
    const zoneKey = node.dataset.zone;
    if (zoneKey && zoneDatabase[zoneKey]) {
      inspectQuickZone(zoneKey);
    } else {
      inspectQuickZone('level_1');
    }
  });
});

// -----------------------------------------------------------------------------
// 8. REAL-TIME SCORING CALCULATOR & SANCTUARY MANDATE VALIDATOR
// -----------------------------------------------------------------------------
const scoreState = {
  transfer_blocks: 0,
  l1_earth_bottom: 0,
  l1_earth_mid: 0,
  l1_sky_top: 0,
  l2_earth_bottom: 0,
  l2_earth_mid: 0,
  l2_sky_top: 0,
  mustika_enshrined: false
};

const liveTotalScoreEl = document.getElementById('live-total-score');
const subTrPtsEl = document.getElementById('sub-tr-pts');
const subL1PtsEl = document.getElementById('sub-l1-pts');
const subL2PtsEl = document.getElementById('sub-l2-pts');
const subMustikaPtsEl = document.getElementById('sub-mustika-pts');

const mandateCard = document.getElementById('mandate-card');
const mandateBadgeText = document.getElementById('mandate-badge-text');
const checkCond1 = document.getElementById('check-cond-1');
const checkCond2 = document.getElementById('check-cond-2');
const btnEnshrineMustika = document.getElementById('btn-enshrine-mustika');
const mustikaLockHint = document.getElementById('mustika-lock-hint');

window.changeCalcScore = function(key, delta) {
  playSpecificSound('click');
  scoreState[key] = Math.max(0, (scoreState[key] || 0) + delta);

  // Update counter UI
  const displayMap = {
    transfer_blocks: 'val-transfer-blocks',
    l1_earth_bottom: 'val-l1-bottom',
    l1_earth_mid: 'val-l1-mid',
    l1_sky_top: 'val-l1-sky',
    l2_earth_bottom: 'val-l2-bottom',
    l2_earth_mid: 'val-l2-mid',
    l2_sky_top: 'val-l2-sky'
  };

  if (displayMap[key]) {
    const el = document.getElementById(displayMap[key]);
    if (el) el.textContent = scoreState[key];
  }

  evaluateScoringEngine();
};

function evaluateScoringEngine() {
  // 1. Calculate Complete Towers
  // A complete tower requires 1 bottom Earth block + 1 middle Earth block + 1 top Sky block
  const l1TowersComplete = Math.min(scoreState.l1_earth_bottom, scoreState.l1_earth_mid, scoreState.l1_sky_top);
  const l2TowersComplete = Math.min(scoreState.l2_earth_bottom, scoreState.l2_earth_mid, scoreState.l2_sky_top);
  const totalCompleteTowers = l1TowersComplete + l2TowersComplete;

  // Sanctuary Mandate Rule (Bab 3.6.1):
  // Min 2 Complete Towers standing at the same time, with min 1 located in a Shared Area (L1 Shared or L2 Area)
  // (All towers on Level 2 are in Shared Area)
  const condition1 = totalCompleteTowers >= 2;
  const condition2 = l2TowersComplete >= 1; // Level 2 is shared
  const isMandateFulfilled = condition1 && condition2;

  // Update Mandate UI
  if (mandateCard && mandateBadgeText && checkCond1 && checkCond2) {
    if (isMandateFulfilled) {
      mandateCard.className = 'mandate-status-card fulfilled';
      mandateBadgeText.className = 'mandate-badge met';
      mandateBadgeText.textContent = 'TERPENUHI (AKTIF)';
      checkCond1.innerHTML = '✅ Minimal 2 Menara Lengkap berdiri (' + totalCompleteTowers + ' Menara)';
      checkCond2.innerHTML = '✅ Minimal 1 Menara di Shared Area (' + l2TowersComplete + ' di Level 2)';

      if (btnEnshrineMustika) {
        btnEnshrineMustika.className = scoreState.mustika_enshrined ? 'btn-toggle-mustika enshrined' : 'btn-toggle-mustika ready';
        btnEnshrineMustika.textContent = scoreState.mustika_enshrined ? '✓ MUSTIKA TERPASANG (+250)' : '⚡ PASANG MUSTIKA (+250)';
      }
      if (mustikaLockHint) {
        mustikaLockHint.textContent = '✅ Sanctuary Mandate Terbuka! TR boleh mengambil Mustika dan BR boleh menyemayamkan di Central Pillar.';
        mustikaLockHint.style.color = '#34d399';
      }
    } else {
      mandateCard.className = 'mandate-status-card unfulfilled';
      mandateBadgeText.className = 'mandate-badge unmet';
      mandateBadgeText.textContent = 'BELUM TERPENUHI';
      checkCond1.innerHTML = (condition1 ? '✅' : '❌') + ' Minimal 2 Menara Lengkap berdiri (' + totalCompleteTowers + ' / 2)';
      checkCond2.innerHTML = (condition2 ? '✅' : '❌') + ' Minimal 1 Menara di Shared Area (' + l2TowersComplete + ' / 1 di L2)';

      // Auto un-enshrine if conditions broken
      scoreState.mustika_enshrined = false;
      if (btnEnshrineMustika) {
        btnEnshrineMustika.className = 'btn-toggle-mustika locked';
        btnEnshrineMustika.textContent = '🔒 TERKUNCI';
      }
      if (mustikaLockHint) {
        mustikaLockHint.textContent = '⚠️ Mustika terkunci! Penuhi Sanctuary Mandate terlebih dahulu (Minimal 2 menara lengkap, salah satunya di Shared Area).';
        mustikaLockHint.style.color = 'var(--text-secondary)';
      }
    }
  }

  // 2. Tally Sub-Points & Total Points
  const trPoints = scoreState.transfer_blocks * 5;
  const l1Points = (scoreState.l1_earth_bottom * 10) + (scoreState.l1_earth_mid * 20) + (scoreState.l1_sky_top * 40);
  const l2Points = (scoreState.l2_earth_bottom * 20) + (scoreState.l2_earth_mid * 40) + (scoreState.l2_sky_top * 80);
  const mustikaPoints = scoreState.mustika_enshrined ? 250 : 0;

  const grandTotal = trPoints + l1Points + l2Points + mustikaPoints;

  if (liveTotalScoreEl) liveTotalScoreEl.textContent = grandTotal;
  if (subTrPtsEl) subTrPtsEl.textContent = trPoints + ' pt';
  if (subL1PtsEl) subL1PtsEl.textContent = l1Points + ' pt';
  if (subL2PtsEl) subL2PtsEl.textContent = l2Points + ' pt';
  if (subMustikaPtsEl) subMustikaPtsEl.textContent = mustikaPoints + ' pt';
}

window.toggleMustikaEnshrinement = function() {
  const l1Towers = Math.min(scoreState.l1_earth_bottom, scoreState.l1_earth_mid, scoreState.l1_sky_top);
  const l2Towers = Math.min(scoreState.l2_earth_bottom, scoreState.l2_earth_mid, scoreState.l2_sky_top);
  const isMandateReady = (l1Towers + l2Towers >= 2) && (l2Towers >= 1);

  if (!isMandateReady) {
    playSpecificSound('error');
    showToast('⚠️ DILARANG: Sanctuary Mandate belum terpenuhi! Bangun menara dahulu.');
    return;
  }

  scoreState.mustika_enshrined = !scoreState.mustika_enshrined;
  if (scoreState.mustika_enshrined) {
    playSpecificSound('victory');
    showToast('🏆 Mustika Nusantara Berhasil Disemayamkan! +250 Poin');
  } else {
    playSpecificSound('relay');
    showToast('Mustika dilepas dari Central Pillar.');
  }

  evaluateScoringEngine();
};

window.resetCalculatorScore = function() {
  playSpecificSound('whistle');
  Object.keys(scoreState).forEach(k => {
    scoreState[k] = (k === 'mustika_enshrined') ? false : 0;
  });

  ['val-transfer-blocks', 'val-l1-bottom', 'val-l1-mid', 'val-l1-sky', 'val-l2-bottom', 'val-l2-mid', 'val-l2-sky'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '0';
  });

  evaluateScoringEngine();
  showToast('🔄 Kalkulator Skor di-reset ke 0.');
};

// -----------------------------------------------------------------------------
// 9. PLAYABLE MINI-GAME: MUSTIKA ARENA QUEST (CANVAS 2D)
// -----------------------------------------------------------------------------
const gameCanvas = document.getElementById('mustika-game-canvas');
const gameCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
const gameScoreEl = document.getElementById('game-score');
const gameTimerEl = document.getElementById('game-timer');
const gameHighScoreEl = document.getElementById('game-high-score');
const gameOverlay = document.getElementById('game-overlay');
const gameOverlayTitle = document.getElementById('game-overlay-title');
const gameOverlayDesc = document.getElementById('game-overlay-desc');

let isGameActive = false;
let gameSecondsLeft = 90;
let currentScore = 0;
let gameIntervalTimer = null;
let savedHighScore = parseInt(localStorage.getItem('mustika_high_score') || '0', 10);
if (gameHighScoreEl) gameHighScoreEl.textContent = savedHighScore;

// Game Entities: Player Robot & Arena Items
const arenaPlayer = {
  x: 100,
  y: 300,
  radius: 18,
  speed: 4,
  boost: 1,
  carriedBlocks: 0,
  maxCarry: 3
};

let arenaBlocks = [];
let arenaTowers = [];
let gameKeys = {};

function spawnArenaGameItems() {
  arenaBlocks = [];
  // Spawn 6 Earth Blocks in Storage Area (left top)
  for (let i = 0; i < 5; i++) {
    arenaBlocks.push({
      x: 40 + Math.random() * 100,
      y: 40 + Math.random() * 100,
      type: 'earth',
      size: 20
    });
  }
  // Spawn 3 Sky Blocks in Shared Area (bottom center)
  for (let i = 0; i < 3; i++) {
    arenaBlocks.push({
      x: 270 + Math.random() * 100,
      y: 280 + Math.random() * 70,
      type: 'sky',
      size: 16
    });
  }
}

window.startMustikaGame = function() {
  playSpecificSound('whistle');
  if (gameOverlay) gameOverlay.classList.add('hidden');

  currentScore = 0;
  gameSecondsLeft = 90;
  arenaPlayer.x = 80;
  arenaPlayer.y = 320;
  arenaPlayer.carriedBlocks = 0;
  arenaPlayer.boost = 1;

  spawnArenaGameItems();
  isGameActive = true;

  if (gameScoreEl) gameScoreEl.textContent = currentScore;
  if (gameTimerEl) gameTimerEl.textContent = gameSecondsLeft + 's';

  clearInterval(gameIntervalTimer);
  gameIntervalTimer = setInterval(() => {
    if (isGameActive) {
      gameSecondsLeft--;
      if (gameTimerEl) gameTimerEl.textContent = gameSecondsLeft + 's';
      if (gameSecondsLeft <= 0) {
        endMustikaGame();
      }
    }
  }, 1000);

  showToast('🎮 Pertandingan 90 Detik Dimulai! Ambil blok di storage!');
  requestAnimationFrame(mustikaGameLoop);
};

window.triggerGameBoost = function() {
  if (!isGameActive) return;
  playSpecificSound('boost');
  arenaPlayer.boost = 1.9;
  showToast('⚡ BOOST KECEPATAN AKTIF!');
  setTimeout(() => { arenaPlayer.boost = 1; }, 1800);
};

// Keyboard inputs
window.addEventListener('keydown', (e) => {
  gameKeys[e.key.toLowerCase()] = true;
  if (e.key === ' ' && isGameActive) {
    e.preventDefault();
    triggerGameBoost();
  }
});

window.addEventListener('keyup', (e) => {
  gameKeys[e.key.toLowerCase()] = false;
});

// Virtual Arcade D-Pad binding
const setupArcadeControl = (btnId, keyStr) => {
  const el = document.getElementById(btnId);
  if (!el) return;
  const press = (e) => { e.preventDefault(); gameKeys[keyStr] = true; playSpecificSound('click'); };
  const release = (e) => { e.preventDefault(); gameKeys[keyStr] = false; };
  el.addEventListener('mousedown', press);
  el.addEventListener('mouseup', release);
  el.addEventListener('mouseleave', release);
  el.addEventListener('touchstart', press, { passive: false });
  el.addEventListener('touchend', release);
};

setupArcadeControl('game-btn-up', 'arrowup');
setupArcadeControl('game-btn-down', 'arrowdown');
setupArcadeControl('game-btn-left', 'arrowleft');
setupArcadeControl('game-btn-right', 'arrowright');

function endMustikaGame() {
  isGameActive = false;
  clearInterval(gameIntervalTimer);
  playSpecificSound('whistle');

  if (currentScore > savedHighScore) {
    savedHighScore = currentScore;
    localStorage.setItem('mustika_high_score', String(savedHighScore));
    if (gameHighScoreEl) gameHighScoreEl.textContent = savedHighScore;
    playSpecificSound('victory');
    showToast('🏆 REKOR BARU ARENA ROBOCON! Skor: ' + currentScore);
  }

  if (gameOverlay) {
    gameOverlay.classList.remove('hidden');
    if (gameOverlayTitle) gameOverlayTitle.textContent = 'MATCH TIME FINISHED! (180s)';
    if (gameOverlayDesc) gameOverlayDesc.textContent = `Laga 90 detik selesai. Total raihan skor tim Anda: ${currentScore} Poin! High score tersimpan: ${savedHighScore}`;
  }
}

function mustikaGameLoop() {
  if (!isGameActive || !gameCtx || !gameCanvas) return;

  // Input calculation
  let mx = 0;
  let my = 0;
  if (gameKeys['arrowup'] || gameKeys['w']) my -= 1;
  if (gameKeys['arrowdown'] || gameKeys['s']) my += 1;
  if (gameKeys['arrowleft'] || gameKeys['a']) mx -= 1;
  if (gameKeys['arrowright'] || gameKeys['d']) mx += 1;

  if (mx !== 0 && my !== 0) {
    mx *= 0.7071;
    my *= 0.7071;
  }

  const speed = arenaPlayer.speed * arenaPlayer.boost;
  arenaPlayer.x += mx * speed;
  arenaPlayer.y += my * speed;

  // Boundary
  arenaPlayer.x = Math.max(arenaPlayer.radius, Math.min(gameCanvas.width - arenaPlayer.radius, arenaPlayer.x));
  arenaPlayer.y = Math.max(arenaPlayer.radius, Math.min(gameCanvas.height - arenaPlayer.radius, arenaPlayer.y));

  // Render Arena Map
  gameCtx.fillStyle = '#080e18';
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Storage Area (Top Left)
  gameCtx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  gameCtx.fillRect(20, 20, 160, 100);
  gameCtx.strokeStyle = '#ef4444';
  gameCtx.strokeRect(20, 20, 160, 100);
  gameCtx.fillStyle = '#f87171';
  gameCtx.font = '10px monospace';
  gameCtx.fillText('STORAGE AREA', 30, 40);

  // Transfer Area (Center Left)
  gameCtx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  gameCtx.fillRect(220, 120, 90, 90);
  gameCtx.strokeStyle = '#f59e0b';
  gameCtx.strokeRect(220, 120, 90, 90);
  gameCtx.fillStyle = '#fbbf24';
  gameCtx.fillText('TRANSFER AREA', 225, 140);

  // Level 1 Platform Area (Center)
  gameCtx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  gameCtx.fillRect(340, 70, 260, 240);
  gameCtx.strokeStyle = '#38bdf8';
  gameCtx.strokeRect(340, 70, 260, 240);
  gameCtx.fillStyle = '#38bdf8';
  gameCtx.fillText('LEVEL 1 & 2 ARENA', 350, 90);

  // Central Pillar
  gameCtx.beginPath();
  gameCtx.arc(470, 190, 24, 0, Math.PI * 2);
  gameCtx.fillStyle = '#d97706';
  gameCtx.fill();
  gameCtx.strokeStyle = '#fde68a';
  gameCtx.lineWidth = 2;
  gameCtx.stroke();
  gameCtx.fillStyle = '#fff';
  gameCtx.fillText('CENTRAL', 450, 194);

  // Handle Blocks Pickup
  for (let i = arenaBlocks.length - 1; i >= 0; i--) {
    const b = arenaBlocks[i];
    gameCtx.fillStyle = (b.type === 'earth') ? '#b45309' : '#38bdf8';
    gameCtx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
    gameCtx.strokeStyle = '#fff';
    gameCtx.lineWidth = 1;
    gameCtx.strokeRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);

    // Collision with Player
    const dist = Math.hypot(arenaPlayer.x - b.x, arenaPlayer.y - b.y);
    if (dist < arenaPlayer.radius + b.size / 2 && arenaPlayer.carriedBlocks < arenaPlayer.maxCarry) {
      arenaPlayer.carriedBlocks++;
      playSpecificSound('motor');
      arenaBlocks.splice(i, 1);
      showToast(`📦 Robot membawa ${arenaPlayer.carriedBlocks}/3 blok! Antar ke Transfer Area.`);
    }
  }

  // Check Drop off in Transfer Area
  const inTransfer = (arenaPlayer.x > 220 && arenaPlayer.x < 310 && arenaPlayer.y > 120 && arenaPlayer.y < 210);
  if (inTransfer && arenaPlayer.carriedBlocks > 0) {
    const gained = arenaPlayer.carriedBlocks * 15;
    currentScore += gained;
    arenaPlayer.carriedBlocks = 0;
    playSpecificSound('coin');
    if (gameScoreEl) gameScoreEl.textContent = currentScore;
    showToast(`✓ Logistik sukses diantar ke Transfer Area! +${gained} Poin`);

    // Respawn blocks
    spawnArenaGameItems();
  }

  // Draw Player Robot (TR / BR)
  gameCtx.save();
  gameCtx.translate(arenaPlayer.x, arenaPlayer.y);

  // Aura
  gameCtx.beginPath();
  gameCtx.arc(0, 0, arenaPlayer.radius + 5, 0, Math.PI * 2);
  gameCtx.fillStyle = 'rgba(56, 189, 248, 0.25)';
  gameCtx.fill();

  // Robot Body
  gameCtx.beginPath();
  gameCtx.arc(0, 0, arenaPlayer.radius, 0, Math.PI * 2);
  gameCtx.fillStyle = '#1e293b';
  gameCtx.fill();
  gameCtx.strokeStyle = '#38bdf8';
  gameCtx.lineWidth = 3;
  gameCtx.stroke();

  // Robot Cargo indicator
  if (arenaPlayer.carriedBlocks > 0) {
    gameCtx.fillStyle = '#f59e0b';
    gameCtx.fillRect(-6, -6, 12, 12);
  }

  gameCtx.restore();

  requestAnimationFrame(mustikaGameLoop);
}

// -----------------------------------------------------------------------------
// 10. OBJECT SPECS & ROBOT ROLE MODALS
// -----------------------------------------------------------------------------
const objectModal = document.getElementById('object-modal');
const objModalBadge = document.getElementById('obj-modal-badge');
const objModalTitle = document.getElementById('obj-modal-title');
const objModalDesc = document.getElementById('obj-modal-desc');
const objModalGrid = document.getElementById('obj-modal-grid');

const objectSpecsDatabase = {
  mustika: {
    badge: 'ARTEFAK UTAMA (250 POIN)',
    title: 'Bola Mustika Nusantara',
    desc: 'Bola voli resmi Mikasa V300W Size 5 yang digunakan dalam kondisi orisinal tanpa cat tambahan. Diletakkan di Mustika Pillar dan harus disemayamkan di Central Pillar Level 2 setelah Sanctuary Mandate terpenuhi.',
    specs: [
      { key: 'Model Resmi', val: 'Mikasa V300W (FIVB Official Game Ball)' },
      { key: 'Ukuran & Keliling', val: 'Size 5 (Keliling 65 – 67 cm, Diameter ~210 mm)' },
      { key: 'Berat Resmi', val: '260 – 280 gram' },
      { key: 'Material', val: 'Kulit sintetis mikro-fiber berpori' },
      { key: 'Warna Standar', val: 'Kuning (Pantone 1235C) & Biru (Pantone 3591C)' },
      { key: 'Regulasi Serah', val: 'Direct Handover: Dilarang menyentuh lantai!' }
    ]
  },
  blocks: {
    badge: 'BLOK PENYUSUN MENARA',
    title: 'Earth Blocks & Sky Blocks',
    desc: 'Bahan pembangun Complete Tower sesuai Bab 2 dan Lampiran Rulebook.',
    specs: [
      { key: 'Earth Block (Dimensi)', val: 'Kubus 350 × 350 × 350 mm (±5%)' },
      { key: 'Earth Block (Berat)', val: 'Kira-kira 600 gram (±20%) kardus 3 lapis' },
      { key: 'Jumlah Earth Block', val: '20 unit per tim di Storage Area' },
      { key: 'Sky Block (Dimensi)', val: 'Kubus 200 × 200 × 200 mm (±5%)' },
      { key: 'Sky Block (Warna)', val: 'Merah di satu sisi, Biru di sisi sebaliknya' },
      { key: 'Sky Block (Berat)', val: 'Kira-kira 220 gram (±20%), 12 unit shared' }
    ]
  }
};

window.openObjectModal = function(type) {
  playSpecificSound('click');
  const data = objectSpecsDatabase[type] || objectSpecsDatabase['mustika'];
  if (!objectModal) return;

  objModalBadge.textContent = data.badge;
  objModalTitle.textContent = data.title;
  objModalDesc.textContent = data.desc;

  objModalGrid.innerHTML = data.specs.map(s => `
    <div class="modal-spec-item">
      <strong>${s.key}</strong>
      <span>${s.val}</span>
    </div>
  `).join('');

  objectModal.classList.add('open');
};

window.closeObjectModal = function() {
  playSpecificSound('click');
  if (objectModal) objectModal.classList.remove('open');
};

document.getElementById('btn-open-specs')?.addEventListener('click', () => openObjectModal('mustika'));

if (objectModal) {
  objectModal.addEventListener('click', (e) => {
    if (e.target === objectModal) closeObjectModal();
  });
}

// Robot Roles Modal
const robotRoleModal = document.getElementById('robot-role-modal');
const robotModalBadge = document.getElementById('robot-modal-badge');
const robotModalTitle = document.getElementById('robot-modal-title');
const robotModalDesc = document.getElementById('robot-modal-desc');
const robotModalGrid = document.getElementById('robot-modal-grid');

const robotRolesData = {
  tr: {
    badge: 'ROBOT LOGISTIK (BAB 11.2)',
    title: 'Transporter Robot (TR)',
    desc: 'Robot lincah yang beroperasi di Ground Area dan Transfer Area untuk memanen Earth Blocks dan Sky Blocks serta menyerahkan Mustika ke BR.',
    details: [
      { key: 'Metode Kendali', val: 'Manual (Operator Wi-Fi/Zigbee) atau Otomatis' },
      { key: 'Dimensi Awal', val: 'Maksimal 700 × 700 × 700 mm' },
      { key: 'Dimensi Mengembang', val: 'Maksimal 1400 × 1000 × 1200 mm' },
      { key: 'Kapasitas Angkut', val: 'Maksimal 3 blok sekaligus' },
      { key: 'Zona Larangan', val: 'DILARANG keras memasuki Level 1 selain Transfer Area!' }
    ]
  },
  br: {
    badge: 'ROBOT OTONOM ARSITEK (BAB 11.3)',
    title: 'Builder Robot (BR)',
    desc: 'Robot otonom pembuat menara dan penyemayam Mustika yang beroperasi di Transfer Area, Level 1, dan Level 2.',
    details: [
      { key: 'Metode Kendali', val: 'Wajib 100% OTONOM PENUH (Autonomous)' },
      { key: 'Dimensi Awal', val: 'Maksimal 700 × 700 × 700 mm' },
      { key: 'Dimensi Mengembang', val: 'Maksimal 1400 × 1000 × 1200 mm' },
      { key: 'Kapasitas Angkut', val: 'Maksimal 2 blok sekaligus' },
      { key: 'Fitur Darurat', val: 'Wajib tombol darurat STOP fisik & Freeze Switch remote' }
    ]
  }
};

window.showRobotRoleModal = function(role) {
  playSpecificSound('click');
  const d = robotRolesData[role];
  if (!robotRoleModal || !d) return;

  robotModalBadge.textContent = d.badge;
  robotModalTitle.textContent = d.title;
  robotModalDesc.textContent = d.desc;

  robotModalGrid.innerHTML = d.details.map(item => `
    <div class="modal-spec-item">
      <strong>${item.key}</strong>
      <span>${item.val}</span>
    </div>
  `).join('');

  robotRoleModal.classList.add('open');
};

window.closeRobotRoleModal = function() {
  playSpecificSound('click');
  if (robotRoleModal) robotRoleModal.classList.remove('open');
};

if (robotRoleModal) {
  robotRoleModal.addEventListener('click', (e) => {
    if (e.target === robotRoleModal) closeRobotRoleModal();
  });
}

// -----------------------------------------------------------------------------
// 11. COMMAND PALETTE HUD (CTRL + K)
// -----------------------------------------------------------------------------
const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');
const btnCmdPalette = document.getElementById('btn-cmd-palette');

const commands = [
  { label: '🎮 Mainkan Mini Game Mustika Quest', action: () => { window.location.hash = '#game'; startMustikaGame(); }, badge: 'GAME' },
  { label: '📊 Buka Kalkulator Skor Lomba', action: () => { window.location.hash = '#calculator'; }, badge: 'CALC' },
  { label: '🗺️ Buka Peta Lapangan 2.5D Inspector', action: () => { window.location.hash = '#field'; inspectQuickZone('central_pillar'); }, badge: 'ARENA' },
  { label: '🌓 Ganti Mode Tema (Gelap / Terang)', action: () => themeToggleBtn?.click(), badge: 'THEME' },
  { label: '🎨 Buka Selector Aksen Warna Neon', action: () => paletteMenu?.classList.toggle('open'), badge: 'STYLE' },
  { label: '📦 Cek Spesifikasi Bola Mustika & Blok', action: () => openObjectModal('mustika'), badge: 'OBJECTS' },
  { label: '🚜 Cek Regulasi Transporter Robot (TR)', action: () => showRobotRoleModal('tr'), badge: 'RULES' },
  { label: '🤖 Cek Regulasi Builder Robot (BR)', action: () => showRobotRoleModal('br'), badge: 'RULES' },
  { label: '🎺 Uji Bunyi Peluit / Buzzer Lomba', action: () => playSpecificSound('whistle'), badge: 'SOUND' },
  { label: '🏆 Bunyikan Fanfare Kemenangan Mustika', action: () => playSpecificSound('victory'), badge: 'SOUND' }
];

function renderCommands(filter = '') {
  if (!cmdList) return;
  const filtered = commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()));
  cmdList.innerHTML = filtered.map((c, i) => `
    <div class="cmd-item" data-index="${i}">
      <span>${c.label}</span>
      <span class="cmd-badge">${c.badge}</span>
    </div>
  `).join('');

  cmdList.querySelectorAll('.cmd-item').forEach((el, idx) => {
    el.addEventListener('click', () => {
      filtered[idx].action();
      closeCmdPalette();
    });
  });
}

function openCmdPalette() {
  playSpecificSound('lidar');
  if (cmdPalette) {
    cmdPalette.classList.add('open');
    cmdPalette.setAttribute('aria-hidden', 'false');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
      renderCommands('');
    }
  }
}

function closeCmdPalette() {
  if (cmdPalette) {
    cmdPalette.classList.remove('open');
    cmdPalette.setAttribute('aria-hidden', 'true');
  }
}

if (btnCmdPalette) btnCmdPalette.addEventListener('click', openCmdPalette);

if (cmdInput) {
  cmdInput.addEventListener('input', () => renderCommands(cmdInput.value));
}

if (cmdPalette) {
  cmdPalette.addEventListener('click', (e) => {
    if (e.target === cmdPalette) closeCmdPalette();
  });
}

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (cmdPalette && cmdPalette.classList.contains('open')) {
      closeCmdPalette();
    } else {
      openCmdPalette();
    }
  } else if (e.key === 'Escape') {
    closeCmdPalette();
    closeObjectModal();
    closeRobotRoleModal();
  }
});

// -----------------------------------------------------------------------------
// 12. FLOATING DOCK: BACK TO TOP BUTTON
// -----------------------------------------------------------------------------
const backToTopBtn = document.getElementById('btn-back-to-top');

window.addEventListener('scroll', () => {
  if (backToTopBtn) {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
}, { passive: true });

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    playSpecificSound('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// -----------------------------------------------------------------------------
// 13. DESKTOP CURSOR GLOW
// -----------------------------------------------------------------------------
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow) {
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }, { passive: true });
  } else {
    cursorGlow.remove();
  }
}

// Initialize on load
evaluateScoringEngine();
inspectQuickZone('central_pillar');
