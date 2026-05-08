document.addEventListener('DOMContentLoaded', () => {

  /* --- SMOOTH ANCHOR SCROLL --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --- NAV ACTIVE LINK ON SCROLL --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  /* --- HERO ENTRANCE ANIMATIONS --- */
  const heroElements = [
    { el: document.querySelector('.hero-badge'),  delay: 200 },
    { el: document.querySelector('.hero-title'),  delay: 350 },
    { el: document.querySelector('.hero-sub'),    delay: 500 },
    { el: document.querySelector('.hero-btns'),   delay: 650 },
    { el: document.querySelector('.hero-visual'), delay: 400 },
  ];

  heroElements.forEach(({ el, delay }) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity .7s ease, transform .7s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });

  /* --- ANIMATE STATS ON SCROLL --- */
  const statNums = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.3 });

  statNums.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    statObserver.observe(el);
  });

  /* --- ANIMATE FEATURE CARDS ON SCROLL --- */
  const featCards = document.querySelectorAll('.feat-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
      }
    });
  }, { threshold: 0.1 });

  featCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .5s ease, transform .5s ease';
    cardObserver.observe(card);
  });

  /* --- ANIMATE STEP CARDS ON SCROLL --- */
  const stepCards = document.querySelectorAll('.step-card');
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 120);
      }
    });
  }, { threshold: 0.1 });

  stepCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .5s ease, transform .5s ease';
    stepObserver.observe(card);
  });

  /* --- ROTATING CAPTION CARD TEXT --- */
  const samples = [
    {
      orig: '"Welcome to today\'s product review meeting."',
      trans: '→ "Bienvenidos a la revisión de producto de hoy."'
    },
    {
      orig: '"The project is on schedule and quality is excellent."',
      trans: '→ "Das Projekt ist im Zeitplan und die Qualität ist hervorragend."'
    },
    {
      orig: '"Can we move the next meeting to Tuesday?"',
      trans: '→ "今週火曜日に次のミーティングを移動できますか？"'
    },
    {
      orig: '"The new features will be released next week."',
      trans: '→ "Les nouvelles fonctionnalités sortiront la semaine prochaine."'
    },
  ];

  let sIdx = 0;
  const origEl  = document.querySelector('.caption-card-orig');
  const transEl = document.querySelector('.caption-card-trans');

  if (origEl && transEl) {
    setInterval(() => {
      sIdx = (sIdx + 1) % samples.length;
      origEl.style.opacity  = '0';
      transEl.style.opacity = '0';
      setTimeout(() => {
        origEl.textContent  = samples[sIdx].orig;
        transEl.textContent = samples[sIdx].trans;
        origEl.style.transition  = 'opacity .5s';
        transEl.style.transition = 'opacity .5s';
        origEl.style.opacity  = '1';
        transEl.style.opacity = '1';
      }, 400);
    }, 4000);
  }

  /* --- LOAD MEETINGS FROM BACKEND --- */
  async function loadMeetings() {
    try {
      const resp = await fetch('http://localhost:3000/meetings');
      const meetings = await resp.json();
      if (meetings.length) {
        console.log('Meetings loaded:', meetings.length);
      }
    } catch (err) {
      console.warn('Could not load meetings', err);
    }
  }
  loadMeetings();

});