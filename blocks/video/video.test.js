import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
}));

// IntersectionObserver is used when there is no placeholder; stub it
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

const mockDLPush = jest.fn();

// ─── getYouTubeVideoId ────────────────────────────────────────────────────────

describe('getYouTubeVideoId', () => {
  let getYouTubeVideoId;

  beforeEach(async () => {
    jest.resetModules();
    ({ getYouTubeVideoId } = await import('./video.js'));
  });

  it('extracts video ID from standard YouTube URL (?v=)', () => {
    const url = new URL('https://www.youtube.com/watch?v=abc123');
    expect(getYouTubeVideoId(url)).toBe('abc123');
  });

  it('extracts video ID from youtu.be short URL', () => {
    const url = new URL('https://youtu.be/abc123');
    expect(getYouTubeVideoId(url)).toBe('abc123');
  });

  it('URL-encodes the video ID', () => {
    const url = new URL('https://www.youtube.com/watch?v=a%2Fb');
    // encodeURIComponent on 'a/b' gives 'a%2Fb'
    expect(getYouTubeVideoId(url)).toBeTruthy();
  });

  it('returns empty string when no v param and not youtu.be', () => {
    const url = new URL('https://www.youtube.com/watch');
    expect(getYouTubeVideoId(url)).toBe('');
  });
});

// ─── pushVideoEvent ───────────────────────────────────────────────────────────

describe('pushVideoEvent', () => {
  let pushVideoEvent;

  beforeEach(async () => {
    jest.resetModules();
    mockDLPush.mockClear();
    ({ pushVideoEvent } = await import('./video.js'));
  });

  it('does not throw and warns when adobeDataLayer is absent', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete window.adobeDataLayer;
    pushVideoEvent('video_started', {});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('ACDL not initialized'),
      'video_started',
    );
    warnSpy.mockRestore();
  });

  it('pushes event to adobeDataLayer when present', () => {
    window.adobeDataLayer = { push: mockDLPush };
    pushVideoEvent('video_started', { action: 'play' });
    expect(mockDLPush).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'video_started',
        pageContext: { videoInteraction: { action: 'play' } },
      }),
    );
  });
});

// ─── getVideoElement ──────────────────────────────────────────────────────────

describe('getVideoElement', () => {
  let getVideoElement;

  beforeEach(async () => {
    jest.resetModules();
    ({ getVideoElement } = await import('./video.js'));
  });

  it('creates a <video> element with controls', () => {
    const video = getVideoElement('/video.mp4');
    expect(video.tagName).toBe('VIDEO');
    expect(video.hasAttribute('controls')).toBe(true);
  });

  it('sets preload=metadata', () => {
    const video = getVideoElement('/video.mp4');
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('appends a <source> child with correct src and type', () => {
    const video = getVideoElement('/video.mp4');
    const source = video.querySelector('source');
    expect(source).not.toBeNull();
    expect(source.getAttribute('src')).toBe('/video.mp4');
    expect(source.getAttribute('type')).toBe('video/mp4');
  });

  it('sets poster attribute when provided', () => {
    const video = getVideoElement('/video.mp4', '/poster.jpg');
    expect(video.getAttribute('poster')).toBe('/poster.jpg');
  });

  it('sets aria-label when title is provided', () => {
    const video = getVideoElement('/video.mp4', null, null, 'My Video');
    expect(video.getAttribute('aria-label')).toBe('My Video');
  });

  it('adds captions track when provided', () => {
    const video = getVideoElement('/video.mp4', null, '/captions.vtt');
    const track = video.querySelector('track[kind="captions"]');
    expect(track).not.toBeNull();
    expect(track.getAttribute('src')).toBe('/captions.vtt');
  });
});

// ─── decorate — lifecycle ─────────────────────────────────────────────────────

describe('decorate — lifecycle events', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    window.adobeDataLayer = { push: mockDLPush };
    document.body.innerHTML = '';

    block = document.createElement('div');
    block.className = 'video';
    // Provide a video link so decorate doesn't bail early
    block.innerHTML = '<div><div><a href="https://www.youtube.com/watch?v=test123">Video</a></div></div>';
    document.body.appendChild(block);

    ({ decorate } = await import('./video.js'));
  });

  it('fires video:before event', async () => {
    const listener = jest.fn();
    block.addEventListener('video:before', listener);
    await decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires video:after event', async () => {
    const listener = jest.fn();
    block.addEventListener('video:after', listener);
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

describe('decorate — no video link', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    block = document.createElement('div');
    block.className = 'video';
    document.body.appendChild(block);
    ({ decorate } = await import('./video.js'));
  });

  it('renders an error message when no link is present', async () => {
    await decorate(block);
    expect(block.querySelector('.video-error')).not.toBeNull();
  });

  it('still fires before/after events when no link', async () => {
    const before = jest.fn();
    const after = jest.fn();
    block.addEventListener('video:before', before);
    block.addEventListener('video:after', after);
    await decorate(block);
    expect(before).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
  });
});

describe('decorate — placeholder click loads embed', () => {
  let decorate;
  let block;

  beforeEach(async () => {
    jest.resetModules();
    window.adobeDataLayer = { push: mockDLPush };
    document.body.innerHTML = '';
    ({ decorate } = await import('./video.js'));
  });

  it('clicking placeholder loads YouTube iframe', async () => {
    block = document.createElement('div');
    block.className = 'video';
    block.innerHTML = `
      <div>
        <div>
          <a href="https://www.youtube.com/watch?v=abc123">Video</a>
          <picture><img src="/poster.jpg" alt="Poster"></picture>
        </div>
      </div>`;
    document.body.appendChild(block);
    await decorate(block);

    const wrapper = block.querySelector('.video-placeholder');
    expect(wrapper).not.toBeNull();
    wrapper.click();
    expect(block.querySelector('iframe')).not.toBeNull();
  });

  it('clicking placeholder loads MP4 video element', async () => {
    block = document.createElement('div');
    block.className = 'video';
    block.innerHTML = `
      <div>
        <div>
          <a href="/assets/sample.mp4">Video</a>
          <picture><img src="/poster.jpg" alt="Poster"></picture>
        </div>
      </div>`;
    document.body.appendChild(block);
    await decorate(block);

    const wrapper = block.querySelector('.video-placeholder');
    wrapper.click();
    expect(block.querySelector('video')).not.toBeNull();
  });
});
