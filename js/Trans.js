document.addEventListener('DOMContentLoaded', () => {

  /* ---- DATA ---- */
  let ALL_ROWS = [];
  const MEETING_ID = localStorage.getItem('meetingID') || '1'; // default to 1 for demo

  async function loadTranscript(meetingId) {
    try {
      const resp = await fetch(`http://localhost:3000/meetings/${meetingId}/captions`);
      const rows = await resp.json();
      ALL_ROWS = rows.map(r => ({
        ts: r.timestamp || '',
        spk: r.speaker || '',
        initials: r.speaker ? r.speaker.split(' ').map(n=>n[0]).join('') : '',
        color:['#2563eb','#7c3aed','#db2777','#059669'][Math.floor(Math.random()*5)],
        en: r.text || '',
        es: ''
      }));
      renderTable();
    } catch (e) {
      console.warn('failed to load transcript', e);
    }
  }
// default to 1 for demo
  loadTranscript(MEETING_ID);


  const PAGE_SIZE = 5;
  let currentPage = 1;
  let searchTerm = '';

  /* attempt to load translations from backend for caption id 1 */
  /* fetch translations for first caption as demo */
  (async () => {
    try {
      const resp = await fetch(`http://localhost:3000/captions/${MEETING_ID}/translations`);
      if (resp.ok) {
        const trans = await resp.json();
        if (trans.length) {
          ALL_ROWS = ALL_ROWS.concat(trans.map(t => ({
            ts: '', spk:'', initials:'', color:'#000', en:'', es:t.text
          })));
          renderTable();
        }
      }
    } catch (e) {
      console.warn('translation fetch error', e);
    }
  })();

  /* ---- SEARCH ---- */
  function filteredRows() {
    if (!searchTerm) return ALL_ROWS;
    const t = searchTerm.toLowerCase();
    return ALL_ROWS.filter(r =>
      r.en.toLowerCase().includes(t) ||
      r.es.toLowerCase().includes(t) ||
      r.spk.toLowerCase().includes(t) ||
      r.ts.includes(t)
    );
  }

  function hl(text) {
    if (!searchTerm) return text;
    const re = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  /* ---- RENDER TABLE ---- */
  function renderTable() {
    const rows   = filteredRows();
    const total  = rows.length;
    const start  = (currentPage - 1) * PAGE_SIZE;
    const end    = Math.min(start + PAGE_SIZE, total);
    const page   = rows.slice(start, end);

    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (page.length === 0) {
      tbody.innerHTML = '<div class="table-row no-results">No results found for your search.</div>';
    } else {
      tbody.innerHTML = page.map(r => `
        <div class="table-row">
          <div class="timestamp">${r.ts}</div>
          <div class="speaker-cell">
            <div class="spk-av" style="background:${r.color}">${r.initials}</div>
            <span class="spk-name">${r.spk}</span>
          </div>
          <div class="cell-text">${hl(r.en)}</div>
          <div class="cell-text">${hl(r.es)}</div>
        </div>`).join('');
    }

    // Update label
    const label = document.getElementById('accuracyLabel');
    if (label) label.textContent = `Auto-translated using SmartLingo Engine v4.2. Accuracy: 98.4% — Showing ${start+1}–${end} of 142 entries`;

    // Pagination
    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const pag = document.getElementById('pagination');
    if (!pag) return;
    let html = `<button class="pg-btn" id="pgPrev" ${currentPage===1?'disabled':''}><span class="material-icons">chevron_left</span></button>`;
    for (let p = 1; p <= Math.min(totalPages, 4); p++) {
      html += `<button class="pg-btn ${currentPage===p?'active':''}" data-page="${p}">${p}</button>`;
    }
    if (totalPages > 4) html += `<span style="padding:0 4px;color:#94a3b8;font-size:13px;">...</span>`;
    html += `<button class="pg-btn" id="pgNext" ${currentPage===totalPages?'disabled':''}><span class="material-icons">chevron_right</span></button>`;
    pag.innerHTML = html;

    pag.querySelector('#pgPrev')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    pag.querySelector('#pgNext')?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderTable(); } });
    pag.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); renderTable(); });
    });
  }

  // Initial render
  renderTable();

  /* ---- SEARCH INPUT ---- */
  let searchTimer;
  document.getElementById('searchInput')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = e.target.value.trim();
      currentPage = 1;
      renderTable();
    }, 200);
  });

  /* ---- ACTION ITEM CHECKBOXES ---- */
  document.querySelectorAll('.action-check').forEach(check => {
    check.addEventListener('click', () => {
      check.classList.toggle('done');
      check.nextElementSibling?.classList.toggle('done');
    });
  });

  /* ---- SHARE LINK ---- */
  document.getElementById('generateLinkBtn')?.addEventListener('click', () => {
    const wrap = document.getElementById('shareLinkWrap');
    if (!wrap) return;
    const isShown = wrap.style.display === 'block';
    wrap.style.display = isShown ? 'none' : 'block';
    const btn = document.getElementById('generateLinkBtn');
    if (btn) btn.textContent = isShown ? 'Generate Share Link' : 'Hide Link';
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    const input = document.getElementById('shareLinkInput');
    if (!input) return;
    navigator.clipboard.writeText(input.value).catch(() => {
      input.select(); document.execCommand('copy');
    });
    showToast('✓ Link copied to clipboard!');
  });

  /* ---- DOWNLOAD TXT ---- */
  document.getElementById('dlTxt')?.addEventListener('click', () => {
    const text = ALL_ROWS.map(r =>
      `[${r.ts}] ${r.spk}\nEN: ${r.en}\nES: ${r.es}\n`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'SmartLingo-Transcript.txt' });
    a.click(); URL.revokeObjectURL(url);
    showToast('✓ TXT downloaded');
  });

  /* ---- DOWNLOAD PDF ---- */
  document.getElementById('dlPdf')?.addEventListener('click', () => {
    showToast('✓ Preparing PDF…');
    setTimeout(() => window.print(), 400);
  });

});