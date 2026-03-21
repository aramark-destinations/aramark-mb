import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/aem.js', () => ({
  readBlockConfig: jest.fn(() => ({})),
}));

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
  moveInstrumentation: jest.fn(),
}));

jest.mock('../../scripts/placeholders.js', () => ({
  fetchPlaceholders: jest.fn(() => Promise.resolve({})),
}));

// jsdom does not implement matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

// Suppress focus errors from jsdom (elements must be connected to focus)
jest.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => {});

// ─── generateSlug ────────────────────────────────────────────────────────────

describe('generateSlug', () => {
  let generateSlug;

  beforeEach(async () => {
    jest.resetModules();
    ({ generateSlug } = await import('./tabs.js'));
  });

  it('lowercases the title', () => {
    expect(generateSlug('My Tab')).toBe('my-tab');
  });

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('hello world')).toBe('hello-world');
  });

  it('removes non-alphanumeric characters (except hyphens)', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple hyphens into one', () => {
    expect(generateSlug('foo  --  bar')).toBe('foo-bar');
  });

  it('trims leading and trailing whitespace', () => {
    expect(generateSlug('  tab  ')).toBe('tab');
  });

  it('returns the base slug when existingSlugs is empty', () => {
    expect(generateSlug('my tab', [])).toBe('my-tab');
  });

  it('appends -2 when slug already exists', () => {
    expect(generateSlug('my tab', ['my-tab'])).toBe('my-tab-2');
  });

  it('increments suffix until unique', () => {
    expect(generateSlug('my tab', ['my-tab', 'my-tab-2'])).toBe('my-tab-3');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});

// ─── decorate ────────────────────────────────────────────────────────────────

function buildTwoTabBlock() {
  const block = document.createElement('div');
  block.className = 'tabs';
  block.innerHTML = `
    <div>
      <div><p>Tab One</p></div>
      <div><p>Panel One content</p></div>
    </div>
    <div>
      <div><p>Tab Two</p></div>
      <div><p>Panel Two content</p></div>
    </div>
  `;
  document.body.appendChild(block);
  return block;
}

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildTwoTabBlock();
    ({ decorate } = await import('./tabs.js'));
  });

  it('fires tabs:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('tabs:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires tabs:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('tabs:after', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook when provided', async () => {
    const onBefore = jest.fn();
    await decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  it('calls onAfter hook when provided', async () => {
    const onAfter = jest.fn();
    await decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalledTimes(1);
  });
});

describe('decorate — tab button ARIA', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildTwoTabBlock();
    ({ decorate } = await import('./tabs.js'));
    await decorate(block);
  });

  it('creates one button per tab', () => {
    expect(block.querySelectorAll('.tabs-tab').length).toBe(2);
  });

  it('first tab is selected (aria-selected=true)', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('second tab is not selected (aria-selected=false)', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    expect(buttons[1].getAttribute('aria-selected')).toBe('false');
  });

  it('first tab has tabindex=0', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
  });

  it('second tab has tabindex=-1', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    expect(buttons[1].getAttribute('tabindex')).toBe('-1');
  });

  it('each button has role=tab', () => {
    block.querySelectorAll('.tabs-tab').forEach((btn) => {
      expect(btn.getAttribute('role')).toBe('tab');
    });
  });

  it('buttons get a data-tab-slug derived from the tab title', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    expect(buttons[0].dataset.tabSlug).toMatch(/^tab-one-block-\d+$/);
    expect(buttons[1].dataset.tabSlug).toMatch(/^tab-two-block-\d+$/);
  });
});

describe('decorate — panel ARIA', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildTwoTabBlock();
    ({ decorate } = await import('./tabs.js'));
    await decorate(block);
  });

  it('creates one panel per tab', () => {
    expect(block.querySelectorAll('.tabs-panel').length).toBe(2);
  });

  it('first panel is visible (aria-hidden=false)', () => {
    const panels = block.querySelectorAll('.tabs-panel');
    expect(panels[0].getAttribute('aria-hidden')).toBe('false');
  });

  it('second panel is hidden (aria-hidden=true)', () => {
    const panels = block.querySelectorAll('.tabs-panel');
    expect(panels[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('each panel has role=tabpanel', () => {
    block.querySelectorAll('.tabs-panel').forEach((panel) => {
      expect(panel.getAttribute('role')).toBe('tabpanel');
    });
  });
});

describe('decorate — tab click activation', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildTwoTabBlock();
    ({ decorate } = await import('./tabs.js'));
    await decorate(block);
  });

  it('clicking second tab marks it selected', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    buttons[1].click();
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].getAttribute('aria-selected')).toBe('false');
  });

  it('clicking second tab shows its panel', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    const panels = block.querySelectorAll('.tabs-panel');
    buttons[1].click();
    expect(panels[1].getAttribute('aria-hidden')).toBe('false');
    expect(panels[0].getAttribute('aria-hidden')).toBe('true');
  });
});

describe('decorate — keyboard navigation', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = buildTwoTabBlock();
    ({ decorate } = await import('./tabs.js'));
    await decorate(block);
  });

  function fireKeydown(target, key) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    target.dispatchEvent(event);
    return event;
  }

  it('ArrowRight on first tab activates second tab', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    // Focus first button so handleKeydown treats it as active
    jest.spyOn(document, 'activeElement', 'get').mockReturnValue(buttons[0]);
    block.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  });

  it('Home key activates first tab', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    buttons[1].click(); // move to tab 2 first
    jest.spyOn(document, 'activeElement', 'get').mockReturnValue(buttons[1]);
    block.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('End key activates last tab', () => {
    const buttons = block.querySelectorAll('.tabs-tab');
    jest.spyOn(document, 'activeElement', 'get').mockReturnValue(buttons[0]);
    block.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  });
});
