

document.addEventListener('DOMContentLoaded', () => {

 
  const state = {
    fontSize: 18,
    fontColor: '#ffffff',
    bgColor: 'rgba(15,15,15,0.88)',
    bgOpacity: 88,
    position: 'bottom',
    bold: false,
    italic: false,
    shadow: true,
    outline: false,
    speakerLabels: true,
    originalText: true,
    highContrast: false,
    autoScroll: true,
    wordByWord: false,
  };

  const DEFAULTS = { ...state };

  /* ─────────────────────────────────────
     PREVIEW SUBTITLE TEXT
  ───────────────────────────────────── */
  const subtitleLines = [
    '"We need to finalize the project planning by next week."',
    '"The throughput metrics look very promising."',
    '"スケーラビリティのニーズを考慮するとなおさらです。"',
    '"Can we revisit the load balancer configuration?"',
  ];
  let lineIdx = 0;
  const liveSubtitle = document.getElementById('liveSubtitle');
  const liveSubtitleText = document.getElementById('liveSubtitleText');

  function cycleSubtitle() {
    if (!liveSubtitleText) return;
    liveSubtitleText.style.opacity = '0';
    setTimeout(() => {
      lineIdx = (lineIdx + 1) % subtitleLines.length;
      liveSubtitleText.textContent = subtitleLines[lineIdx];
      liveSubtitleText.style.transition = 'opacity 0.5s';
      liveSubtitleText.style.opacity = '1';
    }, 400);
  }
  setInterval(cycleSubtitle, 3500);

  /* ─────────────────────────────────────
     APPLY STATE TO PREVIEW
  ───────────────────────────────────── */
  function applyPreview() {
    if (!liveSubtitle || !liveSubtitleText) return;

    // Background
    const [r, g, b] = hexToRgb(state.fontColor === '#ffffff' ? state.bgColor : state.bgColor);
    liveSubtitle.style.background = state.bgColor === 'transparent'
      ? 'transparent'
      : `rgba(${r},${g},${b},${state.bgOpacity / 100})`;

    // Text style
    liveSubtitleText.style.color = state.fontColor;
    liveSubtitleText.style.fontSize = state.fontSize + 'px';
    liveSubtitleText.style.fontWeight = state.bold ? '800' : '700';
    liveSubtitleText.style.fontStyle  = state.italic ? 'italic' : 'normal';
    liveSubtitleText.style.textShadow = state.shadow
      ? '0 2px 8px rgba(0,0,0,0.7)'
      : state.highContrast ? '0 0 0 2px #000, 0 0 0 4px #000' : 'none';
    liveSubtitleText.style.webkitTextStroke = state.outline ? '1px rgba(0,0,0,0.8)' : '';

    // High contrast override
    if (state.highContrast) {
      liveSubtitle.style.background = '#000';
      liveSubtitleText.style.color = '#ffff00';
    }

    // Position
    liveSubtitle.className = 'live-subtitle';
    if (state.position === 'top') liveSubtitle.classList.add('pos-top');
    if (state.position === 'floating') liveSubtitle.classList.add('pos-floating');

    // Font size indicator
    const sizePreview = document.getElementById('sizePreview');
    if (sizePreview) {
      sizePreview.textContent = state.fontSize + 'px';
      sizePreview.style.fontSize = Math.min(state.fontSize, 22) + 'px';
    }

    // Opacity indicator
    const opacityVal = document.getElementById('opacityVal');
    if (opacityVal) opacityVal.textContent = state.bgOpacity + '%';
  }

  function hexToRgb(input) {
    // Handles rgba(...) strings and hex
    const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return [+m[1], +m[2], +m[3]];
    const hex = input.replace('#', '');
    return [
      parseInt(hex.substring(0,2), 16),
      parseInt(hex.substring(2,4), 16),
      parseInt(hex.substring(4,6), 16),
    ];
  }

  /* ─────────────────────────────────────
     FONT SIZE SLIDER
  ───────────────────────────────────── */
  const fontSlider = document.getElementById('fontSizeSlider');
  fontSlider?.addEventListener('input', () => {
    state.fontSize = +fontSlider.value;
    applyPreview();
  });

  /* ─────────────────────────────────────
     FONT STYLE BUTTONS
  ───────────────────────────────────── */
  document.getElementById('boldBtn')?.addEventListener('click', function() {
    state.bold = !state.bold;
    this.classList.toggle('active', state.bold);
    applyPreview();
  });
  document.getElementById('italicBtn')?.addEventListener('click', function() {
    state.italic = !state.italic;
    this.classList.toggle('active', state.italic);
    applyPreview();
  });
  document.getElementById('shadowBtn')?.addEventListener('click', function() {
    state.shadow = !state.shadow;
    this.classList.toggle('active', state.shadow);
    applyPreview();
  });
  document.getElementById('outlineBtn')?.addEventListener('click', function() {
    state.outline = !state.outline;
    this.classList.toggle('active', state.outline);
    applyPreview();
  });

  /* ─────────────────────────────────────
     FONT COLOR SWATCHES
  ───────────────────────────────────── */
  document.querySelectorAll('#fontColorGroup .color-swatch[data-color]').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('#fontColorGroup .color-swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
      state.fontColor = sw.dataset.color;
      applyPreview();
    });
  });
  document.getElementById('fontColorCustomInput')?.addEventListener('input', e => {
    state.fontColor = e.target.value;
    applyPreview();
  });

  /* ─────────────────────────────────────
     BG COLOR SWATCHES
  ───────────────────────────────────── */
  document.querySelectorAll('#bgColorGroup .color-swatch[data-color]').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('#bgColorGroup .color-swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
      state.bgColor = sw.dataset.color;
      applyPreview();
    });
  });
  document.getElementById('bgColorCustomInput')?.addEventListener('input', e => {
    state.bgColor = e.target.value;
    applyPreview();
  });

  /* ─────────────────────────────────────
     BACKGROUND OPACITY SLIDER
  ───────────────────────────────────── */
  const opacitySlider = document.getElementById('bgOpacitySlider');
  opacitySlider?.addEventListener('input', () => {
    state.bgOpacity = +opacitySlider.value;
    applyPreview();
  });

  /* ─────────────────────────────────────
     SUBTITLE POSITION
  ───────────────────────────────────── */
  document.querySelectorAll('.position-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      state.position = btn.dataset.pos;
      applyPreview();
    });
  });

  /* ─────────────────────────────────────
     TOGGLE ROWS
  ───────────────────────────────────── */
  function bindToggle(rowId, stateKey) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const sw = row.querySelector('.toggle-switch');
    if (state[stateKey]) sw?.classList.remove('off');
    else sw?.classList.add('off');
    row.addEventListener('click', () => {
      state[stateKey] = !state[stateKey];
      sw?.classList.toggle('off', !state[stateKey]);
      if (stateKey === 'highContrast') applyPreview();
    });
  }

  bindToggle('toggleHighContrast', 'highContrast');
  bindToggle('toggleSpeakerLabels', 'speakerLabels');
  bindToggle('toggleOrigText', 'originalText');
  bindToggle('toggleAutoScroll', 'autoScroll');
  bindToggle('toggleWordByWord', 'wordByWord');

  /* ─────────────────────────────────────
     RESET TO DEFAULTS
  ───────────────────────────────────── */
  document.getElementById('resetDefaultBtn')?.addEventListener('click', () => {
    Object.assign(state, DEFAULTS);

    // Reset slider values
    if (fontSlider) fontSlider.value = DEFAULTS.fontSize;
    if (opacitySlider) opacitySlider.value = DEFAULTS.bgOpacity;

    // Reset swatches
    document.querySelectorAll('#fontColorGroup .color-swatch').forEach((s, i) => s.classList.toggle('sel', i === 0));
    document.querySelectorAll('#bgColorGroup .color-swatch').forEach((s, i) => s.classList.toggle('sel', i === 0));

    // Reset position
    document.querySelectorAll('.position-btn').forEach(b => b.classList.toggle('sel', b.dataset.pos === 'bottom'));

    // Reset style buttons
    ['boldBtn','italicBtn','outlineBtn'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.getElementById('shadowBtn')?.classList.add('active');

    // Reset toggles
    ['toggleHighContrast','toggleSpeakerLabels','toggleOrigText','toggleAutoScroll','toggleWordByWord'].forEach(id => {
      const row = document.getElementById(id);
      const sw = row?.querySelector('.toggle-switch');
      const key = row?.dataset.stateKey;
      if (sw) sw.classList.toggle('off', !DEFAULTS[key]);
    });

    applyPreview();
    showToast('✓ Settings reset to defaults');
  });

  /* ─────────────────────────────────────
     SAVE SETTINGS
  ───────────────────────────────────── */
  const saveBtn = document.getElementById('saveCapBtn');
  saveBtn?.addEventListener('click', () => {
    // Persist to localStorage-like via sessionStorage
    sessionStorage.setItem('captionSettings', JSON.stringify(state));

    saveBtn.textContent = '✓ Saved!';
    saveBtn.classList.add('saved');
    setTimeout(() => {
      saveBtn.textContent = 'Save Settings';
      saveBtn.classList.remove('saved');
    }, 2200);

    showToast('✓ Caption settings saved successfully');
  });

  /* ─────────────────────────────────────
     CANCEL → GO BACK
  ───────────────────────────────────── */
  document.getElementById('cancelCapBtn')?.addEventListener('click', () => {
    history.back();
  });

  /* ─────────────────────────────────────
     KEYBOARD SHORTCUTS
  ───────────────────────────────────── */
  document.addEventListener('keydown', e => {
    // Ctrl/Cmd + S → Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveBtn?.click();
    }
    // Ctrl/Cmd + Z → Reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      document.getElementById('resetDefaultBtn')?.click();
    }
  });

  /* ─────────────────────────────────────
     INITIAL RENDER
  ───────────────────────────────────── */
  // Pre-tick active defaults
  document.getElementById('shadowBtn')?.classList.add('active');
  // Set slider initial values
  if (fontSlider) fontSlider.value = state.fontSize;
  if (opacitySlider) opacitySlider.value = state.bgOpacity;

  applyPreview();
});