import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
}));

jest.mock('./form-fields.js', () => jest.fn(() => Promise.resolve(null)));

// ─── generatePayload ──────────────────────────────────────────────────────────

describe('generatePayload', () => {
  let generatePayload;

  beforeEach(async () => {
    jest.resetModules();
    ({ generatePayload } = await import('./form.js'));
  });

  function makeForm(html) {
    const form = document.createElement('form');
    form.innerHTML = html;
    return form;
  }

  it('includes text field value', () => {
    const form = makeForm('<input name="username" type="text" value="alice">');
    expect(generatePayload(form)).toEqual({ username: 'alice' });
  });

  it('includes select field value', () => {
    const form = makeForm(`
      <select name="color">
        <option value="red" selected>Red</option>
        <option value="blue">Blue</option>
      </select>`);
    expect(generatePayload(form).color).toBe('red');
  });

  it('includes checked radio value and ignores unchecked', () => {
    const form = makeForm(`
      <input name="choice" type="radio" value="a" checked>
      <input name="choice" type="radio" value="b">
    `);
    expect(generatePayload(form)).toEqual({ choice: 'a' });
  });

  it('ignores unchecked radio (no key in payload)', () => {
    const form = makeForm('<input name="opt" type="radio" value="a">');
    expect(generatePayload(form)).not.toHaveProperty('opt');
  });

  it('combines multiple checked checkboxes with comma', () => {
    const form = makeForm(`
      <input name="tags" type="checkbox" value="x" checked>
      <input name="tags" type="checkbox" value="y" checked>
    `);
    expect(generatePayload(form).tags).toBe('x,y');
  });

  it('captures single checked checkbox', () => {
    const form = makeForm('<input name="agree" type="checkbox" value="yes" checked>');
    expect(generatePayload(form).agree).toBe('yes');
  });

  it('ignores unchecked checkboxes', () => {
    const form = makeForm('<input name="agree" type="checkbox" value="yes">');
    expect(generatePayload(form)).not.toHaveProperty('agree');
  });

  it('excludes submit buttons', () => {
    const form = makeForm('<button type="submit" name="submit" value="go">Go</button>');
    expect(generatePayload(form)).not.toHaveProperty('submit');
  });

  it('excludes disabled fields', () => {
    const form = makeForm('<input name="locked" type="text" value="secret" disabled>');
    expect(generatePayload(form)).not.toHaveProperty('locked');
  });

  it('excludes fields with no name', () => {
    const form = makeForm('<input type="text" value="anonymous">');
    expect(Object.keys(generatePayload(form))).toHaveLength(0);
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'form';
    document.body.appendChild(block);
    ({ decorate } = await import('./form.js'));
  });

  it('fires form:before even when no links present', async () => {
    const listener = jest.fn();
    block.addEventListener('form:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook when provided (even with no links)', async () => {
    const onBefore = jest.fn();
    await decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalledTimes(1);
  });

  it('returns early without throwing when formLink or submitLink is missing', async () => {
    await expect(decorate(block)).resolves.toBeUndefined();
  });
});

describe('decorate — with valid links', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'form';
    // Two links: one ending .json (form def) and one as submit endpoint
    block.innerHTML = `
      <div>
        <a href="http://localhost/form.json">Form Definition</a>
        <a href="https://submit.example.com/submit">Submit</a>
      </div>`;
    document.body.appendChild(block);
    ({ decorate } = await import('./form.js'));
  });

  it('fires form:after when form is set up successfully', async () => {
    const listener = jest.fn();
    block.addEventListener('form:after', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onAfter hook when form is set up successfully', async () => {
    const onAfter = jest.fn();
    await decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalledTimes(1);
  });

  it('replaces block content with a <form> element', async () => {
    await decorate(block);
    expect(block.querySelector('form')).not.toBeNull();
  });
});
