import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

global.window.hlx = { codeBasePath: '' };

// mock-prefixed vars are allowed in jest.mock() factories (jest hoisting rule)
const mockBuildBlock = jest.fn();

jest.mock('../../scripts/aem.js', () => ({
  loadCSS: jest.fn(() => Promise.resolve()),
  buildBlock: mockBuildBlock,
  decorateBlock: jest.fn(),
  loadBlock: jest.fn(() => Promise.resolve()),
}));

jest.mock('../fragment/fragment.js', () => ({
  loadFragment: jest.fn(),
}));

// jsdom may not have showModal/close on dialog — ensure they exist
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// ─── createModal ──────────────────────────────────────────────────────────────

describe('createModal', () => {
  let createModal;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '<main></main>';

    // Set up buildBlock to return a real DOM element (can use document here in beforeEach)
    mockBuildBlock.mockImplementation(() => {
      const block = document.createElement('div');
      block.className = 'modal';
      return block;
    });

    ({ createModal } = await import('./modal.js'));
  });

  it('creates a <dialog> element inside the block', async () => {
    const { block } = await createModal([document.createElement('p')]);
    expect(block.querySelector('dialog')).not.toBeNull();
  });

  it('dialog contains a .modal-content div', async () => {
    const { block } = await createModal([document.createElement('p')]);
    expect(block.querySelector('.modal-content')).not.toBeNull();
  });

  it('content nodes are appended inside modal-content', async () => {
    const p = document.createElement('p');
    p.textContent = 'Hello modal';
    const { block } = await createModal([p]);
    expect(block.querySelector('.modal-content').textContent).toBe('Hello modal');
  });

  it('creates a close button with class close-button', async () => {
    const { block } = await createModal([document.createElement('p')]);
    expect(block.querySelector('button.close-button')).not.toBeNull();
  });

  it('close button has aria-label="Close"', async () => {
    const { block } = await createModal([document.createElement('p')]);
    expect(block.querySelector('button.close-button').getAttribute('aria-label')).toBe('Close');
  });

  it('clicking close button calls dialog.close()', async () => {
    const { block } = await createModal([document.createElement('p')]);
    const dialog = block.querySelector('dialog');
    const closeSpy = jest.spyOn(dialog, 'close');
    block.querySelector('button.close-button').click();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('returns a showModal function', async () => {
    const result = await createModal([document.createElement('p')]);
    expect(typeof result.showModal).toBe('function');
  });
});

describe('createModal — dialog close event', () => {
  let createModal;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '<main></main>';
    mockBuildBlock.mockImplementation(() => {
      const block = document.createElement('div');
      block.className = 'modal';
      return block;
    });
    ({ createModal } = await import('./modal.js'));
  });

  it('removes modal-open class from body when dialog closes', async () => {
    const { block } = await createModal([document.createElement('p')]);
    document.body.classList.add('modal-open');
    block.querySelector('dialog').dispatchEvent(new Event('close'));
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });
});
