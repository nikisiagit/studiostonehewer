document.addEventListener('DOMContentLoaded', () => {
  const LIVE_PREVIEW_ORIGINS = new Set([
    'https://admin.studiostonehewer.co.uk',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  // Custom Cursor (mouse devices only — pause when idle / tab hidden)
  const cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    const interactables = document.querySelectorAll(
      'a, button, .hero-logo, .about-image img, a .project-card-img, .full-width-img, .masonry-item, .project-header-img',
    );

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let rafId = null;
    let running = false;

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

      const settled =
        Math.abs(mouseX - cursorX) < 0.1 && Math.abs(mouseY - cursorY) < 0.1;

      if (settled || document.hidden) {
        running = false;
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(animateCursor);
    }

    function ensureAnimating() {
      if (running || document.hidden) return;
      running = true;
      rafId = requestAnimationFrame(animateCursor);
    }

    document.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        ensureAnimating();
      },
      { passive: true },
    );

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
      }
    });

    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // Fade out nav on scroll down, fade in on scroll up (rAF-coalesced)
  const navbars = document.querySelectorAll('.navbar');
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function updateNavOnScroll() {
    const currentScrollY = window.scrollY;

    navbars.forEach((navbar) => {
      if (currentScrollY < 50) {
        navbar.classList.remove('hidden');
        navbar.classList.remove('scrolling-up');
        navbar.classList.remove('scrolled');
        navbar.style.opacity = 1;
      } else if (currentScrollY > lastScrollY) {
        navbar.classList.add('hidden');
        navbar.classList.remove('scrolling-up');
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('hidden');
        navbar.classList.add('scrolling-up');
        navbar.classList.add('scrolled');
        navbar.style.opacity = 1;
      }
    });
    lastScrollY = currentScrollY;
    scrollTicking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateNavOnScroll);
      }
    },
    { passive: true },
  );

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-active');
      navLinks.classList.toggle('active');
    });

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Scroll Reveal Animations
  const reveals = document.querySelectorAll('.reveal');

  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const revealOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  reveals.forEach((reveal) => {
    revealOnScroll.observe(reveal);
  });

  // Payload CMS Live Preview — only accept messages from the admin origin
  window.addEventListener('message', (event) => {
    if (!LIVE_PREVIEW_ORIGINS.has(event.origin)) return;
    if (!event.data || event.data.type !== 'payload-live-preview') return;

    const data = event.data.data;
    if (!data || typeof data !== 'object') return;

    document.querySelectorAll('[data-live-preview]').forEach((el) => {
      const fieldName = el.getAttribute('data-live-preview');
      if (!fieldName || data[fieldName] === undefined) return;

      if (el.tagName === 'IMG') {
        const next = data[fieldName]?.url;
        if (typeof next !== 'string') return;
        // Allow relative paths and public https; block loopback so live preview
        // never injects http://127.0.0.1 into a production-origin tab.
        const isRelative = next.startsWith('/');
        let isPublicHttp = false;
        try {
          if (/^https?:\/\//i.test(next)) {
            const host = new URL(next).hostname.toLowerCase();
            isPublicHttp =
              host !== 'localhost' &&
              host !== '127.0.0.1' &&
              host !== '::1' &&
              host !== '[::1]';
          }
        } catch {
          isPublicHttp = false;
        }
        if (isRelative || isPublicHttp) {
          el.src = next;
        }
      } else if (typeof data[fieldName] === 'string' || typeof data[fieldName] === 'number') {
        el.textContent = String(data[fieldName]);
      }
    });

    if (typeof data.quote_text === 'string') {
      const quoteEl = document.querySelector('.quote-section blockquote');
      if (quoteEl) quoteEl.textContent = `"${data.quote_text}"`;
    }
    if (typeof data.studio_description === 'string') {
      const studioDesc = document.querySelector('.studio-description');
      if (studioDesc) studioDesc.textContent = data.studio_description;
    }
  });
});
