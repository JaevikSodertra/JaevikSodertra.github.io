(() => {
  const root = document.documentElement;
  const body = document.body;
  const storageKey = 'theme-preference';
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');
  const navBackdrop = document.querySelector('.nav-backdrop');

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

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

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
  if (revealElements.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
