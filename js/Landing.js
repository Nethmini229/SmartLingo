
document.addEventListener('DOMContentLoaded', () => {

  /* --- MEETING TILE ANIMATION --- */
  const tiles = document.querySelectorAll('.meeting-tile');
  if (tiles.length) {
    setInterval(() => {
      tiles.forEach(t => t.classList.remove('speaking'));
      tiles[Math.floor(Math.random() * tiles.length)].classList.add('speaking');
    }, 2000);
  }

  /* --- ROTATING TRANSLATION TEXT --- */
  const samples = [
    { orig: '"Wir müssen die Projektplanung bis nächste Woche abschließen, um den Zeitplan einzuhalten."', result: '"We need to finalize the project planning by next week to stay on schedule."' },
    { orig: '"Das Projekt ist im Zeitplan und die Qualität ist hervorragend."', result: '"The project is on schedule and the quality is excellent."' },
    { orig: '"Können wir das nächste Meeting auf Dienstag verschieben?"', result: '"Can we move the next meeting to Tuesday?"' },
    { orig: '"Die neuen Funktionen werden nächste Woche released."', result: '"The new features will be released next week."' },
  ];
  let sIdx = 0;
  const origEl = document.getElementById('transOrig');
  const resultEl = document.getElementById('transResult');
  if (origEl && resultEl) {
    setInterval(() => {
      sIdx = (sIdx + 1) % samples.length;
      origEl.style.opacity = '0'; resultEl.style.opacity = '0';
      setTimeout(() => {
        origEl.textContent = samples[sIdx].orig;
        resultEl.textContent = samples[sIdx].result;
        origEl.style.transition = 'opacity .5s'; resultEl.style.transition = 'opacity .5s';
        origEl.style.opacity = '1'; resultEl.style.opacity = '1';
      }, 400);
    }, 4000);
  }

  /* --- DEMO MODAL --- */
  const demoOverlay = document.getElementById('demoModal');
  const demoBtn = document.getElementById('demoBtn');
  const demoClose = document.getElementById('demoModalClose');
  const demoPlayBtn = document.getElementById('demoPlayBtn');

  if (demoBtn && demoOverlay) {
    demoBtn.addEventListener('click', () => openModal(demoOverlay));
    demoClose?.addEventListener('click', () => closeModal(demoOverlay));
    initModalBackdrop(demoOverlay);
    demoPlayBtn?.addEventListener('click', () => { location.href = 'meeting.html'; });
  }

  /* --- SMOOTH ANCHOR SCROLL --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
});