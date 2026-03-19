/**
 * Cards Block
 * - Provides lifecycle hooks (onBefore/onAfter) for site-specific extensions
 * - Dispatches before/after events for advanced customization
 * - Supports 4 layout orientations, card-as-link, css-class injection per card
 * - Consent-gated ACDL analytics (click + IntersectionObserver impressions)
 *
 * Note: When a card has a link configured, the <li> is replaced by an <a> as a
 * direct child of <ul>. This is a known HTML validity trade-off for whole-card
 * keyboard/pointer accessibility. The CSS targets both `ul > li` and `ul > a`.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
import { pushAnalyticsEvent } from '../../scripts/analytics.js';

function sanitizeCSSClass(className) {
  if (!className) return '';
  return className
    .split(' ')
    .map((cls) => cls.replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter((cls) => cls.length > 0 && !cls.toLowerCase().includes('script'))
    .join(' ');
}

function isLikelyURL(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(trimmed)) return true;
  if (/^(\/|\.\/|\.\.\/)/i.test(trimmed)) return true;
  const domainPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,6}(\/|$|\?|#)/i;
  if (domainPattern.test(trimmed)) return true;
  const shortDomainPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,6}$/i;
  return shortDomainPattern.test(trimmed);
}

function applyOrientation(card, orientation) {
  const validOrientations = [
    'image-above-text',
    'image-left-text-right',
    'text-left-image-right',
    'text-above-image-below',
  ];
  const normalizedOrientation = validOrientations.includes(orientation)
    ? orientation
    : 'image-above-text';

  card.setAttribute('data-orientation', normalizedOrientation);

  if (normalizedOrientation === 'image-left-text-right') {
    card.classList.add('cards-card-horizontal');
  } else if (normalizedOrientation === 'text-left-image-right') {
    card.classList.add('cards-card-horizontal', 'cards-card-reverse');
    const body = card.querySelector('.cards-card-body');
    const image = card.querySelector('.cards-card-image');
    if (body && image) card.insertBefore(body, image);
  } else if (normalizedOrientation === 'text-above-image-below') {
    card.classList.add('cards-card-inverted');
    const body = card.querySelector('.cards-card-body');
    const image = card.querySelector('.cards-card-image');
    if (body && image) card.insertBefore(body, image);
  }
}

function wrapCardWithLink(card, link, linkLabel) {
  if (!link || !linkLabel) return null;

  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.setAttribute('aria-label', linkLabel);
  anchor.className = card.className;
  anchor.setAttribute('data-analytics-link-destination', link);
  anchor.setAttribute('data-analytics-link-label', linkLabel);
  anchor.setAttribute('data-analytics-has-link', 'true');

  if (card.hasAttribute('data-orientation')) {
    anchor.setAttribute('data-orientation', card.getAttribute('data-orientation'));
  }

  while (card.firstChild) anchor.appendChild(card.firstChild);

  // Flatten nested links — invalid HTML and confusing UX inside a linked card
  anchor.querySelectorAll('a').forEach((nestedLink) => {
    nestedLink.parentNode.replaceChild(
      document.createTextNode(nestedLink.textContent),
      nestedLink,
    );
  });

  moveInstrumentation(card, anchor);
  return anchor;
}

function getCardTitle(card) {
  return card.querySelector('h1, h2, h3, h4')?.textContent.trim() || 'Untitled';
}

function getCardLink(card) {
  return card.getAttribute('data-analytics-link-destination')
    || card.href
    || card.querySelector('a')?.href
    || '';
}

function generateCardId() {
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function initializeAnalytics(block) {
  const containerId = `cards-${Date.now()}`;
  const cards = block.querySelectorAll('ul > li, ul > a');
  const cardCount = cards.length;

  block.setAttribute('data-analytics-container-id', containerId);
  block.setAttribute('data-analytics-card-count', String(cardCount));

  const trackedImpressions = new Set();

  cards.forEach((card, index) => {
    const cardId = card.getAttribute('data-analytics-card-id') || generateCardId();
    card.setAttribute('data-analytics-card-id', cardId);
    card.setAttribute('data-analytics-card-position', String(index + 1));
    card.setAttribute('data-analytics-orientation', card.getAttribute('data-orientation') || 'image-above-text');

    if (!card.hasAttribute('data-analytics-has-link')) {
      card.setAttribute('data-analytics-has-link', 'false');
    }

    const cardTitle = getCardTitle(card);
    const cardLink = getCardLink(card);
    const cardLinkLabel = card.getAttribute('data-analytics-link-label')
      || card.getAttribute('aria-label')
      || '';

    card.addEventListener('click', () => {
      const timestamp = Date.now();
      pushAnalyticsEvent(
        'card_click',
        {
          cardTitle,
          cardIndex: index,
          linkDestination: card.href || cardLink,
          linkLabel: card.getAttribute('aria-label') || cardLinkLabel || cardTitle,
          cardsContainerId: containerId,
          elementType: card.tagName.toLowerCase(),
          timestamp,
        },
        {
          cardInteraction: {
            type: 'click',
            title: cardTitle,
            index,
            linkDestination: card.href || cardLink,
            timestamp,
          },
        },
      );
    });
  });

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || trackedImpressions.has(entry.target)) return;
          trackedImpressions.add(entry.target);
          const card = entry.target;
          const cardIndex = Array.from(cards).indexOf(card);
          const timestamp = Date.now();

          pushAnalyticsEvent(
            'card_impression',
            {
              cardTitle: getCardTitle(card),
              cardIndex,
              cardLink: getCardLink(card),
              cardsContainerId: containerId,
              timestamp,
            },
            {
              cardInteraction: {
                type: 'impression',
                title: getCardTitle(card),
                index: cardIndex,
                timestamp,
              },
            },
          );

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    cards.forEach((card) => observer.observe(card));
  }
}

export function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('cards:before', { detail: ctx }));

  // === CARDS BLOCK LOGIC ===
  readVariant(block);
  const containerCSSClass = block.getAttribute('data-css-class');
  if (containerCSSClass) {
    const sanitized = sanitizeCSSClass(containerCSSClass);
    if (sanitized) sanitized.split(' ').forEach((cls) => block.classList.add(cls));
  }

  const allRows = Array.from(block.querySelectorAll(':scope > div'));
  const validOrientations = [
    'image-above-text',
    'image-left-text-right',
    'text-left-image-right',
    'text-above-image-below',
  ];

  const rows = allRows.filter((row) => {
    if (row.hasAttribute('data-aue-resource')) return true;
    const cols = Array.from(row.children);
    if (cols.length >= 2) return true;
    if (cols.length === 1) {
      return cols[0].querySelector('picture, img, h1, h2, h3, h4, p:not(:empty), ul, ol') !== null;
    }
    return false;
  });

  allRows.forEach((row) => { if (!rows.includes(row)) row.remove(); });

  const ul = document.createElement('ul');

  rows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    const cardChildren = Array.from(li.children);

    let orientation = row.dataset.orientation || '';
    let cssClass = row.dataset.cssClass || '';
    let link = row.dataset.link || '';
    let linkLabel = row.dataset.linkLabel || '';

    if (!orientation || !cssClass || !link) {
      cardChildren.forEach((child) => {
        const text = child.textContent.trim();
        const anchorTag = child.querySelector('a');

        if (anchorTag && !link) {
          link = anchorTag.href || anchorTag.textContent.trim();
          return;
        }

        const hasOnlyText = child.children.length === 0
          || (child.children.length === 1
            && child.children[0].tagName === 'P'
            && child.children[0].children.length === 0
            && child.children[0].textContent.trim() === text);

        if (hasOnlyText && text.length < 100) {
          if (!orientation && validOrientations.includes(text)) {
            orientation = text;
          } else if (!link && isLikelyURL(text)) {
            link = text;
          } else if (!linkLabel && link && text && text.length < 50) {
            linkLabel = text;
          } else if (!cssClass && text && !validOrientations.includes(text) && !text.includes('.') && !text.includes(' ') && text.length < 30) {
            cssClass = text;
          }
        }
      });
    }

    orientation = orientation || 'image-above-text';

    if (cssClass) {
      const sanitized = sanitizeCSSClass(cssClass);
      if (sanitized) sanitized.split(' ').forEach((cls) => li.classList.add(cls));
    }

    cardChildren.forEach((child) => {
      const textContent = child.textContent.trim();
      const auePropElement = child.querySelector('[data-aue-prop]') || (child.hasAttribute('data-aue-prop') ? child : null);

      if (auePropElement) {
        const propName = auePropElement.getAttribute('data-aue-prop');
        const propType = auePropElement.getAttribute('data-aue-type');
        if (['orientation', 'css-class', 'link', 'link-label'].includes(propName)) {
          child.remove();
          return;
        }
        if ((propName === 'text' && propType === 'richtext') || (propName === 'image' && propType === 'media')) return;
      }

      if (child.querySelector('picture, img')) return;
      if (child.querySelector('h1, h2, h3, h4, ul, ol, table, blockquote')) return;

      const matchesConfigValue = textContent === orientation
        || textContent === cssClass
        || textContent === link
        || textContent === linkLabel;

      if (matchesConfigValue) { child.remove(); return; }

      const paragraphs = child.querySelectorAll('p');
      const hasRealContent = Array.from(paragraphs).some((p) => {
        const pText = p.textContent.trim();
        return pText.length > 0 && pText !== orientation && pText !== cssClass
          && pText !== link && pText !== linkLabel;
      });

      if (hasRealContent || (child.querySelector('p') && textContent.length > 3 && !matchesConfigValue)) return;
      if (!textContent) child.remove();
    });

    let hasImage = false;
    let hasText = false;

    Array.from(li.children).forEach((div) => {
      if (div.querySelector('picture, img')) {
        div.className = 'cards-card-image';
        hasImage = true;
      } else if (div.textContent.trim()) {
        div.className = 'cards-card-body';
        hasText = true;
      } else {
        div.remove();
      }
    });

    if (!hasImage && hasText) li.classList.add('cards-card-text-only');
    else if (hasImage && !hasText) li.classList.add('cards-card-image-only');

    applyOrientation(li, orientation);

    ul.append(wrapCardWithLink(li, link, linkLabel) || li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '375' }, { width: '768' }, { width: '1200' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
  initializeAnalytics(block);

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('cards:after', { detail: ctx }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Cards?.hooks
 */
export default (block) => decorate(block, window.Cards?.hooks);
