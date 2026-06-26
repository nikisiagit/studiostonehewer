document.addEventListener('DOMContentLoaded', () => {
  // Custom Cursor
  const cursor = document.querySelector('.cursor');
  const interactables = document.querySelectorAll('a, button, .hero-logo, .about-image img, .project-card-img, .full-width-img, .masonry-item, .project-header-img');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  // Fade out hero nav on scroll down, fade in on scroll up
  const heroNav = document.querySelector('.hero-nav');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (heroNav) {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        // At top
        heroNav.classList.remove('hidden');
        heroNav.classList.remove('scrolling-up');
        heroNav.style.opacity = 1;
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        heroNav.classList.add('hidden');
        heroNav.classList.remove('scrolling-up');
      } else {
        // Scrolling up
        heroNav.classList.remove('hidden');
        heroNav.classList.add('scrolling-up');
        heroNav.style.opacity = 1;
      }
      lastScrollY = currentScrollY;
    }
  });

  // Nav Scroll Effect
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
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
});
