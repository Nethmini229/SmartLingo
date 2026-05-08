document.addEventListener('DOMContentLoaded', () => {
/* ------STATE-----*/
  let isPaused   = false;
  let isMuted    = false;
  let uttIdx     = 0;
  let dataUsage  = 1.2;
  let MEETING_ID = localStorage.getItem('meetingID') || 1;
  console.log('Initial MEETING_ID', MEETING_ID);
  /* --- load meetings from backend (example) --- */
  async function loadMeetings() {
    try {
      const resp = await fetch('http://localhost:3000/meetings');
      const meetings = await resp.json();
      if (meetings.length) {
        localStorage.setItem('meetingID', meetings[0].id); 
        MEETING_ID = meetings[0].id;
        console.log('Updated MEETING_ID:', MEETING_ID);
      // store first meeting id for demo
      // you can render the title/date somewhere on the page
      const titleEl = document.getElementById('meetingTitleText');
      if (titleEl) titleEl.textContent = meetings[0].title;
      } else {
        const createResp = await fetch('http://localhost:3000/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             title:'SmartLingo Meeting', description:'Auto-created meeting.', start_time: new Date().toISOString(), end_time:null 
            })
        });
        const newMeeting = await createResp.json();
        localStorage.setItem('meetingID', newMeeting.id);
        const titleEl = document.getElementById('meetingTitleText');
        if (titleEl) titleEl.textContent = newMeeting.title;
      }
    } catch (err) {
      console.warn('failed to load meetings', err);
    }
  }

  loadMeetings();

  // fetch captions from backend (meeting 1 used as example)
  async function loadCaptions(meetingId) {
    try {
      const resp = await fetch(`http://localhost:3000/meetings/${meetingId}/captions`);
      const rows = await resp.json();
      return rows.map(r => ({
        id: r.id,
        spk: r.speaker,
        time: r.timestamp,
        orig: r.text,
        trans: ''
      }));
    } catch (err) {
      console.warn('loadCaptions error', err);
      return [];
    }
  }

  const SAMPLE_UTTERANCES = [
    { spk:'Speaker 2', time:'14:02:45', orig:'"The throughput metrics look very promising based on last quarter\'s data."', trans:'スループットの指標は、前四半期のデータに基づくと、非常に有望です。' },
    { spk:'Speaker 1', time:'14:03:02', orig:'"Agreed. Let\'s schedule a deep dive with the engineering team next week."', trans:'同意します。来週、エンジニアリングチームとのディープダイブを予定しましょう。' },
    { spk:'Speaker 2', time:'14:03:18', orig:'"I\'ll also prepare a scalability report for the board presentation."', trans:'取締役会のプレゼンのために、スケーラビリティレポートも準備します。' },
    { spk:'Speaker 1', time:'14:03:35', orig:'"Perfect. Can we revisit the load balancer configuration before then?"', trans:'完璧です。その前にロードバランサの設定を見直すことはできますか？' },
    { spk:'Speaker 2', time:'14:03:55', orig:'"Yes, I\'ll coordinate with Robert on the infrastructure review."', trans:'はい、インフラのレビューについてロバートと調整します。' },
  ];
  let UTTERANCES = [...SAMPLE_UTTERANCES];

  // attempt to overwrite with server data
 loadCaptions(MEETING_ID).then(arr => { 
  console.log('Captions from server:', arr.length);
  if (arr.length) UTTERANCES = arr; 
});

  /* ---- TRANSCRIPT ---- */
  const transcriptArea = document.getElementById('transcriptArea');

  async function addUtterance() {
    console.log('addUtterance called, uttIdx:', uttIdx, 'total:', UTTERANCES.length, 'isPaused:', isPaused);
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
      <div class="utterance-trans">${u.trans}</div>
      <button class="correct-btn" onclick="correctTranslation(this)"
        data-orig="${u.orig}" data-trans="${u.trans}">
        Correct Translation</button>
    `;
    transcriptArea?.appendChild(div);
    if (transcriptArea) transcriptArea.scrollTop = transcriptArea.scrollHeight;

    // if this utterance isn't persisted (no id) send it to the backend
    if (!u.id) {
      try {
        console.log('Saving caption to meeting:', MEETING_ID);
        const resp = await fetch(`http://localhost:3000/meetings/${MEETING_ID}/captions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speaker: u.spk, text: u.orig, timestamp: u.time })
        });
        const data = await resp.json();
        console.log('Server response:', resp.status, data);
        if (resp.ok && data.id) {
          u.id = data.id; 
          console.log('Caption saved with id:', data.id);
          // mark as saved
        }
      } catch (err) {
        console.error('failed to save caption', err.message);
      }
    }
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
 /* ======== SPEECH RECOGNITION (Web Speech API) ======== */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recBtn = document.getElementById('recBtn');

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  let isRecording = false;

  recognition.onresult = async (event) => {
    const last = event.results[event.results.length - 1];
    if (!last.isFinal) return;
    const text = last[0].transcript.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString('en-GB');

    const langMap = {
      'Japanese': 'en|ja', 'Spanish': 'en|es', 'French': 'en|fr',
      'German': 'en|de', 'Portuguese': 'en|pt', 'English': 'en|en'
    };
    const selectedLang = document.getElementById('toLangSelect')?.value || 'Japanese';
    const langPair = langMap[selectedLang] || 'en|es';

    let translatedText = '';
try {
  // Check corrections first (adaptive learning)
  const corrResp = await fetch(`http://localhost:3000/corrections/${selectedLang}`);
  const corrections = await corrResp.json();
  const match = corrections.find(c => 
    c.original_text.toLowerCase().trim() === text.toLowerCase().trim()
  );

  if (match) {
    // Use the corrected translation
    translatedText = match.correct_translation;
    showToast('🧠 Using learned correction!');
  } else {
    // Use Apertium translation
    const transResp = await fetch('http://localhost:3000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, langPair })
    });
    const transData = await transResp.json();
    translatedText = transData.translatedText || '';
  }
} catch (err) {
  console.warn('Translation failed:', err.message);
}

    const newUtt = { spk: 'Speaker 1', time: now, orig: `"${text}"`, trans: translatedText };
    UTTERANCES.push(newUtt);
    await addUtterance();
    showToast('✅ Speech recognized!');
  };

  recognition.onerror = (e) => {
    showToast('❌ Speech error: ' + e.error);
    isRecording = false;
    if (recBtn) { recBtn.style.background = ''; recBtn.title = 'Start Recording'; }
  };

  recBtn?.addEventListener('click', () => {
    if (!isRecording) {
      recognition.start();
      isRecording = true;
      if (recBtn) { recBtn.style.background = '#ef4444'; recBtn.title = 'Stop Recording'; }
      showToast('🎙 Listening... speak now!');
    } else {
      recognition.stop();
      isRecording = false;
      if (recBtn) { recBtn.style.background = ''; recBtn.title = 'Start Recording'; }
      showToast('⏹ Stopped listening');
    }
  });

} else {
  showToast('❌ Use Chrome browser for speech recognition!');
}
/* ======== ADAPTIVE LEARNING ======== */
window.correctTranslation = async function(btn) {
  const orig  = btn.dataset.orig;
  const wrong = btn.dataset.trans;
  const correct = prompt('Enter the correct translation:', wrong);
  if (!correct || correct === wrong) return;

  const selectedLang = document.getElementById('toLangSelect')?.value || 'Japanese';

  try {
    const resp = await fetch('http://localhost:3000/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_text: orig,
        wrong_translation: wrong,
        correct_translation: correct,
        language: selectedLang
      })
    });
    if (resp.ok) {
      // Update the translation on screen
      const transEl = btn.previousElementSibling;
      if (transEl) transEl.textContent = correct;
      btn.textContent = '✅ Corrected';
      btn.disabled = true;
      btn.style.color = 'var(--green)';
      showToast('✅ Correction saved! AI will learn from this.');
    }
  } catch (err) {
    showToast('❌ Failed to save correction');
  }
};
/* ======== TAB AUDIO CAPTURE (Zoom/Google Meet) ======== */
let tabStream = null;
let tabRecognition = null;

document.getElementById('tabCaptureBtn')?.addEventListener('click', async () => {
  if (tabStream) {
    tabStream.getTracks().forEach(t => t.stop());
    tabStream = null;
    tabRecognition?.stop();
    tabRecognition = null;
    document.getElementById('tabCaptureBtn').style.background = '';
    document.getElementById('tabCaptureBtn').innerHTML = '<span class="material-icons">tab</span>Tab Audio';
    showToast('⏹ Tab audio capture stopped');
    return;
  }

  try {
    tabStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    const audioTracks = tabStream.getAudioTracks();
    if (audioTracks.length === 0) {
      showToast('⚠ No audio detected. Check "Share tab audio" when sharing!');
      tabStream.getTracks().forEach(t => t.stop());
      tabStream = null;
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    tabRecognition = new SpeechRecognition();
    tabRecognition.continuous = true;
    tabRecognition.interimResults = true;
    tabRecognition.lang = 'en-US';

    tabRecognition.onresult = async (event) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;
      const text = last[0].transcript.trim();
      if (!text) return;

      const now = new Date().toLocaleTimeString('en-GB');
      const langMap = {
        'Spanish':    'en|es',
        'French':     'en|fr',
        'German':     'en|de',
        'Japanese':   'en|ja',
        'Portuguese': 'en|pt',
        'Chinese':    'en|zh',
        'Korean':     'en|ko'
      };
      const selectedLang = document.getElementById('toLangSelect')?.value || 'Spanish';
      const langPair = langMap[selectedLang] || 'en|es';

      let translatedText = '';
      try {
        const corrResp = await fetch(`http://localhost:3000/corrections/${selectedLang}`);
        const corrections = await corrResp.json();
        const match = corrections.find(c =>
          c.original_text.toLowerCase().trim() === text.toLowerCase().trim()
        );
        if (match) {
          translatedText = match.correct_translation;
          showToast('🧠 Using learned correction!');
        } else {
          const transResp = await fetch('http://localhost:3000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, langPair })
          });
          const transData = await transResp.json();
          translatedText = transData.translatedText || '';
        }
      } catch (err) {
        console.warn('Translation failed:', err.message);
      }

      const newUtt = { spk: 'Meeting Audio', time: now, orig: `"${text}"`, trans: translatedText };
      UTTERANCES.push(newUtt);
      await addUtterance();
    };

    tabRecognition.onerror = (e) => {
      console.warn('Tab recognition error:', e.error);
    };

    tabStream.getVideoTracks()[0].onended = () => {
      tabRecognition?.stop();
      tabStream = null;
      tabRecognition = null;
      document.getElementById('tabCaptureBtn').style.background = '';
      document.getElementById('tabCaptureBtn').innerHTML = '<span class="material-icons">tab</span>Tab Audio';
      showToast('⏹ Tab sharing ended');
    };

    tabRecognition.start();
    document.getElementById('tabCaptureBtn').style.background = '#22c55e';
    document.getElementById('tabCaptureBtn').style.color = 'white';
    document.getElementById('tabCaptureBtn').innerHTML = '<span class="material-icons">tab</span>Stop Tab';
    showToast('✅ Tab audio captured! Subtitles will appear from meeting audio.');

  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showToast('❌ Permission denied — please allow screen sharing');
    } else {
      showToast('❌ Tab capture failed: ' + err.message);
    }
  }
});
});
