document.addEventListener('DOMContentLoaded', () => {

  const state = {
    fontSize:      26,
    maxWidth:      98,
    letterSpacing: 0,
    fontColor:     '#D96B6B',
    bgColor:       '#8B0000',
    bgOpacity:     88,
    position:      'bottom',
    font:          'Manrope',
    speakerLabels: true,
    originalText:  true,
    highContrast:  false,
    autoScroll:    true,
    wordByWord:    false,
  };

  const DEFAULTS = { ...state };

  /* --- ELEMENTS --- */
  const liveSubtitle     = document.getElementById('liveSubtitle');
  const liveSubtitleText = document.getElementById('liveSubtitleText');
  const sizePreview      = document.getElementById('sizePreview');
  const maxWidthVal      = document.getElementById('maxWidthVal');
  const letterSpacingVal = document.getElementById('letterSpacingVal');
  const opacityVal       = document.getElementById('opacityVal');
  const fontSlider       = document.getElementById('fontSizeSlider');
  const maxWidthSlider   = document.getElementById('maxWidthSlider');
  const letterSlider     = document.getElementById('letterSpacingSlider');
  const opacitySlider    = document.getElementById('bgOpacitySlider');
  const fontSelect       = document.getElementById('fontSelect');
  const positionSelect   = document.getElementById('positionSelect');
  const textColorPreview = document.getElementById('textColorPreview');
  const bgColorPreview   = document.getElementById('bgColorPreview');

  /* --- CYCLING SUBTITLE TEXT --- */
  const subtitleLines = [
    '"The quick brown fox jumps over the lazy dog."',
    '"We need to finalize the project planning by next week."',
    '"スケーラビリティのニーズを考慮するとなおさらです。"',
    '"Can we revisit the load balancer configuration?"',
  ];
  let lineIdx = 0;

  setInterval(() => {
    if (!liveSubtitleText) return;
    liveSubtitleText.style.opacity = '0';
    setTimeout(() => {
      lineIdx = (lineIdx + 1) % subtitleLines.length;
      liveSubtitleText.textContent = subtitleLines[lineIdx];
      liveSubtitleText.style.transition = 'opacity 0.5s';
      liveSubtitleText.style.opacity = '1';
    }, 400);
  }, 3500);

  /* --- APPLY STATE TO PREVIEW --- */
  function applyPreview() {
    if (!liveSubtitle || !liveSubtitleText) return;

    // High contrast override
    if (state.highContrast) {
      liveSubtitle.style.background = '#000';
      liveSubtitleText.style.color = '#ffff00';
    } else {
      // Apply bg color with opacity
      const bg = state.bgColor;
      if (bg === 'transparent') {
        liveSubtitle.style.background = 'transparent';
      } else {
        // Convert hex to rgba with opacity
        const hex = bg.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0,2), 16);
          const g = parseInt(hex.substring(2,4), 16);
          const b = parseInt(hex.substring(4,6), 16);
          liveSubtitle.style.background = `rgba(${r},${g},${b},${state.bgOpacity/100})`;
        } else {
          liveSubtitle.style.background = bg;
        }
      }
      liveSubtitleText.style.color = state.fontColor;
    }

    // Font
    liveSubtitleText.style.fontSize      = state.fontSize + 'px';
    liveSubtitleText.style.fontFamily    = `'${state.font}', sans-serif`;
    liveSubtitleText.style.letterSpacing = state.letterSpacing + 'px';
    liveSubtitleText.style.maxWidth      = state.maxWidth + '%';

    // Position
    liveSubtitle.className = 'live-subtitle';
    if (state.position === 'top')      liveSubtitle.classList.add('pos-top');
    if (state.position === 'floating') liveSubtitle.classList.add('pos-floating');

    // Update display values
    if (sizePreview)      sizePreview.textContent      = state.fontSize + 'px';
    if (maxWidthVal)      maxWidthVal.textContent      = state.maxWidth + '%';
    if (letterSpacingVal) letterSpacingVal.textContent = state.letterSpacing + 'px';
    if (opacityVal)       opacityVal.textContent       = state.bgOpacity + '%';

    // Update color previews
    if (textColorPreview) textColorPreview.style.background = state.fontColor;
    if (bgColorPreview)   bgColorPreview.style.background   = state.bgColor;
  }

  /* --- FONT SIZE SLIDER --- */
  fontSlider?.addEventListener('input', () => {
    state.fontSize = +fontSlider.value;
    applyPreview();
  });

  /* --- MAX WIDTH SLIDER --- */
  maxWidthSlider?.addEventListener('input', () => {
    state.maxWidth = +maxWidthSlider.value;
    applyPreview();
  });

  /* --- LETTER SPACING SLIDER --- */
  letterSlider?.addEventListener('input', () => {
    state.letterSpacing = +letterSlider.value;
    applyPreview();
  });

  /* --- OPACITY SLIDER --- */
  opacitySlider?.addEventListener('input', () => {
    state.bgOpacity = +opacitySlider.value;
    applyPreview();
  });

  /* --- FONT SELECT --- */
  fontSelect?.addEventListener('change', () => {
    state.font = fontSelect.value;
    applyPreview();
  });

  /* --- POSITION SELECT --- */
  positionSelect?.addEventListener('change', () => {
    state.position = positionSelect.value;
    applyPreview();
  });

  /* --- FONT COLOR PICKER --- */
  document.getElementById('fontColorCustomInput')?.addEventListener('input', e => {
  state.fontColor = e.target.value;
  if (textColorPreview) textColorPreview.style.background = state.fontColor;
  applyPreview();
});

  /* --- BG COLOR PICKER --- */
  document.getElementById('bgColorCustomInput')?.addEventListener('input', e => {
  state.bgColor = e.target.value;
  if (bgColorPreview) bgColorPreview.style.background = state.bgColor;
  applyPreview();
});

  /* --- FONT COLOR SWATCHES (hidden but kept for JS) --- */
  document.querySelectorAll('#fontColorGroup .color-swatch[data-color]').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('#fontColorGroup .color-swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
      state.fontColor = sw.dataset.color;
      if (textColorPreview) textColorPreview.style.background = state.fontColor;
      applyPreview();
    });
  });

  /* --- BG COLOR SWATCHES (hidden but kept for JS) --- */
  document.querySelectorAll('#bgColorGroup .color-swatch[data-color]').forEach(sw => {
    sw.addEventListener('click', () => {
      document.querySelectorAll('#bgColorGroup .color-swatch').forEach(s => s.classList.remove('sel'));
      sw.classList.add('sel');
      state.bgColor = sw.dataset.color;
      if (bgColorPreview) bgColorPreview.style.background = state.bgColor;
      applyPreview();
    });
  });

  /* --- PRESETS --- */
  const PRESETS = {
    cinema: { fontSize: 28, fontColor: '#ffffff', bgColor: 'rgba(0,0,0,0.9)',   bgOpacity: 90, font: 'Sora',    letterSpacing: 0 },
    soft:   { fontSize: 20, fontColor: '#f0f0f0', bgColor: 'rgba(30,30,60,0.7)',bgOpacity: 70, font: 'DM Sans', letterSpacing: 0 },
    brand:  { fontSize: 24, fontColor: '#1d8fe8', bgColor: 'rgba(0,0,0,0.85)', bgOpacity: 85, font: 'Sora',    letterSpacing: 1 },
    large:  { fontSize: 36, fontColor: '#ffffff', bgColor: 'rgba(0,0,0,0.88)', bgOpacity: 88, font: 'Manrope', letterSpacing: 0 },
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = PRESETS[btn.dataset.preset];
      if (!preset) return;
      Object.assign(state, preset);

      // Update slider values
      if (fontSlider)     fontSlider.value     = state.fontSize;
      if (opacitySlider)  opacitySlider.value  = state.bgOpacity;
      if (letterSlider)   letterSlider.value   = state.letterSpacing;
      if (fontSelect)     fontSelect.value     = state.font;

      applyPreview();
      showToast(`✓ Preset "${btn.dataset.preset}" applied`);
    });
  });

  /* --- TOGGLE ROWS --- */
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

  bindToggle('toggleHighContrast',  'highContrast');
  bindToggle('toggleSpeakerLabels', 'speakerLabels');
  bindToggle('toggleOrigText',      'originalText');
  bindToggle('toggleAutoScroll',    'autoScroll');
  bindToggle('toggleWordByWord',    'wordByWord');

  /* --- RESET --- */
  document.getElementById('resetDefaultBtn')?.addEventListener('click', () => {
    Object.assign(state, DEFAULTS);
    if (fontSlider)     fontSlider.value     = DEFAULTS.fontSize;
    if (maxWidthSlider) maxWidthSlider.value = DEFAULTS.maxWidth;
    if (letterSlider)   letterSlider.value   = DEFAULTS.letterSpacing;
    if (opacitySlider)  opacitySlider.value  = DEFAULTS.bgOpacity;
    if (fontSelect)     fontSelect.value     = DEFAULTS.font;
    if (positionSelect) positionSelect.value = DEFAULTS.position;

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    ['toggleHighContrast','toggleSpeakerLabels','toggleOrigText','toggleAutoScroll','toggleWordByWord'].forEach(id => {
      const row = document.getElementById(id);
      const sw  = row?.querySelector('.toggle-switch');
      const key = row?.dataset.stateKey;
      if (sw && key) sw.classList.toggle('off', !DEFAULTS[key]);
    });

    applyPreview();
    showToast('✓ Settings reset to defaults');
  });

  /* --- SAVE --- */
  const saveBtn = document.getElementById('saveCapBtn');
  saveBtn?.addEventListener('click', () => {
    sessionStorage.setItem('captionSettings', JSON.stringify(state));
    saveBtn.textContent = '✓ Saved!';
    saveBtn.classList.add('saved');
    setTimeout(() => {
      saveBtn.textContent = 'Save';
      saveBtn.classList.remove('saved');
    }, 2200);
    showToast('✓ Caption settings saved');
    fetch('http://localhost:3000/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'captions', data: state })
    }).catch(() => {});
  });

  /* --- KEYBOARD SHORTCUTS --- */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveBtn?.click(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); document.getElementById('resetDefaultBtn')?.click(); }
  });

  /* --- INIT --- */
  if (fontSlider)     fontSlider.value     = state.fontSize;
  if (maxWidthSlider) maxWidthSlider.value = state.maxWidth;
  if (letterSlider)   letterSlider.value   = state.letterSpacing;
  if (opacitySlider)  opacitySlider.value  = state.bgOpacity;
  applyPreview();

});