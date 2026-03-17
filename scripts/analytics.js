/**
 * Shared Analytics Utilities
 * Consent-gated helpers for pushing events to the Adobe Data Layer (ACDL).
 * Import these instead of calling window.adobeDataLayer directly in blocks.
 */

/**
 * Check if the user has consented to analytics tracking.
 * Supports OneTrust, Adobe OptIn, and TrustArc frameworks.
 * Defaults to true (opt-out model) when no consent framework is detected.
 *
 * @returns {boolean}
 */
export function checkAnalyticsConsent() {
  // OneTrust
  if (window.OnetrustActiveGroups) {
    return window.OnetrustActiveGroups.includes('C0002'); // Performance cookies
  }

  // Adobe Privacy JavaScript
  if (window.adobe?.optIn) {
    return window.adobe.optIn.isApproved(window.adobe.OptInCategories.ANALYTICS);
  }

  // TrustArc
  if (window.truste?.eu?.bindMap) {
    return window.truste.eu.bindMap.performance === '1';
  }

  // No consent framework detected — default to allowed (opt-out model)
  return true;
}

/**
 * Push an event to the Adobe Data Layer if ACDL is present and consent is granted.
 *
 * @param {string} eventName - Event name in snake_case (e.g. 'card_click')
 * @param {Object} eventInfo - Event-specific metadata
 * @param {Object} contextData - pageContext data to merge
 */
export function pushAnalyticsEvent(eventName, eventInfo, contextData) {
  if (!window.adobeDataLayer) return;
  if (!checkAnalyticsConsent()) return;

  window.adobeDataLayer.push({
    event: eventName,
    eventInfo,
    pageContext: contextData,
  });
}
