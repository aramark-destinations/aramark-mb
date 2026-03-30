import {
  describe, it, expect, afterEach, jest,
} from '@jest/globals';
import { isDmUrl, createDmPicture, fetchDmAltText } from './utils.js';

// utils.js imports getMetadata from aem.js — mock it to avoid side effects
jest.mock('../../aem.js', () => ({
  getMetadata: jest.fn(),
}));

describe('isDmUrl', () => {
  it('returns true for DM with OpenAPI delivery path', () => {
    expect(isDmUrl('/adobe/dynamicmedia/deliver/dm-aid--abc123/image.jpg')).toBe(true);
  });

  it('returns true for DM path with existing query params', () => {
    expect(isDmUrl('/adobe/dynamicmedia/deliver/dm-aid--abc123/image.jpg?width=1280&quality=85')).toBe(true);
  });

  it('returns false for standard AEM delivery path', () => {
    expect(isDmUrl('/content/dam/images/photo.jpg')).toBe(false);
  });

  it('returns false for a plain relative path', () => {
    expect(isDmUrl('/img/hero.jpg')).toBe(false);
  });

  it('returns false for an absolute non-DM URL', () => {
    expect(isDmUrl('https://example.com/images/photo.jpg')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isDmUrl('')).toBe(false);
  });

  it('returns false for a malformed string that is not a URL', () => {
    expect(isDmUrl('not a url at all %%')).toBe(false);
  });
});

describe('createDmPicture', () => {
  const DM_PATH = '/adobe/dynamicmedia/deliver/dm-aid--abc123/image.jpg';

  it('returns a <picture> element', () => {
    const pic = createDmPicture(DM_PATH, 'Alt text', false, [{ width: '375' }]);
    expect(pic.tagName).toBe('PICTURE');
  });

  it('generates one WebP <source> per breakpoint', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }, { width: '768' }, { width: '1200' }]);
    const sources = pic.querySelectorAll('source[type="image/webp"]');
    expect(sources.length).toBe(3);
  });

  it('WebP sources use preferwebp=true and quality=85', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }]);
    const source = pic.querySelector('source[type="image/webp"]');
    expect(source.getAttribute('srcset')).toContain('preferwebp=true');
    expect(source.getAttribute('srcset')).toContain('quality=85');
  });

  it('WebP sources do not use EDS format params', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }]);
    const source = pic.querySelector('source[type="image/webp"]');
    expect(source.getAttribute('srcset')).not.toContain('format=webply');
    expect(source.getAttribute('srcset')).not.toContain('optimize=medium');
  });

  it('uses the correct width in each WebP source srcset', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }, { width: '768' }]);
    const sources = [...pic.querySelectorAll('source[type="image/webp"]')];
    expect(sources[0].getAttribute('srcset')).toContain('width=375');
    expect(sources[1].getAttribute('srcset')).toContain('width=768');
  });

  it('fallback img uses the last breakpoint width', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }, { width: '1200' }]);
    const img = pic.querySelector('img');
    expect(img.getAttribute('src')).toContain('width=1200');
  });

  it('fallback img src uses quality=85 and no EDS format params', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '1200' }]);
    const img = pic.querySelector('img');
    expect(img.getAttribute('src')).toContain('quality=85');
    expect(img.getAttribute('src')).not.toContain('format=');
    expect(img.getAttribute('src')).not.toContain('optimize=medium');
  });

  it('applies alt text to the fallback img', () => {
    const pic = createDmPicture(DM_PATH, 'A canyon at sunset', false, [{ width: '375' }]);
    expect(pic.querySelector('img').getAttribute('alt')).toBe('A canyon at sunset');
  });

  it('sets loading="lazy" by default', () => {
    const pic = createDmPicture(DM_PATH, '', false, [{ width: '375' }]);
    expect(pic.querySelector('img').getAttribute('loading')).toBe('lazy');
  });

  it('sets loading="eager" when eager=true', () => {
    const pic = createDmPicture(DM_PATH, '', true, [{ width: '375' }]);
    expect(pic.querySelector('img').getAttribute('loading')).toBe('eager');
  });

  it('strips existing query params from the src before appending DM params', () => {
    const srcWithParams = `${DM_PATH}?width=1280&quality=85&preferwebp=true`;
    const pic = createDmPicture(srcWithParams, '', false, [{ width: '375' }]);
    const source = pic.querySelector('source');
    // srcset should contain the pathname only, not doubled params
    expect(source.getAttribute('srcset')).not.toContain('width=1280');
    expect(source.getAttribute('srcset')).toContain('width=375');
  });

  it('applies media attribute to <source> when provided in breakpoint', () => {
    const pic = createDmPicture(DM_PATH, '', false, [
      { media: '(min-width: 1200px)', width: '1200' },
      { media: '(min-width: 768px)', width: '768' },
      { width: '375' },
    ]);
    const sources = [...pic.querySelectorAll('source[type="image/webp"]')];
    expect(sources[0].getAttribute('media')).toBe('(min-width: 1200px)');
    expect(sources[1].getAttribute('media')).toBe('(min-width: 768px)');
    expect(sources[2].hasAttribute('media')).toBe(false);
  });
});

describe('fetchDmAltText', () => {
  const DM_SRC = '/adobe/dynamicmedia/deliver/dm-aid--563d8af3-3378-46c8-9d9a-51ca0b943a26/image.jpg';

  afterEach(() => {
    delete global.fetch;
  });

  it('returns dc:description from DM metadata for a valid DM URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        value: {
          assetMetadata: {
            'dc:description': 'A canyon at sunset',
          },
        },
      }),
    });
    const result = await fetchDmAltText(DM_SRC);
    expect(result).toBe('A canyon at sunset');
  });

  it('returns null when dc:description is absent from the response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: { assetMetadata: {} } }),
    });
    const result = await fetchDmAltText(DM_SRC);
    expect(result).toBeNull();
  });

  it('returns null for a non-DM URL without fetching', async () => {
    global.fetch = jest.fn();
    const result = await fetchDmAltText('/content/dam/images/photo.jpg');
    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns null when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const result = await fetchDmAltText(DM_SRC);
    expect(result).toBeNull();
  });
});
