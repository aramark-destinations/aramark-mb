import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/aem.js', () => ({
  loadCSS: jest.fn(() => Promise.resolve()),
  toCamelCase: jest.fn((str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())),
  toClassName: jest.fn((str) => str.toLowerCase().replace(/[^a-z0-9]/g, '-')),
  readBlockConfig: jest.fn(() => ({})),
}));

jest.mock('../../scripts/baici/utils/utils.js', () => ({
  fetchSvg: jest.fn(() => Promise.resolve('<svg></svg>')),
}));

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
}));

// navigation.js captures isDesktop at module level — control via matchMedia mock
function setMatchMedia(matches) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
}

// ─── resetMenuState — desktop ─────────────────────────────────────────────────

describe('resetMenuState — desktop mode', () => {
  let resetMenuState;

  beforeEach(async () => {
    jest.resetModules();
    setMatchMedia(true); // desktop
    ({ resetMenuState } = await import('./navigation.js'));
  });

  it('sets navigation-section-button aria-expanded to false', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="true">Menu</button>
      <button class="navigation-group-button" aria-expanded="false">Group</button>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-section-button').getAttribute('aria-expanded')).toBe('false');
  });

  it('sets navigation-group-button aria-expanded to true', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="true">Menu</button>
      <button class="navigation-group-button" aria-expanded="false">Group</button>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-group-button').getAttribute('aria-expanded')).toBe('true');
  });

  it('does not remove overlays in desktop mode', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="true">Menu</button>
      <div class="navigation-overlay">Overlay</div>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-overlay')).not.toBeNull();
  });
});

// ─── resetMenuState — mobile ──────────────────────────────────────────────────

describe('resetMenuState — mobile mode', () => {
  let resetMenuState;

  beforeEach(async () => {
    jest.resetModules();
    setMatchMedia(false); // mobile
    ({ resetMenuState } = await import('./navigation.js'));
  });

  it('collapses expanded navigation-section-button', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="true">Menu</button>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-section-button').getAttribute('aria-expanded')).toBe('false');
  });

  it('collapses expanded navigation-group-button', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-group-button" aria-expanded="true">Group</button>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-group-button').getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves already-collapsed buttons untouched', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="false">Menu</button>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-section-button').getAttribute('aria-expanded')).toBe('false');
  });

  it('removes navigation-overlay elements', () => {
    const section = document.createElement('div');
    section.innerHTML = `
      <button class="navigation-section-button" aria-expanded="true">Menu</button>
      <div class="navigation-overlay">Overlay</div>
    `;
    resetMenuState(section);
    expect(section.querySelector('.navigation-overlay')).toBeNull();
  });
});

// ─── updateSubMenuHeight ──────────────────────────────────────────────────────

describe('updateSubMenuHeight', () => {
  let updateSubMenuHeight;

  beforeEach(async () => {
    jest.resetModules();
    setMatchMedia(false);
    ({ updateSubMenuHeight } = await import('./navigation.js'));
  });

  it('sets --row-span CSS variable on each navigation-group', () => {
    const submenu = document.createElement('ul');
    submenu.className = 'navigation-section-submenu';
    submenu.innerHTML = `
      <li class="navigation-item">Item 1</li>
      <li class="navigation-item">Item 2</li>
      <div class="navigation-group">Group</div>
    `;
    const child = submenu.querySelector('.navigation-group');

    updateSubMenuHeight(child);

    expect(child.style.getPropertyValue('--row-span')).toBe('2');
  });

  it('sets --row-span to 0 when no navigation-item elements exist', () => {
    const submenu = document.createElement('ul');
    submenu.className = 'navigation-section-submenu';
    submenu.innerHTML = '<div class="navigation-group">Empty Group</div>';
    const child = submenu.querySelector('.navigation-group');

    updateSubMenuHeight(child);

    expect(child.style.getPropertyValue('--row-span')).toBe('0');
  });
});
