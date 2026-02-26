
document.addEventListener('DOMContentLoaded', () => {

  /* ---- DATA ---- */
  const ALL_ROWS = [
    { ts:'00:00:12', spk:'John Doe', initials:'JD', color:'#2563eb', en:'Good morning everyone. Thank you for joining today\'s Q3 review. We\'ve seen some significant growth in our European markets.', es:'Buenos días a todos. Gracias por unirse a la revisión del tercer trimestre. Hemos visto un crecimiento significativo en nuestros mercados europeos.' },
    { ts:'00:01:45', spk:'Mark Smith', initials:'MS', color:'#a855f7', en:'Regarding the subscription model, should we consider a localized pricing strategy for the Nordic regions to capitalize on this momentum?', es:'En relación con el modelo de suscripción, ¿deberíamos considerar una estrategia de precios localizada para las regiones nórdicas para capitalizar este impulso?' },
    { ts:'00:03:22', spk:'John Doe', initials:'JD', color:'#2563eb', en:'That\'s a great point Mark. Our data shows that purchasing power varies significantly across the Nordics, so a tiered localized approach makes sense.', es:'Ese es un gran punto, Mark. Nuestros datos muestran que el poder adquisitivo varía significativamente en los países nórdicos, por lo que un enfoque localizado por niveles tiene sentido.' },
    { ts:'00:05:10', spk:'Alice Lewis', initials:'AL', color:'#f97316', en:'I can prepare a competitive analysis for those regions by Friday. We\'ll need to look at local competitors who are already using localized billing.', es:'Puedo preparar un análisis competitivo para esas regiones para el viernes. Tendremos que fijarnos en los competidores locales que ya utilizan facturación localizada.' },
    { ts:'00:08:34', spk:'Robert Kim', initials:'RK', color:'#22c55e', en:'Just to add, we\'ve also seen a 20% increase in engagement when we provide customer support in the local language. SmartLingo has been vital for this.', es:'Solo para añadir, también hemos visto un aumento del 20% en el compromiso cuando ofrecemos atención al cliente en el idioma local. SmartLingo ha sido vital para esto.' },
    { ts:'00:11:02', spk:'Mark Smith', initials:'MS', color:'#a855f7', en:'That\'s impressive data Robert. Should we look at expanding this to Asian markets next quarter as well?', es:'Esos son datos impresionantes, Robert. ¿Deberíamos considerar expandir esto a los mercados asiáticos el próximo trimestre también?' },
    { ts:'00:13:45', spk:'John Doe', initials:'JD', color:'#2563eb', en:'Absolutely. Let\'s include Asia-Pacific in Alice\'s analysis scope. The opportunity there is significant given our recent product launches.', es:'Absolutamente. Incluyamos Asia-Pacífico en el alcance del análisis de Alice. La oportunidad allí es significativa dado nuestros lanzamientos de productos recientes.' },
    { ts:'00:15:20', spk:'Alice Lewis', initials:'AL', color:'#f97316', en:'I\'ll expand the report to cover APAC markets too. We should have preliminary findings by the following Monday.', es:'Ampliaré el informe para cubrir también los mercados de APAC. Deberíamos tener resultados preliminares para el lunes siguiente.' },
    { ts:'00:18:11', spk:'Robert Kim', initials:'RK', color:'#22c55e', en:'One concern – our infrastructure needs to support 24/7 multilingual support across time zones. Have we assessed the technical requirements?', es:'Una preocupación: nuestra infraestructura necesita soportar soporte multilingüe 24/7 en diferentes zonas horarias. ¿Hemos evaluado los requisitos técnicos?' },
    { ts:'00:21:30', spk:'Mark Smith', initials:'MS', color:'#a855f7', en:'Engineering has already started scoping this out. We expect a full requirements document by end of this month.', es:'El equipo de ingeniería ya ha comenzado a definir el alcance de esto. Esperamos un documento de requisitos completo para finales de este mes.' },
  ];

  const PAGE_SIZE = 5;
  let currentPage = 1;
  let searchTerm = '';

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