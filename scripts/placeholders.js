/**
 * Fetches placeholders from the specified path and returns an object of key-value pairs
 * @param {string} [prefix=''] - Optional prefix to filter placeholders
 * @returns {Promise<Object>} Object containing placeholder key-value pairs
 */

const LANG_LOCALE = 'en_us';

const cachedPlaceholders = {};

export async function fetchPlaceholders(prefix = '', lang = LANG_LOCALE) {
  const cacheKey = `${lang}${prefix}`;

  if (!cachedPlaceholders[cacheKey]) {
    cachedPlaceholders[cacheKey] = new Promise((resolve) => {
      fetch(`/${lang}/placeholders.json`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        })
        .then((json) => {
          const placeholders = {};
          json.data
            .filter((placeholder) => placeholder.Key.startsWith(prefix))
            .forEach((placeholder) => {
              placeholders[placeholder.Key] = placeholder.Text;
            });
          resolve(placeholders);
        })
        .catch(() => {
          // Placeholder file not found, return empty object
          resolve({});
        });
    });
  }

  return cachedPlaceholders[cacheKey];
}
