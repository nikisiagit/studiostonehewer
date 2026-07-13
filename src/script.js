document.addEventListener('DOMContentLoaded', () => {
  // Custom Cursor
  const cursor = document.querySelector('.cursor');
  const interactables = document.querySelectorAll('a, button, .hero-logo, .about-image img, .project-card-img, .full-width-img, .masonry-item, .project-header-img');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Linear interpolation for smooth trailing effect
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Apply via hardware-accelerated transform
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  // Fade out nav on scroll down, fade in on scroll up
  const navbars = document.querySelectorAll('.navbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    navbars.forEach(navbar => {
      if (currentScrollY < 50) {
        // At top
        navbar.classList.remove('hidden');
        navbar.classList.remove('scrolling-up');
        navbar.classList.remove('scrolled');
        navbar.style.opacity = 1;
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        navbar.classList.add('hidden');
        navbar.classList.remove('scrolling-up');
        navbar.classList.add('scrolled');
      } else {
        // Scrolling up
        navbar.classList.remove('hidden');
        navbar.classList.add('scrolling-up');
        navbar.classList.add('scrolled');
        navbar.style.opacity = 1;
      }
    });
    lastScrollY = currentScrollY;
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-active');
      navLinks.classList.toggle('active');
    });

    navItems.forEach(item => {
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
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  reveals.forEach(reveal => {
    revealOnScroll.observe(reveal);
  });

  // Payload CMS Live Preview Handling
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'payload-live-preview') {
      const data = event.data.data;
      if (!data) return;
      
      // Generic DOM updater based on data-live-preview attribute
      document.querySelectorAll('[data-live-preview]').forEach(el => {
        const fieldName = el.getAttribute('data-live-preview');
        if (data[fieldName] !== undefined) {
          if (el.tagName === 'IMG') {
            el.src = data[fieldName]?.url || el.src;
          } else {
            el.textContent = data[fieldName];
          }
        }
      });

      // Specific fallbacks for the home page if no data attributes exist
      if (data.quote_text) {
        const quoteEl = document.querySelector('.quote-section blockquote');
        if (quoteEl) quoteEl.textContent = `"${data.quote_text}"`;
      }
      if (data.studio_description) {
        const studioDesc = document.querySelector('.studio-description');
        if (studioDesc) studioDesc.textContent = data.studio_description;
      }
    }
  });
});
