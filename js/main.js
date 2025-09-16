(() => {
  const root = document.documentElement;
  const body = document.body;
  const storageKey = 'theme-preference';
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const siteSurface = document.querySelector('.site-surface');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(pointer: fine)');
  const isMotionSafe = () => !motionQuery.matches;
  const hasFinePointer = () => pointerQuery.matches;

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      /* ignore */
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  };

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme ?? (systemPrefersDark.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  systemPrefersDark.addEventListener('change', (event) => {
    const preference = getStoredTheme();
    if (!preference) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  const closeNav = () => {
    header?.classList.remove('nav-open');
    primaryNav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('nav-open');
  };

  const toggleNav = () => {
    if (!header || !primaryNav || !navToggle) return;
    const isOpen = !header.classList.contains('nav-open');
    header.classList.toggle('nav-open', isOpen);
    primaryNav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    body.classList.toggle('nav-open', isOpen);
  };

  navToggle?.addEventListener('click', () => {
    toggleNav();
  });

  navBackdrop?.addEventListener('click', () => {
    closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeNav();
    }
  });

  document.querySelectorAll('.primary-nav a').forEach((link) => {
    link.addEventListener('click', () => closeNav());
  });

  let scrollAnimationFrame = null;
  let scrollCompletion = null;

  const smoothScrollTo = (targetY, duration = 900) =>
    new Promise((resolve) => {
      if (!isMotionSafe()) {
        window.scrollTo(0, targetY);
        resolve(true);
        return;
      }

      if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame);
        scrollAnimationFrame = null;
      }

      if (typeof scrollCompletion === 'function') {
        scrollCompletion(false);
        scrollCompletion = null;
      }

      const start = window.scrollY;
      const distance = targetY - start;

      if (Math.abs(distance) < 1) {
        window.scrollTo(0, targetY);
        resolve(true);
        scrollCompletion = null;
        return;
      }

      const startTime = performance.now();

      const step = (currentTime) => {
        const elapsed = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 4);
        window.scrollTo(0, start + distance * eased);

        if (elapsed < 1) {
          scrollAnimationFrame = requestAnimationFrame(step);
        } else {
          scrollAnimationFrame = null;
          const completion = scrollCompletion;
          scrollCompletion = null;
          (completion ?? resolve)(true);
        }
      };

      scrollCompletion = resolve;
      scrollAnimationFrame = requestAnimationFrame(step);
    });

  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) => {
    const href = link.getAttribute('href') ?? '';
    return href.length > 1 && !link.classList.contains('skip-link');
  });

  anchorLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      const targetId = link.hash.replace('#', '');
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();

      if (link.closest('.primary-nav')) {
        closeNav();
      }

      const headerOffset = (header?.offsetHeight ?? 0) + 24;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      const finished = await smoothScrollTo(Math.max(0, targetY));

      if (finished && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', `#${targetId}`);
      }
    });
  });

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  if (siteSurface) {
    let surfaceFrame = null;
    let surfaceActive = false;

    const applySurfaceMotion = () => {
      const offset = window.scrollY * -0.04;
      const rotation = Math.max(-6, Math.min(6, window.scrollY * 0.01));
      siteSurface.style.setProperty('--surface-shift', `${offset}px`);
      siteSurface.style.setProperty('--surface-rotate', `${rotation}deg`);
    };

    const handleSurfaceScroll = () => {
      if (surfaceFrame) return;
      surfaceFrame = requestAnimationFrame(() => {
        applySurfaceMotion();
        surfaceFrame = null;
      });
    };

    const enableSurfaceMotion = () => {
      if (surfaceActive || !isMotionSafe()) return;
      surfaceActive = true;
      applySurfaceMotion();
      window.addEventListener('scroll', handleSurfaceScroll, { passive: true });
    };

    const disableSurfaceMotion = () => {
      if (!surfaceActive) return;
      surfaceActive = false;
      window.removeEventListener('scroll', handleSurfaceScroll);
      if (surfaceFrame) {
        cancelAnimationFrame(surfaceFrame);
        surfaceFrame = null;
      }
      siteSurface.style.removeProperty('--surface-shift');
      siteSurface.style.removeProperty('--surface-rotate');
    };

    if (isMotionSafe()) {
      enableSurfaceMotion();
    }

    motionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        disableSurfaceMotion();
      } else {
        enableSurfaceMotion();
      }
    });
  }

  const navLinks = Array.from(document.querySelectorAll('[data-nav-target]'));
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.navTarget === id);
    });
  };

  if (navLinks.length) {
    const sections = navLinks
      .map((link) => document.getElementById(link.dataset.navTarget ?? ''))
      .filter((section) => section !== null);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        threshold: 0.45,
        rootMargin: '-32% 0px -46% 0px'
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
    const firstLink = navLinks[0];
    if (firstLink) {
      setActiveLink(firstLink.dataset.navTarget ?? '');
    }
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length && isMotionSafe()) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('in-view'));
  }

  const interactiveCards = document.querySelectorAll('.motion-card');

  const applyCardState = (card) => {
    const pointerActive = card.dataset.pointerActive === 'true';
    const focusActive = card.dataset.focusActive === 'true';

    if (pointerActive && isMotionSafe()) {
      card.style.setProperty('--glow-opacity', '0.85');
      card.style.setProperty('--card-shadow', '0 38px 86px -42px rgba(99, 91, 255, 0.52)');
      card.style.setProperty('--card-raise', '-14px');
      card.style.setProperty('--card-scale', '1.022');
    } else if (focusActive) {
      card.style.setProperty('--glow-opacity', '0.5');
      card.style.setProperty('--card-shadow', '0 32px 72px -40px rgba(99, 91, 255, 0.45)');
      if (isMotionSafe()) {
        card.style.setProperty('--card-raise', '-6px');
        card.style.setProperty('--card-scale', '1.01');
      } else {
        card.style.removeProperty('--card-raise');
        card.style.removeProperty('--card-scale');
      }
    } else {
      card.style.removeProperty('--glow-opacity');
      card.style.removeProperty('--card-shadow');
      card.style.removeProperty('--card-raise');
      card.style.removeProperty('--card-scale');
    }
  };

  if (interactiveCards.length) {
    const clearPointerState = (card) => {
      delete card.dataset.pointerActive;
      card.style.setProperty('--pointer-x', '50%');
      card.style.setProperty('--pointer-y', '50%');
      applyCardState(card);
    };

    if (isMotionSafe() && hasFinePointer()) {
      interactiveCards.forEach((card) => {
        card.addEventListener('pointerenter', (event) => {
          if (!isMotionSafe()) return;
          const rect = card.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.dataset.pointerActive = 'true';
          card.style.setProperty('--pointer-x', `${Math.min(100, Math.max(0, x))}%`);
          card.style.setProperty('--pointer-y', `${Math.min(100, Math.max(0, y))}%`);
          applyCardState(card);
        });

        card.addEventListener('pointermove', (event) => {
          if (!isMotionSafe()) return;
          const rect = card.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--pointer-x', `${Math.min(100, Math.max(0, x))}%`);
          card.style.setProperty('--pointer-y', `${Math.min(100, Math.max(0, y))}%`);
        });

        const cancelPointer = () => {
          clearPointerState(card);
        };

        card.addEventListener('pointerleave', cancelPointer);
        card.addEventListener('pointercancel', cancelPointer);
      });
    }

    interactiveCards.forEach((card) => {
      card.addEventListener('focusin', () => {
        card.dataset.focusActive = 'true';
        applyCardState(card);
      });

      card.addEventListener('focusout', () => {
        delete card.dataset.focusActive;
        applyCardState(card);
      });
    });

    motionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        interactiveCards.forEach((card) => {
          clearPointerState(card);
        });
      }
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm instanceof HTMLFormElement) {
    const statusEl = contactForm.querySelector('.form-status');
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!(statusEl instanceof HTMLElement)) return;
      statusEl.hidden = true;
      statusEl.classList.remove('success', 'error');

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: formData,
          headers: {
            Accept: 'application/json'
          }
        });

        if (response.ok) {
          contactForm.reset();
          statusEl.textContent = 'Сообщение отправлено!';
          statusEl.classList.add('success');
        } else {
          statusEl.textContent = 'Не удалось отправить. Попробуйте позже.';
          statusEl.classList.add('error');
        }
      } catch (error) {
        statusEl.textContent = 'Ошибка сети. Попробуйте позже.';
        statusEl.classList.add('error');
      }

      statusEl.hidden = false;
    });
  }

  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  body?.classList.remove('preload');
})();
