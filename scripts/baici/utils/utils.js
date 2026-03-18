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
 * Extract brand code from hostname
 * Expected domain formats:
 * - Brand subdomains: kershaw.kaiusa.com → 'kershaw', shun.kaiusa.com → 'shun'
 * - Main domain: kaiusa.com → 'kai' (splits on non-alpha chars, takes first part)
 * - Edge cases: kai-usa.com → 'kai' (regex /[^a-z]/i splits on hyphen)
 * @returns {string} Brand code (e.g., 'kershaw', 'shun', 'kai')
 */
export function getBrandCode() {
  const { hostname } = window.location;
  const parts = hostname.split('.');
  // For subdomains like kershaw.kaiusa.com, return 'kershaw'
  // For main domain like kaiusa.com, return 'kai'
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0];
  }
  // Extract first alphabetic segment of the main domain.
  // Examples:
  //   - kaiusa.com    -> parts[0] = "kaiusa"   -> "kai"
  //   - kai-usa.com   -> parts[0] = "kai-usa"  -> "kai"
  //   - kaiusa.co.uk  -> parts[0] = "kaiusa"   -> "kai"
  // This intentionally strips any non-alphabetic characters and everything
  // after them, so only the leading alphabetic brand prefix is used.
  return parts[0].split(/[^a-z]/i)[0].toLowerCase();
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
