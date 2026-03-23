import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
}));

// matchMedia stub — jsdom does not support it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn((query) => ({
    matches: false,
    media: query,
  })),
});

const mockDLPush = jest.fn();
global.window.adobeDataLayer = { push: mockDLPush };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRow({
  title = 'Title', subtitle = '', content = 'Content', col4 = '', aueResource = false,
} = {}) {
  const row = document.createElement('div');
  if (aueResource) row.setAttribute('data-aue-resource', 'urn:aem:something');
  row.innerHTML = `
    <div><p>${title}</p></div>
    <div>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
    <div><p>${content}</p></div>
    ${col4 !== '' ? `<div><p>${col4}</p></div>` : ''}
  `;
  return row;
}

function makeBlock(rows = []) {
  const block = document.createElement('div');
  block.className = 'accordion';
  rows.forEach((row) => block.appendChild(row));
  return block;
}

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = makeBlock([makeRow()]);
    document.body.appendChild(block);
    ({ decorate } = await import('./accordion.js'));
  });

  it('fires accordion:before event', () => {
    const listener = jest.fn();
    block.addEventListener('accordion:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires accordion:after event', () => {
    const listener = jest.fn();
    block.addEventListener('accordion:after', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook when provided', () => {
    const onBefore = jest.fn();
    decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  it('calls onAfter hook when provided', () => {
    const onAfter = jest.fn();
    decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalledTimes(1);
  });
});

// ─── decorate — DOM structure ─────────────────────────────────────────────────

describe('decorate — DOM structure', () => {
  let decorate;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    ({ decorate } = await import('./accordion.js'));
  });

  it('converts rows to <details> elements', () => {
    const block = makeBlock([makeRow({ title: 'A' }), makeRow({ title: 'B' })]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelectorAll('details').length).toBe(2);
  });

  it('uses <summary> for the title', () => {
    const block = makeBlock([makeRow({ title: 'My Title' })]);
    document.body.appendChild(block);
    decorate(block);
    const summary = block.querySelector('summary');
    expect(summary).not.toBeNull();
    expect(summary.querySelector('.accordion-title').textContent).toBe('My Title');
  });

  it('renders subtitle when second column has content', () => {
    const block = makeBlock([makeRow({ subtitle: 'Sub' })]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelector('.accordion-subtitle').textContent).toBe('Sub');
  });

  it('removes row with no text and no data-aue-resource', () => {
    const emptyRow = document.createElement('div');
    emptyRow.innerHTML = '<div></div><div></div><div></div>';
    const block = makeBlock([emptyRow, makeRow()]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelectorAll('details').length).toBe(1);
  });

  it('keeps row with no text but with data-aue-resource (authoring)', () => {
    const row = document.createElement('div');
    row.setAttribute('data-aue-resource', 'urn:aem:thing');
    row.innerHTML = '<div></div><div></div><div></div>';
    const block = makeBlock([row]);
    document.body.appendChild(block);
    decorate(block);
    // Should not be removed (has aue-resource)
    expect(block.querySelectorAll('details').length).toBe(1);
  });
});

// ─── collapsed-by-default config ─────────────────────────────────────────────

describe('decorate — collapsed-by-default', () => {
  let decorate;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    ({ decorate } = await import('./accordion.js'));
  });

  it('is collapsed by default (no config)', () => {
    const block = makeBlock([makeRow()]);
    document.body.appendChild(block);
    decorate(block);
    const details = block.querySelector('details');
    expect(details.open).toBe(false);
  });

  it('col4 value "false" → expanded by default', () => {
    const block = makeBlock([makeRow({ col4: 'false' })]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelector('details').open).toBe(true);
  });

  it('col4 value "true" → collapsed', () => {
    const block = makeBlock([makeRow({ col4: 'true' })]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelector('details').open).toBe(false);
  });

  it('dataset.collapsedByDefault="false" → expanded', () => {
    const row = makeRow();
    row.dataset.collapsedByDefault = 'false';
    const block = makeBlock([row]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelector('details').open).toBe(true);
  });

  it('dataset.collapsedByDefault="true" → collapsed', () => {
    const row = makeRow();
    row.dataset.collapsedByDefault = 'true';
    const block = makeBlock([row]);
    document.body.appendChild(block);
    decorate(block);
    expect(block.querySelector('details').open).toBe(false);
  });
});

// ─── analytics ────────────────────────────────────────────────────────────────

describe('decorate — analytics', () => {
  let decorate;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    mockDLPush.mockClear();
    ({ decorate } = await import('./accordion.js'));
  });

  it('pushes accordion_panel_expanded when details opens', () => {
    const block = makeBlock([makeRow({ title: 'FAQ' })]);
    document.body.appendChild(block);
    decorate(block);

    const details = block.querySelector('details');
    // Simulate opening
    details.open = true;
    details.dispatchEvent(new Event('toggle'));

    expect(mockDLPush).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'accordion_panel_expanded' }),
    );
  });

  it('pushes accordion_panel_collapsed when details closes', () => {
    const block = makeBlock([makeRow({ col4: 'false' })]);
    document.body.appendChild(block);
    decorate(block);

    const details = block.querySelector('details');
    // Details starts open; simulate closing
    details.open = false;
    details.dispatchEvent(new Event('toggle'));

    expect(mockDLPush).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'accordion_panel_collapsed' }),
    );
  });

  it('includes accordionTitle in analytics payload', () => {
    const block = makeBlock([makeRow({ title: 'My FAQ' })]);
    document.body.appendChild(block);
    decorate(block);

    const details = block.querySelector('details');
    details.open = true;
    details.dispatchEvent(new Event('toggle'));

    const call = mockDLPush.mock.calls[0][0];
    expect(call.eventInfo.accordionTitle).toBe('My FAQ');
  });

  it('includes accordionIndex in analytics payload', () => {
    const block = makeBlock([makeRow({ title: 'First' }), makeRow({ title: 'Second' })]);
    document.body.appendChild(block);
    decorate(block);

    const allDetails = block.querySelectorAll('details');
    allDetails[1].open = true;
    allDetails[1].dispatchEvent(new Event('toggle'));

    const call = mockDLPush.mock.calls[0][0];
    expect(call.eventInfo.accordionIndex).toBe(1);
  });
});

// ─── keyboard navigation ─────────────────────────────────────────────────────

describe('decorate — keyboard navigation', () => {
  let decorate;
  const focusMock = jest.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => {});

  beforeEach(async () => {
    jest.resetModules();
    focusMock.mockClear();
    document.body.innerHTML = '';
    ({ decorate } = await import('./accordion.js'));
  });

  it('Home key focuses the first summary', () => {
    const block = makeBlock([makeRow({ title: 'A' }), makeRow({ title: 'B' })]);
    document.body.appendChild(block);
    decorate(block);

    const summaries = block.querySelectorAll('summary');
    summaries[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

    expect(focusMock).toHaveBeenCalledTimes(1);
    // The call should have been on the first summary
    expect(focusMock.mock.instances[0]).toBe(summaries[0]);
  });

  it('End key focuses the last summary', () => {
    const block = makeBlock([makeRow({ title: 'A' }), makeRow({ title: 'B' }), makeRow({ title: 'C' })]);
    document.body.appendChild(block);
    decorate(block);

    const summaries = block.querySelectorAll('summary');
    summaries[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    expect(focusMock).toHaveBeenCalledTimes(1);
    expect(focusMock.mock.instances[0]).toBe(summaries[2]);
  });
});
