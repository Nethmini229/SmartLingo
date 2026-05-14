document.addEventListener('DOMContentLoaded', () => {

  let isPaused        = false;
  let isMuted         = false;
  let isRecording     = false;
  let recognition     = null;   // mic recognition instance
  let tabRecognition  = null;   // tab audio recognition instance
  let tabStream       = null;   // MediaStream from getDisplayMedia
  let interimDiv      = null;   // live "typing" bubble
  let MEETING_ID      = localStorage.getItem('meetingID') || 1;

  const transcriptArea = document.getElementById('transcriptArea');
  const langModal      = document.getElementById('langModal');
  const capModal       = document.getElementById('capModal');
  const globalToast    = document.getElementById('globalToast');

  /*LANGUAGE CODE MAP */
  const langCodes = {
    'Spanish':    'en|es',
    'French':     'en|fr',
    'German':     'en|de',
    'Japanese':   'en|ja',
    'Portuguese': 'en|pt',
    'Chinese':    'en|zh',
    'Korean':     'en|ko'
  };

  // Web Speech API recognition language
  const speechLangCodes = {
    'English':    'en-US',
    'Spanish':    'es-ES',
    'French':     'fr-FR',
    'German':     'de-DE',
    'Japanese':   'ja-JP',
    'Portuguese': 'pt-PT',
    'Chinese':    'zh-CN',
    'Korean':     'ko-KR'
  };

  function getToLang() {
    return document.getElementById('langTo').textContent.trim();
  }

  /*TOAST */
  function showToast(msg) {
    globalToast.textContent = msg;
    globalToast.classList.add('show');
    setTimeout(() => globalToast.classList.remove('show'), 3000);
  }

  /* TRANSLATION  */
  async function translateText(text) {
    const toLang   = getToLang();
    const langpair = langCodes[toLang] || 'en|ja';

    try {
      const res = await fetch('http://localhost:3000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langpair })
      });
      const data = await res.json();

      // If the backend returned a learned correction, show a toast
      if (data.fromCorrection) {
        showToast('🧠 Learned correction applied');
      }

      return data.translatedText || text;
    } catch {
      console.warn('Backend unavailable, calling MyMemory directly');
      try {
        const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
        const res  = await fetch(url);
        const data = await res.json();
        return data.responseData?.translatedText || text;
      } catch {
        return text;
      }
    }
  }

  /* SAVE CORRECTION  */
  async function saveCorrection(original, wrongTrans, correctTrans) {
    const toLang = getToLang();
    try {
      await fetch('http://localhost:3000/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original,
          wrong:    wrongTrans,
          correct:  correctTrans,
          language: langCodes[toLang] || 'en|ja'
        })
      });
      showToast('✅ Correction saved — will apply next time');
    } catch {
      showToast('⚠️ Could not save correction (server offline)');
    }
  }

  /* SPEECH RECOGNITION  */
  function createRecognition(onFinal) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast('❌ Speech recognition requires Chrome or Edge');
      return null;
    }

    const rec          = new SR();
    rec.continuous     = true;         // keep listening until stopped
    rec.interimResults = true;         // show partial text as user speaks
    rec.lang           = speechLangCodes[
                           document.getElementById('langFrom')?.textContent.trim()
                         ] || 'en-US';

    rec.onresult = async (event) => {
      if (isPaused || isMuted) return;

      let interim = '';
      let final   = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        if (!interimDiv) {
          interimDiv = document.createElement('div');
          interimDiv.className = 'utterance active-utt';
          interimDiv.innerHTML = `
            <div class="utterance-meta" style="display:flex">
              <span class="spk-dot"></span>You &bull; ${new Date().toLocaleTimeString()}
            </div>
            <div class="utterance-orig" style="display:block;
              color:rgba(255,255,255,0.35); font-style:italic"></div>
            <div class="utterance-trans" style="color:rgba(255,255,255,0.35);
              font-size:16px">Listening...</div>
          `;
          transcriptArea.appendChild(interimDiv);
        }
        interimDiv.querySelector('.utterance-orig').textContent = interim;
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
      }

      if (final.trim()) {
        if (interimDiv) { interimDiv.remove(); interimDiv = null; }
        onFinal(final.trim());
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        showToast('❌ Microphone access denied — check browser settings');
        stopMicRecording();
      } else if (e.error !== 'no-speech') {
        showToast('⚠️ Recognition error: ' + e.error);
      }
    };

    return rec;
  }

  window.addUtterance = function (u) {
    if (isPaused) return;

    const showOrig    = !document.getElementById('origTextToggle').classList.contains('off');
    const showSpeaker = !document.getElementById('speakerLabelToggle').classList.contains('off');

    const div = document.createElement('div');
    div.className = 'utterance active-utt';
    div.dataset.orig  = u.orig;
    div.dataset.trans = u.trans;

    div.innerHTML = `
      <div class="utterance-meta" style="display:${showSpeaker ? 'flex' : 'none'}">
        <span class="spk-dot"></span>${u.spk} &bull; ${u.time}
      </div>
      <div class="utterance-orig" style="display:${showOrig ? 'block' : 'none'}">${u.orig}</div>
      <div class="utterance-trans">${u.trans}</div>
      <button class="correct-btn">Correct Translation</button>
    `;

    // Correct Translation button 
    div.querySelector('.correct-btn').onclick = async () => {
      const correctText = prompt(`Enter the correct translation for:\n"${u.orig}"`);
      if (correctText && correctText.trim()) {
        div.querySelector('.utterance-trans').textContent = correctText.trim();
        await saveCorrection(u.orig, u.trans, correctText.trim());
      }
    };

    transcriptArea.appendChild(div);
    transcriptArea.scrollTop = transcriptArea.scrollHeight;

    // Save caption to backend
    fetch(`http://localhost:3000/meetings/${MEETING_ID}/captions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speaker: u.spk, text: u.orig, timestamp: u.time })
    }).catch(e => console.warn('Caption save skipped:', e.message));
  };

  /* MIC RECORDING — START / STOP */
  function startMicRecording() {
    recognition = createRecognition(async (finalText) => {
      const translation = await translateText(finalText);
      addUtterance({
        spk:  'You',
        time: new Date().toLocaleTimeString(),
        orig: finalText,
        trans: translation
      });
    });

    if (!recognition) return;

    // Auto-restart 
    recognition.onend = () => {
      if (isRecording && !isMuted) {
        try { recognition.start(); } catch (_) {}
      }
    };

    try {
      recognition.start();
      isRecording = true;
      showToast('🎙 Listening...');
    } catch (e) {
      showToast('❌ Could not start: ' + e.message);
    }
  }

  function stopMicRecording() {
    isRecording = false;
    if (recognition)  { recognition.stop();  recognition  = null; }
    if (interimDiv)   { interimDiv.remove();  interimDiv   = null; }
    showToast('⏹ Recording Stopped');
  }

  /* MODAL OPEN / CLOSE */
  document.getElementById('langSelector').onclick       = () => langModal.classList.add('open');
  document.getElementById('translateSelector').onclick  = () => langModal.classList.add('open');
  document.getElementById('captionSettingsBtn').onclick = () => capModal.classList.add('open');
  document.getElementById('langModalClose').onclick     = () => langModal.classList.remove('open');
  document.getElementById('capModalClose').onclick      = () => capModal.classList.remove('open');

  langModal.addEventListener('click', e => { if (e.target === langModal) langModal.classList.remove('open'); });
  capModal.addEventListener('click',  e => { if (e.target === capModal)  capModal.classList.remove('open'); });

  /* APPLY LANGUAGE */
  document.getElementById('applyLangBtn').onclick = () => {
    const selected = document.getElementById('toLangSelect').value;
    document.getElementById('langTo').textContent = selected;
    langModal.classList.remove('open');
    showToast(`🌐 Translating to ${selected}`);

    
    if (isRecording && recognition) {
      recognition.stop(); 
    }
  };

  /* TOGGLE LOGIC */
  document.querySelectorAll('.toggle, .toggle-sm, .toggle-blue').forEach(toggle => {
    toggle.addEventListener('click', function () {

      if (this.classList.contains('toggle')) {
        this.classList.toggle('on');
      } else {
        this.classList.toggle('off');
      }

      if (this.id === 'origTextToggle') {
        const isOn = !this.classList.contains('off');
        document.querySelectorAll('.utterance-orig').forEach(el => {
          el.style.display = isOn ? 'block' : 'none';
        });
      }

      if (this.id === 'speakerLabelToggle') {
        const isOn = !this.classList.contains('off');
        document.querySelectorAll('.utterance-meta').forEach(el => {
          el.style.display = isOn ? 'flex' : 'none';
        });
      }

      if (this.id === 'offlineToggle') {
        showToast(this.classList.contains('on') ? '📴 Offline Mode On' : '🌐 Online Mode');
      }
    });
  });

  /* FONT SIZE CUSTOMIZATION */
  const fontSizeRange    = document.getElementById('fontSizeRange');
  const subtitlePreviewP = document.querySelector('#subtitlePreview p');

  fontSizeRange.oninput = e => {
    subtitlePreviewP.style.fontSize = e.target.value + 'px';
  };

  document.getElementById('capSaveBtn').onclick = () => {
    transcriptArea.style.fontSize = fontSizeRange.value + 'px';
    capModal.classList.remove('open');
    showToast('⚙️ Settings applied');
  };

  document.getElementById('capResetBtn').onclick = () => {
    fontSizeRange.value = 22;
    subtitlePreviewP.style.fontSize = '22px';
    transcriptArea.style.fontSize   = '22px';
    showToast('🔄 Reset to default');
  };

  /* PAUSE / RESUME */
  document.getElementById('pauseBtn').onclick = () => {
    isPaused = !isPaused;
    document.getElementById('pauseIcon').textContent = isPaused ? 'play_arrow' : 'pause';
    document.getElementById('audioPill').classList.toggle('audio-paused', isPaused);
    showToast(isPaused ? '⏸ Captions Paused' : '▶ Captions Resumed');
  };

  /* MIC MUTE / UNMUTE */
  document.getElementById('micBtn').onclick = () => {
    isMuted = !isMuted;
    document.getElementById('micIcon').textContent = isMuted ? 'mic_off' : 'mic';

    if (isRecording && recognition) {
      if (isMuted) {
        recognition.stop();
      } else {
        try { recognition.start(); } catch (_) {}
      }
    }

    showToast(isMuted ? '🔇 Mic Muted' : '🎤 Mic Unmuted');
  };

  document.getElementById('clearBtn').onclick = () => {
    transcriptArea.innerHTML = '';
    interimDiv = null;
    showToast('🗑 Transcript Cleared');
  };

  /* START / STOP RECORDING BUTTON */
  document.getElementById('recBtn').onclick = function () {
    const willRecord = !isRecording;
    this.classList.toggle('recording', willRecord);

    const icon = this.querySelector('.material-icons');
    if (icon) icon.textContent = willRecord ? 'stop' : 'fiber_manual_record';

    // "Start"/"Stop" is a plain text node in the button, not a <span>
    const textNode = Array.from(this.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = willRecord ? 'Stop' : 'Start';

    if (willRecord) {
      startMicRecording();
    } else {
      stopMicRecording();
    }
  };

  /* TAB AUDIO CAPTURE */
  document.getElementById('tabCaptureBtn').onclick = async () => {
    const btn = document.getElementById('tabCaptureBtn');

    // If already capturing, stop it
    if (tabStream) {
      tabStream.getTracks().forEach(t => t.stop());
      tabStream = null;
      if (tabRecognition) { tabRecognition.stop(); tabRecognition = null; }
      btn.style.borderColor = '';
      btn.style.color       = '';
      showToast('🛑 Tab Audio Stopped');
      return;
    }

    try {
      tabStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,  
        audio: true
      });

      btn.style.borderColor = 'var(--blue)';
      btn.style.color       = 'var(--blue)';
      showToast('🎵 Tab Audio Capturing — speak or play audio in the shared tab');


      tabRecognition = createRecognition(async (finalText) => {
        const translation = await translateText(finalText);
        addUtterance({
          spk:  'Tab Audio',
          time: new Date().toLocaleTimeString(),
          orig: finalText,
          trans: translation
        });
      });

      if (tabRecognition) {
        tabRecognition.onend = () => {
          if (tabStream) {
            try { tabRecognition.start(); } catch (_) {}
          }
        };
        tabRecognition.start();
      }

      tabStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        tabStream = null;
        if (tabRecognition) { tabRecognition.stop(); tabRecognition = null; }
        btn.style.borderColor = '';
        btn.style.color       = '';
        showToast('🛑 Tab Audio Ended');
      });

    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        showToast('❌ Tab Audio failed: ' + err.message);
      }
    }
  };

  /* MEETING TITLE EDIT */
  document.getElementById('meetingTitleBtn')?.addEventListener('click', () => {
    const current  = document.getElementById('meetingTitleText').textContent;
    const newTitle = prompt('Rename meeting:', current);
    if (newTitle && newTitle.trim()) {
      document.getElementById('meetingTitleText').textContent = newTitle.trim();
      showToast('✏️ Meeting renamed');
    }
  });
});
