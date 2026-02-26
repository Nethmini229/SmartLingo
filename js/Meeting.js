
document.addEventListener('DOMContentLoaded', () => {

  /* ---- STATE ---- */
  let isPaused   = false;
  let isMuted    = false;
  let uttIdx     = 0;
  let dataUsage  = 1.2;

  const UTTERANCES = [
    { spk:'Speaker 2', time:'14:02:45', orig:'"The throughput metrics look very promising based on last quarter\'s data."', trans:'スループットの指標は、前四半期のデータに基づくと、非常に有望です。' },
    { spk:'Speaker 1', time:'14:03:02', orig:'"Agreed. Let\'s schedule a deep dive with the engineering team next week."', trans:'同意します。来週、エンジニアリングチームとのディープダイブを予定しましょう。' },
    { spk:'Speaker 2', time:'14:03:18', orig:'"I\'ll also prepare a scalability report for the board presentation."', trans:'取締役会のプレゼンのために、スケーラビリティレポートも準備します。' },
    { spk:'Speaker 1', time:'14:03:35', orig:'"Perfect. Can we revisit the load balancer configuration before then?"', trans:'完璧です。その前にロードバランサの設定を見直すことはできますか？' },
    { spk:'Speaker 2', time:'14:03:55', orig:'"Yes, I\'ll coordinate with Robert on the infrastructure review."', trans:'はい、インフラのレビューについてロバートと調整します。' },
  ];

  /* ---- TRANSCRIPT ---- */
  const transcriptArea = document.getElementById('transcriptArea');

  function addUtterance() {
    if (isPaused || uttIdx >= UTTERANCES.length) return;
    const u = UTTERANCES[uttIdx++];
    const showOrig = !document.getElementById('origTextToggle')?.classList.contains('off');
    // Deactivate previous active
    document.querySelector('.active-utt')?.classList.remove('active-utt');
    document.querySelector('.spk-dot')?.remove();

    const div = document.createElement('div');
    div.className = 'utterance active-utt';
    div.innerHTML = `
      <div class="utterance-meta"><span class="spk-dot"></span>${u.spk} &bull; ${u.time}</div>
      ${showOrig ? `<div class="utterance-orig">${u.orig}</div>` : ''}
      <div class="utterance-trans">${u.trans}</div>`;
    transcriptArea?.appendChild(div);
    if (transcriptArea) transcriptArea.scrollTop = transcriptArea.scrollHeight;
  }

  setInterval(addUtterance, 5000);

  /* ---- LATENCY JITTER ---- */
  setInterval(() => {
    const lat = 110 + Math.floor(Math.random() * 40);
    const el = document.getElementById('latencyStat');
    if (el) { el.textContent = lat + 'ms'; el.style.color = lat < 140 ? 'var(--green)' : 'var(--orange)'; }
  }, 3000);

  /* ---- DATA USAGE ---- */
  setInterval(() => {
    dataUsage += 0.1 + Math.random() * 0.1;
    const el = document.getElementById('dataStat');
    if (el) el.textContent = dataUsage.toFixed(1) + ' MB / min';
  }, 4000);

  /* ---- PAUSE / RESUME ---- */
  document.getElementById('pauseBtn')?.addEventListener('click', () => {
    isPaused = !isPaused;
    const pill = document.getElementById('audioPill');
    const icon = document.getElementById('pauseIcon');
    pill?.classList.toggle('audio-paused', isPaused);
    if (icon) icon.textContent = isPaused ? 'play_arrow' : 'pause';
  });

  /* ---- MIC MUTE ---- */
  document.getElementById('micBtn')?.addEventListener('click', () => {
    isMuted = !isMuted;
    const btn  = document.getElementById('micBtn');
    const icon = document.getElementById('micIcon');
    btn?.classList.toggle('muted', isMuted);
    if (icon) icon.textContent = isMuted ? 'mic_off' : 'mic';
    showToast(isMuted ? '🔇 Microphone muted' : '🎤 Microphone active');
  });

  /* ---- OFFLINE TOGGLE ---- */
  document.getElementById('offlineToggle')?.addEventListener('click', function() {
    this.classList.toggle('on');
    showToast(this.classList.contains('on') ? '📡 Offline mode enabled' : '🌐 Online mode active');
  });

  /* ---- EDIT MEETING TITLE ---- */
  document.getElementById('meetingTitleBtn')?.addEventListener('click', () => {
    const titleEl = document.getElementById('meetingTitleText');
    const current = titleEl?.textContent || 'Meeting';
    const next = prompt('Enter meeting title:', current);
    if (next && titleEl) titleEl.textContent = next;
  });

  /* ---- TEXT SIZE BUTTONS ---- */
  document.querySelectorAll('.ts-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ts-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sizes = { sm:'16px', md:'22px', lg:'28px' };
      document.querySelectorAll('.utterance-trans').forEach(el => el.style.fontSize = sizes[btn.dataset.size]);
    });
  });

  /* ---- SPEAKER LABEL TOGGLE ---- */
  const spkLabelToggle = document.getElementById('speakerLabelToggle');
  spkLabelToggle?.addEventListener('click', () => {
    spkLabelToggle.classList.toggle('off');
    const hide = spkLabelToggle.classList.contains('off');
    document.querySelectorAll('.utterance-meta').forEach(m => m.style.display = hide ? 'none' : '');
  });

  /* ---- ORIGINAL TEXT TOGGLE ---- */
  const origTextToggle = document.getElementById('origTextToggle');
  origTextToggle?.addEventListener('click', () => {
    origTextToggle.classList.toggle('off');
    const hide = origTextToggle.classList.contains('off');
    document.querySelectorAll('.utterance-orig').forEach(m => m.style.display = hide ? 'none' : '');
  });

  /* ---- SWITCH DEVICE ---- */
  const DEVICES = ['Logitech Brio Stream mic','MacBook Pro Microphone','AirPods Pro','USB Headset','Rode NT-USB'];
  let devIdx = 0;
  document.getElementById('switchDeviceBtn')?.addEventListener('click', () => {
    devIdx = (devIdx + 1) % DEVICES.length;
    const subEl = document.querySelector('.mic-sub');
    if (subEl) subEl.textContent = DEVICES[devIdx];
    showToast(`🎙 Switched to: ${DEVICES[devIdx]}`);
  });

  /* ---- CLEAR SUBTITLES ---- */
  document.getElementById('clearBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (!confirm('Clear all subtitles from screen?')) return;
    if (transcriptArea) { transcriptArea.innerHTML = ''; uttIdx = 0; }
    showToast('🗑 Subtitles cleared');
  });

  /* ======== LANGUAGE MODAL ======== */
  const langModal   = document.getElementById('langModal');
  const langSelector = document.getElementById('langSelector');
  document.getElementById('langModalClose')?.addEventListener('click', () => closeModal(langModal));
  initModalBackdrop(langModal);
  langSelector?.addEventListener('click', () => openModal(langModal));

  document.getElementById('applyLangBtn')?.addEventListener('click', () => {
    const from = document.getElementById('fromLangSelect')?.value;
    const to   = document.getElementById('toLangSelect')?.value;
    if (document.getElementById('langFrom')) document.getElementById('langFrom').textContent = from;
    if (document.getElementById('langTo'))   document.getElementById('langTo').textContent = to;
    closeModal(langModal);
    showToast(`✓ Language changed to ${from} → ${to}`);
  });

  /* ======== ADD TERM MODAL ======== */
  const termModal  = document.getElementById('termModal');
  const glossaryList = document.getElementById('glossaryList');
  document.getElementById('addTermBtn')?.addEventListener('click', () => openModal(termModal));
  document.getElementById('termModalClose')?.addEventListener('click', () => closeModal(termModal));
  initModalBackdrop(termModal);

  document.getElementById('addTermConfirm')?.addEventListener('click', () => {
    const term  = document.getElementById('termInput')?.value.trim();
    const trans = document.getElementById('transInput')?.value.trim();
    if (!term || !trans) { showToast('⚠ Please fill in both fields'); return; }
    const item = document.createElement('div');
    item.className = 'gl-item';
    item.innerHTML = `<div class="gl-item-top"><span class="gl-term">${term}</span><span class="gl-badge-new">NEW</span></div><div class="gl-trans">${trans}</div>`;
    glossaryList?.prepend(item);
    const countEl = document.querySelector('.gl-count');
    if (countEl) countEl.textContent = (parseInt(countEl.textContent) + 1) + ' terms';
    document.getElementById('termInput').value = '';
    document.getElementById('transInput').value = '';
    closeModal(termModal);
    showToast('✓ Term added to glossary');
  });

  /* ======== CAPTION SETTINGS MODAL ======== */
  const capModal = document.getElementById('capModal');
  document.getElementById('captionSettingsBtn')?.addEventListener('click', e => { e.preventDefault(); openModal(capModal); });
  document.getElementById('capModalClose')?.addEventListener('click', () => closeModal(capModal));
  initModalBackdrop(capModal);

  // Font size slider
  const fontSlider = document.getElementById('fontSizeRange');
  fontSlider?.addEventListener('input', () => {
    const previewText = document.getElementById('previewText');
    if (previewText) previewText.style.fontSize = fontSlider.value + 'px';
  });

  // Font color swatches
  document.querySelectorAll('#fontColorSwatches .swatch[data-color]').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('#fontColorSwatches .swatch').forEach(x => x.classList.remove('sel'));
      s.classList.add('sel');
      const pt = document.getElementById('previewText');
      if (pt) pt.style.color = s.dataset.color;
    });
  });
  document.getElementById('fontColorInput')?.addEventListener('input', e => {
    const pt = document.getElementById('previewText');
    if (pt) pt.style.color = e.target.value;
  });

  // BG color swatches
  document.querySelectorAll('#bgColorSwatches .swatch[data-color]').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('#bgColorSwatches .swatch').forEach(x => x.classList.remove('sel'));
      s.classList.add('sel');
      const sp = document.getElementById('subtitlePreview');
      if (sp) sp.style.background = s.dataset.color;
    });
  });
  document.getElementById('bgColorInput')?.addEventListener('input', e => {
    const sp = document.getElementById('subtitlePreview');
    if (sp) sp.style.background = e.target.value;
  });

  // Position buttons
  document.querySelectorAll('#posGrid .pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#posGrid .pos-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      const sp = document.getElementById('subtitlePreview');
      if (!sp) return;
      sp.className = 'subtitle-preview';
      if (btn.dataset.pos === 'top') sp.classList.add('pos-top');
      if (btn.dataset.pos === 'floating') sp.classList.add('pos-floating');
    });
  });

  // High contrast
  document.getElementById('hcCard')?.addEventListener('click', () => {
    const hct = document.getElementById('hcToggle');
    hct?.classList.toggle('off');
    const isOff = hct?.classList.contains('off');
    const sp = document.getElementById('subtitlePreview');
    const pt = document.getElementById('previewText');
    if (sp) sp.style.background = isOff ? '' : '#000';
    if (pt) pt.style.color = isOff ? '' : '#ffff00';
  });

  // Reset
  document.getElementById('capResetBtn')?.addEventListener('click', () => {
    if (fontSlider) fontSlider.value = 16;
    const pt = document.getElementById('previewText');
    const sp = document.getElementById('subtitlePreview');
    if (pt) { pt.style.fontSize = '15px'; pt.style.color = '#fff'; }
    if (sp) { sp.style.background = ''; sp.className = 'subtitle-preview'; }
    document.querySelectorAll('#fontColorSwatches .swatch').forEach((s,i) => s.classList.toggle('sel', i===0));
    document.querySelectorAll('#bgColorSwatches .swatch').forEach((s,i) => s.classList.toggle('sel', i===0));
    document.querySelectorAll('#posGrid .pos-btn').forEach((b,i) => b.classList.toggle('sel', i===0));
    document.getElementById('hcToggle')?.classList.remove('off');
  });

  // Cancel / Save
  document.getElementById('capCancelBtn')?.addEventListener('click', () => closeModal(capModal));
  document.getElementById('capSaveBtn')?.addEventListener('click', () => {
    closeModal(capModal);
    showToast('✓ Caption settings saved');
  });

});