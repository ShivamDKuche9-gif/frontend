/**
 * National Digital Gateway Portal
 * Navbar Controller & Video Blur-Reveal Engine
 */

(function () {
  'use strict';

  function initPortal() {
    /* ------------------------------------------------------------------------
       1. NAVBAR CONTROLLER (PRESERVED)
       ------------------------------------------------------------------------ */
    const navbar = document.getElementById('mainNavbar');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (navbar) {
      const updateNavbarState = () => {
        // Turns translucent green glass past 30px scroll
        if (window.scrollY > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };

      let isTicking = false;
      window.addEventListener('scroll', () => {
        if (!isTicking) {
          window.requestAnimationFrame(() => {
            updateNavbarState();
            isTicking = false;
          });
          isTicking = true;
        }
      }, { passive: true });

      updateNavbarState(); // Initial run
    }

    // Mobile drawer toggle
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        mobileBtn.classList.toggle('active', isOpen);
        mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && !navMenu.contains(e.target)) {
          navMenu.classList.remove('open');
          mobileBtn.classList.remove('active');
          mobileBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    /* ------------------------------------------------------------------------
       2. 4K VIDEO FADE-IN BLUR REVEAL
       ------------------------------------------------------------------------ */
    const bgVideo = document.getElementById('bgVideo');

    if (bgVideo) {
      const revealVideo = () => {
        bgVideo.classList.add('video-loaded');
      };

      // When the video has buffered enough frames to play
      if (bgVideo.readyState >= 3) {
        revealVideo();
      } else {
        bgVideo.addEventListener('canplay', revealVideo, { once: true });
        bgVideo.addEventListener('loadeddata', revealVideo, { once: true });
      }

      // Safety timeout: Ensures reveal even if caching or autoplay is delayed
      setTimeout(revealVideo, 800);
    }
  }

  // Safe DOM Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
  } else {
    initPortal();
  }
})();














/* ------------------------------------------------------------------------
   3. INSIGHTS 3D GLASS CARDS CONTROLLER
   ------------------------------------------------------------------------ */
const insightCards = document.querySelectorAll('.insight-card');

insightCards.forEach((card) => {
  // Click to toggle active highlight state
  card.addEventListener('click', () => {
    insightCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
  });

  // Dynamic 3D mouse parallax tilt
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const tiltX = (y / (rect.height / 2)) * -8;
    const tiltY = (x / (rect.width / 2)) * 8;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});












/* ------------------------------------------------------------------------
   4. FAQ ACCORDION & SCROLL ENTRANCE CONTROLLER
   ------------------------------------------------------------------------ */
(function initFAQ() {
  // 1. Single-Open Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');

    button.addEventListener('click', () => {
      const isAlreadyOpen = item.classList.contains('active');

      // Close all items (Single Accordion Mode)
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('active');
        const otherBtn = otherItem.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // If it wasn't open, open it
      if (!isAlreadyOpen) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 2. Scroll-Triggered Entrance Reveal (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target); // Trigger animation once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach((el) => el.classList.add('revealed'));
  }
})();


















/* ------------------------------------------------------------------------
   5. FOOTER INTERACTIVE COPY EMAIL CONTROLLER
   ------------------------------------------------------------------------ */
(function initFooterContact() {
  const copyCard = document.getElementById('copyEmailCard');
  const emailText = document.getElementById('emailText');
  const feedbackBadge = document.getElementById('copyFeedbackBadge');

  if (copyCard && emailText && feedbackBadge) {
    copyCard.addEventListener('click', () => {
      const email = emailText.innerText.trim();

      navigator.clipboard.writeText(email)
        .then(() => {
          feedbackBadge.innerText = 'Copied!';
          feedbackBadge.style.background = '#34d399'; // Emerald confirmation
          feedbackBadge.style.color = '#020b18';
          feedbackBadge.style.borderColor = '#34d399';

          setTimeout(() => {
            feedbackBadge.innerText = 'Copy';
            feedbackBadge.style.background = '';
            feedbackBadge.style.color = '';
            feedbackBadge.style.borderColor = '';
          }, 2000);
        })
        .catch((err) => {
          console.warn('Clipboard copy failed:', err);
        });
    });
  }
})();

















/* ------------------------------------------------------------------------
   6. NATIONAL TELEMETRY DASHBOARD TABS CONTROLLER
   ------------------------------------------------------------------------ */
(function initNationalDashboard() {
  const tabButtons = document.querySelectorAll('.dash-tab-btn');
  const panels = document.querySelectorAll('.dash-panel');

  if (!tabButtons.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-tab');

      // Update active tab button state
      tabButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Show matching module panel
      panels.forEach((panel) => {
        if (panel.getAttribute('id') === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
})();





















/* ------------------------------------------------------------------------
   7. FROSTED WHITE & IMPERIAL GOLD INDIA MAP (OFFLINE RELIABLE)
   ------------------------------------------------------------------------ */
(function initOfficialIndiaMap() {
  const svgMap = document.getElementById('officialIndiaSvg');
  const viewportBox = document.getElementById('mapViewportBox');
  const hud = document.getElementById('floatingGoldHud');

  // Ensure dataset from india-data.js exists
  if (!svgMap || !viewportBox || !hud || !window.INDIA_MAP_DATA) return;

  const hudStateCode = document.getElementById('hudStateCode');
  const hudStateName = document.getElementById('hudStateName');
  const hudAcqRate = document.getElementById('hudAcqRate');
  const hudProjects = document.getElementById('hudProjects');
  const hudProposed = document.getElementById('hudProposed');
  const hudAcquired = document.getElementById('hudAcquired');
  const hudCompensation = document.getElementById('hudCompensation');
  const hudLitigation = document.getElementById('hudLitigation');
  const hudTier = document.getElementById('hudTier');

  // Render official Survey of India boundaries dynamically from local data
  svgMap.innerHTML = '';
  window.INDIA_MAP_DATA.forEach((state) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', state.path);
    path.setAttribute('class', 'official-state-path');
    path.setAttribute('data-code', state.code);
    path.setAttribute('data-name', state.name);
    path.setAttribute('data-rate', state.rate);
    path.setAttribute('data-projects', state.projects);
    path.setAttribute('data-proposed', state.proposed);
    path.setAttribute('data-acquired', state.acquired);
    path.setAttribute('data-comp', state.compensation);
    path.setAttribute('data-stay', state.litigation);
    path.setAttribute('data-tier', state.tier);

    svgMap.appendChild(path);
  });

  let isHovering = false;

  // Smooth floating cursor follower
  window.addEventListener('mousemove', (e) => {
    if (isHovering) {
      const cardWidth = 310;
      const cardHeight = 220;
      const finalLeft = Math.min(e.clientX + 20, window.innerWidth - cardWidth - 15);
      const finalTop = Math.min(Math.max(e.clientY - 30, 15), window.innerHeight - cardHeight - 15);

      hud.style.left = `${finalLeft}px`;
      hud.style.top = `${finalTop}px`;
    }
  });

  // State Hover & 3D Lift-Up Handler
  const statePaths = svgMap.querySelectorAll('.official-state-path');
  statePaths.forEach((path) => {
    path.addEventListener('mouseenter', () => {
      isHovering = true;
      hud.classList.add('is-visible');

      // Bring hovered state to the very top of the SVG stack so shadow doesn't get clipped
      path.parentNode.appendChild(path);

      // Populate Floating Golden HUD with State Telemetry
      hudStateCode.innerText = `STATE JURISDICTION • ${path.dataset.code}`;
      hudStateName.innerText = path.dataset.name;
      hudAcqRate.innerText = path.dataset.rate;
      hudProjects.innerText = path.dataset.projects;
      hudProposed.innerText = path.dataset.proposed;
      hudAcquired.innerText = path.dataset.acquired;
      hudCompensation.innerText = path.dataset.comp;
      hudLitigation.innerText = path.dataset.stay;
      hudTier.innerText = path.dataset.tier;
    });

    path.addEventListener('mouseleave', () => {
      path.classList.remove('active-lift');
    });
  });

  viewportBox.addEventListener('mouseleave', () => {
    isHovering = false;
    hud.classList.remove('is-visible');
  });
})();