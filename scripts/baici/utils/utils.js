import { getMetadata } from '../../aem.js';

/**
 * Gets the brand code from page metadata.
 * @returns {string} Brand code from the 'brand' meta tag, or empty string if not set.
 */
export function getBrandCode() {
  return getMetadata('brand');
}

/**
 * Fetches an image from a URL.
 * @param {string} href The URL of the image to fetch.
 * @returns {Promise<Blob>} A promise that resolves to the image blob.
 */
export async function fetchImage(href) {
  try {
    const req = new Request(href);
    const options = { priority: 'high' };
    const response = await fetch(req, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.blob();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching image:', error);
    return null;
  }
}

/**
 * Fetches an SVG from a URL.
 * @param {*} svgPath
 * @returns
 */
export async function fetchSvg(svgPath) {
  try {
    const req = new Request(svgPath);
    const options = { priority: 'high' };
    const response = await fetch(req, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.text();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching SVG:', error);
    return null;
  }
}

/**
 * Fetches and injects an SVG into a target element.
 * @param {string} svgPath The URL or path to the SVG file.
 * @param {Element} targetElement The DOM element to inject the SVG into.
 * @returns {Promise<SVGSVGElement|null>} A promise that resolves to the
 * injected SVG element, or null if an error occurs.
 */
export async function injectSvg(svgPath, targetElement) {
  try {
    const response = await fetchSvg(svgPath);
    targetElement.innerHTML = response;
    return targetElement.querySelector('svg');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching SVG:', error);
    return null;
  }
}

/**
 * Detects keyboard navigation and adds 'keyfocus' class to HTML element.
 * Removes class on mouse interaction. Efficient implementation with minimal overhead.
 */
export function detectKeyboardNavigation() {
  const html = document.documentElement;
  let isKeyboardUser = false;

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown'
      || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (!isKeyboardUser) {
        isKeyboardUser = true;
        html.classList.add('keyfocus');
      }
    }
  };

  const handleMouseDown = () => {
    if (isKeyboardUser) {
      isKeyboardUser = false;
      html.classList.remove('keyfocus');
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
}

/**
 * Gets the src URL of the img within a picture element.
 * @param {HTMLPictureElement} picture
 * @returns {string|null}
 */
export function getPictureSrc(picture) {
  if (!(picture instanceof HTMLPictureElement)) {
    return null;
  }
  const img = picture.querySelector('img');
  if (!img) return null;
  const url = new URL(img.src);
  return `${url.origin}${url.pathname}`;
}

const DM_DELIVER_PATH = '/adobe/dynamicmedia/deliver/';

/**
 * Returns true if the src is a Dynamic Media with OpenAPI delivery URL.
 * @param {string} src
 * @returns {boolean}
 */
export function isDmUrl(src) {
  try {
    const { pathname } = new URL(src, window.location.href);
    return pathname.startsWith(DM_DELIVER_PATH);
  } catch {
    return false;
  }
}

/**
 * Builds a responsive <picture> element for DM with OpenAPI delivery URLs.
 * Uses DM-native params (preferwebp, quality, width) instead of EDS format strings.
 * @param {string} src
 * @param {string} alt
 * @param {boolean} eager
 * @param {Array<{width: string}>} breakpoints
 * @returns {HTMLPictureElement}
 */
export function createDmPicture(src, alt = '', eager = false, breakpoints = [{ width: '750' }]) {
  const { pathname } = new URL(src, window.location.href);
  const picture = document.createElement('picture');

  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&preferwebp=true&quality=85`);
    picture.appendChild(source);
  });

  const img = document.createElement('img');
  const last = breakpoints[breakpoints.length - 1];
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('alt', alt);
  img.setAttribute('src', `${pathname}?width=${last.width}&quality=85`);
  picture.appendChild(img);

  return picture;
}

/**
 * Fetches alt text for a DM image from the DM Assets Metadata API.
 * Returns the dc:description value, or null if unavailable or on any error.
 * @param {string} src - A DM delivery URL
 * @returns {Promise<string|null>}
 */
export async function fetchDmAltText(src) {
  try {
    const match = src.match(/\/adobe\/dynamicmedia\/deliver\/dm-aid--([^/]+)\//);
    if (!match) return null;
    const assetId = `urn:aaid:aem:${match[1]}`;
    const { origin } = new URL(src, window.location.href);
    const url = `${origin}/adobe/assets/${encodeURIComponent(assetId)}/metadata`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    return json.value?.assetMetadata?.['dc:description'] ?? null;
  } catch {
    return null;
  }
}

/**
 * Debounces a function, ensuring it's only called after a certain
 * delay has passed since the last call.
 * @param {Function} func The function to debounce.
 * @param {number} wait The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
