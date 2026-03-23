import {
  describe, it, expect, beforeEach, jest,
} from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  readVariant: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'embed';
    block.innerHTML = '<div><div><a href="https://www.youtube.com/watch?v=test">Video</a></div></div>';
    document.body.appendChild(block);
    ({ decorate } = await import('./embed.js'));
  });

  it('fires embed:before event', () => {
    const listener = jest.fn();
    block.addEventListener('embed:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires embed:after event', () => {
    const listener = jest.fn();
    block.addEventListener('embed:after', listener);
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

describe('decorate — placeholder click loads embed', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    ({ decorate } = await import('./embed.js'));

    block = document.createElement('div');
    block.className = 'embed';
    block.innerHTML = `
      <div><div>
        <picture><img src="/poster.jpg" alt="thumb"></picture>
        <a href="https://www.youtube.com/watch?v=abc">Video</a>
      </div></div>`;
    document.body.appendChild(block);
  });

  it('clicking placeholder renders YouTube iframe', () => {
    decorate(block);
    block.querySelector('.embed-placeholder').click();
    expect(block.querySelector('iframe')).not.toBeNull();
  });

  it('loads Vimeo embed on placeholder click', () => {
    block.querySelector('a').href = 'https://vimeo.com/12345';
    decorate(block);
    block.querySelector('.embed-placeholder').click();
    expect(block.querySelector('iframe')).not.toBeNull();
  });
});
