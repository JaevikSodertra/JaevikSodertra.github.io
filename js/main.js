(() => {
  const root = document.documentElement;
  const body = document.body;
  const storageKey = 'theme-preference';
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const greetingText = document.querySelector('[data-greeting-text]');
  const greetingTime = document.querySelector('[data-greeting-time]');
  const nowRotator = document.querySelector('[data-now-rotator]');
  const contactResponse = document.querySelector('[data-contact-response]');
  const contactDefaultMessage =
    contactResponse?.dataset.contactDefault?.trim() ?? contactResponse?.textContent?.trim() ?? '';

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

  let scrollFocusTimeout;
  const focusAfterScroll = (element) => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const hadTabIndex = element.hasAttribute('tabindex');
    if (!hadTabIndex) {
      element.setAttribute('tabindex', '-1');
    }

    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }

    if (!hadTabIndex) {
      element.addEventListener(
        'blur',
        () => {
          element.removeAttribute('tabindex');
        },
        { once: true }
      );
    }
  };

  const smoothScrollTo = (target, options = {}) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const { instant = false } = options;
    const headerOffset = header?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const destination = Math.min(Math.max(targetTop, 0), Math.max(maxScroll, 0));

    if (prefersReducedMotion.matches || instant) {
      window.scrollTo(0, destination);
      focusAfterScroll(target);
      return;
    }

    try {
      window.scrollTo({
        top: destination,
        behavior: 'smooth'
      });
    } catch (error) {
      window.scrollTo(0, destination);
    }

    window.clearTimeout(scrollFocusTimeout);
    scrollFocusTimeout = window.setTimeout(() => focusAfterScroll(target), 380);
  };

  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]:not([href="#"])'));
  anchorLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const targetId = href?.slice(1);
    if (!targetId) {
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      return;
    }

    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      const instant = link.classList.contains('skip-link');
      smoothScrollTo(targetElement, { instant });
    });
  });

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const updateScrollProgress = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) {
      root.style.setProperty('--scroll-progress', '0%');
      return;
    }

    const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
    root.style.setProperty('--scroll-progress', `${(progress * 100).toFixed(2)}%`);
  };

  const handleScroll = () => {
    updateHeaderState();
    updateScrollProgress();
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const MOSCOW_UTC_OFFSET_MINUTES = -180;
  const greetingTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const updateGreeting = () => {
    if (!greetingText && !greetingTime) {
      return;
    }

    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const offsetDiff = (MOSCOW_UTC_OFFSET_MINUTES - localOffset) * 60_000;
    const moscowDate = new Date(now.getTime() + offsetDiff);
    const hour = moscowDate.getHours();

    let message = 'Привет!';
    if (hour >= 5 && hour < 12) {
      message = 'Доброе утро! Смотрю свежие метрики и готов обсудить гипотезы.';
    } else if (hour >= 12 && hour < 17) {
      message = 'Добрый день! Погружён в продуктовые решения и архитектуру данных.';
    } else if (hour >= 17 && hour < 22) {
      message = 'Добрый вечер! Подвожу итоги по пайплайнам и планирую эксперименты.';
    } else {
      message = 'Доброй ночи! Дежурю за стабильность данных и алертов.';
    }

    if (greetingText) {
      greetingText.textContent = message;
    }

    if (greetingTime) {
      greetingTime.dateTime = moscowDate.toISOString();
      greetingTime.textContent = greetingTimeFormatter.format(moscowDate);
    }
  };

  if (greetingText || greetingTime) {
    updateGreeting();
    window.setInterval(updateGreeting, 60_000);
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
  revealElements.forEach((element, index) => {
    const customDelay = element.dataset.revealDelay;
    if (customDelay) {
      element.style.setProperty('--reveal-delay', customDelay);
      return;
    }

    if (!element.style.getPropertyValue('--reveal-delay')) {
      const delay = Math.min(index * 80, 480);
      element.style.setProperty('--reveal-delay', `${delay}ms`);
    }
  });

  if (revealElements.length && !prefersReducedMotion.matches) {
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

  const nowItems = nowRotator ? Array.from(nowRotator.querySelectorAll('[data-now-item]')) : [];
  let nowRotationIndex = 0;
  let nowRotationId;

  const updateNowActive = (index) => {
    if (!nowItems.length) {
      return;
    }

    nowItems.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  };

  const stopNowRotation = () => {
    if (nowRotationId) {
      window.clearInterval(nowRotationId);
      nowRotationId = undefined;
    }
  };

  const startNowRotation = () => {
    if (nowItems.length <= 1) {
      return;
    }

    stopNowRotation();
    nowRotationId = window.setInterval(() => {
      nowRotationIndex = (nowRotationIndex + 1) % nowItems.length;
      updateNowActive(nowRotationIndex);
    }, 5200);
  };

  if (nowItems.length) {
    nowRotationIndex = 0;
    updateNowActive(nowRotationIndex);
    if (!prefersReducedMotion.matches && nowItems.length > 1) {
      startNowRotation();
    }
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      revealElements.forEach((element) => element.classList.add('in-view'));
      stopNowRotation();
      nowRotationIndex = 0;
      updateNowActive(nowRotationIndex);
    } else if (nowItems.length > 1) {
      nowRotationIndex = 0;
      updateNowActive(nowRotationIndex);
      startNowRotation();
    }
  });

  const setContactResponseMessage = (value) => {
    if (!contactResponse) {
      return;
    }

    const trimmed = value?.trim();
    if (trimmed) {
      contactResponse.textContent = `Спасибо, ${trimmed}! Подготовлю для вас план и отвечу в течение дня.`;
    } else {
      contactResponse.textContent = contactDefaultMessage;
    }
  };

  if (contactResponse) {
    setContactResponseMessage('');
  }

  const contactForm = document.querySelector('.contact-form');
  const contactNameInput = contactForm?.querySelector('input[name="name"]');

  const refreshContactResponse = () => {
    setContactResponseMessage(contactNameInput?.value ?? '');
  };

  if (contactNameInput) {
    contactNameInput.addEventListener('input', refreshContactResponse);
    refreshContactResponse();
  }

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
          refreshContactResponse();
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
