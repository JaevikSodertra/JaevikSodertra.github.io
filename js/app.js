// Тема
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
const initial = saved ?? 'light';
document.documentElement.setAttribute('data-theme', initial);
themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('theme', current);
});

// Мобильное меню
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('mainNav');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Год в футере
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); navList?.classList.remove('open'); }
  });
});

// Scroll-анимации
const items = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
items.forEach(el => io.observe(el));

// Модалки проектов
const openers = document.querySelectorAll('.project[data-modal]');
openers.forEach(card => {
  const id = card.getAttribute('data-modal');
  const open = () => document.getElementById(id)?.classList.add('open');
  card.querySelector('button')?.addEventListener('click', (ev) => { ev.stopPropagation(); open(); });
  card.addEventListener('click', (ev) => { if (ev.target.tagName.toLowerCase() !== 'button') open(); });
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.hasAttribute('data-close')) m.classList.remove('open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const open = document.querySelector('.modal.open');
    if (open) open.classList.remove('open');
  }
});

// Разворачиваем отзывы
document.querySelectorAll('.quote .more').forEach(btn => {
  btn.addEventListener('click', () => {
    const block = btn.parentElement.querySelector('.quote-text');
    const collapsed = block.hasAttribute('data-collapsed');
    if (collapsed) {
      block.removeAttribute('data-collapsed');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Свернуть';
    } else {
      block.setAttribute('data-collapsed', '');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Читать полностью';
    }
  });
});

// Отправка формы
const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = contactForm.querySelector('.form-status');
  if (!statusEl) return;
  statusEl.hidden = true;
  const data = new FormData(contactForm);
  try {
    const response = await fetch(contactForm.action, {
      method: contactForm.method,
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      contactForm.reset();
      statusEl.textContent = 'Сообщение отправлено!';
      statusEl.className = 'form-status success';
    } else {
      statusEl.textContent = 'Ошибка при отправке. Попробуйте позже.';
      statusEl.className = 'form-status error';
    }
  } catch (err) {
    statusEl.textContent = 'Ошибка сети. Попробуйте позже.';
    statusEl.className = 'form-status error';
  }
  statusEl.hidden = false;
});

