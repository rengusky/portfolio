const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

const themeStorageKey = 'ranga-theme';
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
themeToggle.innerHTML = `
  <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
  </svg>
  <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </svg>`;

const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)');

const getCurrentTheme = () => {
  const chosenTheme = document.documentElement.dataset.theme;
  return chosenTheme || (preferredTheme.matches ? 'dark' : 'light');
};

const updateThemeControl = () => {
  const currentTheme = getCurrentTheme();
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  themeToggle.dataset.currentTheme = currentTheme;
  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = currentTheme === 'dark' ? '#101012' : '#fafafa';
};

if (siteHeader) {
  siteHeader.insertBefore(themeToggle, navToggle || siteNav);
  updateThemeControl();

  themeToggle.addEventListener('click', () => {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      // The selected theme still applies for this page if storage is unavailable.
    }

    updateThemeControl();
  });

  preferredTheme.addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) updateThemeControl();
  });
}

if (siteHeader && navToggle && siteNav) {
  const closeNavigation = () => {
    siteHeader.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeNavigation();
      return;
    }

    siteHeader.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation');
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', closeNavigation);
}
