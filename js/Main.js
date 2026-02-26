
document.addEventListener('DOMContentLoaded', () => {
  }
});

/* ─── TOAST NOTIFICATION ─── */
function showToast(msg, duration = 2800) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── SCROLL REVEAL ─── */
function initReveal() {
  // Mark body so CSS knows JS is running — enables scroll animations
  document.body.classList.add('js-loaded');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── NAV SCROLL (landing only) ─── */
function initNavScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
      const sec = document.querySelector(a.getAttribute('href'));
      if (sec) {
        const r = sec.getBoundingClientRect();
        a.classList.toggle('active', r.top <= 80 && r.bottom > 80);
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─── SHARED TOPBAR NAV INJECTION ─── */

const NAV_PAGES = [
  { href: 'index.html',      icon: 'home',        label: 'Home'            },
  { href: 'meeting.html',    icon: 'videocam',     label: 'Live Meeting'    },
  { href: 'transcript.html', icon: 'description',  label: 'Transcript'      },
  { href: 'captions.html',   icon: 'tune',         label: 'Caption Settings'},
];

function buildTopbarNav() {
  const container = document.getElementById('topbarNav');
  if (!container) return;

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const html = NAV_PAGES.map(p => {
    const isActive = p.href === currentPage;
    return `
      <a href="${p.href}" class="topbar-nav-link ${isActive ? 'topbar-nav-active' : ''}" title="${p.label}">
        <span class="material-icons">${p.icon}</span>
        <span class="topbar-nav-label">${p.label}</span>
      </a>`;
  }).join('');

  container.innerHTML = html;
}

/* ─── MODAL HELPERS ─── */
function openModal(overlay)  { overlay?.classList.add('open');    }
function closeModal(overlay) { overlay?.classList.remove('open'); }

function initModalBackdrop(overlay) {
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay);
  });
}

/* ─── ESC CLOSES MODALS ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open, .cap-modal-overlay.open, .lang-modal-overlay.open, .term-modal-overlay.open')
      .forEach(m => m.classList.remove('open'));
  }
});

/* ─── INIT ON LOAD ─── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNavScroll();
  buildTopbarNav();
});