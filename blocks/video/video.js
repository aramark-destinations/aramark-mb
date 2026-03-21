/*
 * Video Block - Extended with Full-Width Support
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 *
 * NOTE: Autoplay is disabled
 */

import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';

// Constants
const PROGRESS_CHECK_INTERVAL = 1000; // milliseconds

// YouTube API loading state
const youtubeAPICallbacks = [];
let youtubeAPILoading = false;

/**
 * Pushes video analytics event to Adobe Client Data Layer (ACDL)
 * Follows Pattern B: Custom CMS Events
 * @param {string} eventName - snake_case event name (video_started, video_paused, etc.)
 * @param {object} videoInteraction - Video interaction data for pageContext
 */
export function pushVideoEvent(eventName, videoInteraction) {
  if (!window.adobeDataLayer) {
    // eslint-disable-next-line no-console
    console.warn('ACDL not initialized. Video event not tracked:', eventName);
    return;
  }

  window.adobeDataLayer.push({
    event: eventName,
    pageContext: {
      videoInteraction,
    },
  });
}

/**
 * Extracts video ID from YouTube URL
 * @param {URL} url - YouTube URL
 * @returns {string} Video ID
 */
export function getYouTubeVideoId(url) {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return vid;
}

/**
 * Embeds YouTube video with privacy-enhanced parameters
 * NO AUTOPLAY - autoplay is disabled
 * @param {URL} url - YouTube URL
 * @returns {HTMLElement} Embedded iframe wrapper
 */
function embedYoutube(url) {
  const vid = getYouTubeVideoId(url);

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      scrolling="no"
      title="Content from Youtube"
      loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

/**
 * Embeds Vimeo video with privacy settings
 * NO AUTOPLAY - autoplay is disabled
 * @param {URL} url - Vimeo URL
 * @returns {HTMLElement} Embedded iframe wrapper
 */
function embedVimeo(url) {
  const [, video] = url.pathname.split('/');

  // Generate truly unique player ID using crypto.randomUUID or fallback
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const playerId = `vimeo-player-${video}-${uniqueId}`;

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}?title=0&byline=0&portrait=0"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="fullscreen; picture-in-picture"
      allowfullscreen
      title="Content from Vimeo"
      loading="lazy"
      id="${playerId}"></iframe>
    </div>`;
  return temp.children.item(0);
}

/**
 * Creates video element for MP4 and other direct video sources
 * NO AUTOPLAY - autoplay is disabled
 * @param {string} source - Video source URL
 * @param {string} poster - Optional poster image URL
 * @param {string} captions - Optional captions track URL
 * @param {string} title - Optional video title for aria-label
 * @returns {HTMLVideoElement} Video element with controls
 */
export function getVideoElement(source, poster = null, captions = null, title = '') {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  video.setAttribute('preload', 'metadata');

  if (poster) {
    video.setAttribute('poster', poster);
  }

  if (title) {
    video.setAttribute('aria-label', title);
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  // Add captions track for MP4 videos if provided
  if (captions) {
    const track = document.createElement('track');
    track.setAttribute('kind', 'captions');
    track.setAttribute('src', captions);
    track.setAttribute('srclang', 'en');
    track.setAttribute('label', 'English');
    video.append(track);
  }

  return video;
}

/**
 * Sets up analytics tracking for video element using ACDL
 * Tracks: video_started, video_paused, video_completed, progress milestones, fullscreen events
 * @param {HTMLVideoElement} video - Video element to track
 * @param {HTMLElement} block - Block element with data attributes
 * @returns {Function} Cleanup function to remove event listeners
 */
function setupVideoAnalytics(video, block) {
  const progressMilestones = { 25: false, 50: false, 75: false };
  const videoSource = block.dataset.videoSource || '';
  const videoType = block.dataset.videoType || '';
  const videoTitle = video.getAttribute('aria-label') || '';

  // Store event handlers for cleanup
  const handlers = {};

  // video_started event
  handlers.play = () => {
    pushVideoEvent(
      'video_started',
      {
        action: 'play',
        source: videoSource,
        type: videoType,
        title: videoTitle,
        duration: video.duration,
        currentTime: video.currentTime,
      },
    );
  };
  video.addEventListener('play', handlers.play);

  // video_paused event
  handlers.pause = () => {
    pushVideoEvent(
      'video_paused',
      {
        action: 'pause',
        source: videoSource,
        type: videoType,
        currentTime: video.currentTime,
      },
    );
  };
  video.addEventListener('pause', handlers.pause);

  // video_completed event
  handlers.ended = () => {
    pushVideoEvent(
      'video_completed',
      {
        action: 'complete',
        source: videoSource,
        type: videoType,
        duration: video.duration,
        watchedPercentage: 100,
      },
    );
  };
  video.addEventListener('ended', handlers.ended);

  // Progress milestone events
  handlers.timeupdate = () => {
    if (!video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;

    [25, 50, 75].forEach((milestone) => {
      if (progress >= milestone && !progressMilestones[milestone]) {
        progressMilestones[milestone] = true;
        pushVideoEvent(
          `video_progress_${milestone}`,
          {
            action: 'progress',
            source: videoSource,
            type: videoType,
            currentTime: video.currentTime,
            percentage: milestone,
          },
        );
      }
    });
  };
  video.addEventListener('timeupdate', handlers.timeupdate);

  // Fullscreen events
  handlers.fullscreenchange = () => {
    if (document.fullscreenElement === video) {
      pushVideoEvent(
        'video_fullscreen_entered',
        {
          action: 'fullscreen_entered',
          source: videoSource,
          type: videoType,
        },
      );
    } else {
      pushVideoEvent(
        'video_fullscreen_exited',
        {
          action: 'fullscreen_exited',
          source: videoSource,
          type: videoType,
        },
      );
    }
  };

  video.addEventListener('fullscreenchange', handlers.fullscreenchange);
  video.addEventListener('webkitfullscreenchange', handlers.fullscreenchange);

  // Return cleanup function
  return () => {
    video.removeEventListener('play', handlers.play);
    video.removeEventListener('pause', handlers.pause);
    video.removeEventListener('ended', handlers.ended);
    video.removeEventListener('timeupdate', handlers.timeupdate);
    video.removeEventListener('fullscreenchange', handlers.fullscreenchange);
    video.removeEventListener('webkitfullscreenchange', handlers.fullscreenchange);
  };
}

/**
 * Loads YouTube IFrame Player API
 * Handles concurrent requests safely
 * @returns {Promise} Resolves when API is ready
 */
function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    // API already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Add resolver to callback queue
    youtubeAPICallbacks.push({ resolve, reject });

    // Already loading, wait for callback
    if (youtubeAPILoading) {
      return;
    }

    youtubeAPILoading = true;

    // Set up global callback (safe to reassign, handles all queued callbacks)
    window.onYouTubeIframeAPIReady = () => {
      youtubeAPILoading = false;
      // Resolve all pending callbacks
      youtubeAPICallbacks.forEach((cb) => cb.resolve());
      youtubeAPICallbacks.length = 0;
    };

    // Load API script if not already in DOM
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        youtubeAPILoading = false;
        youtubeAPICallbacks.forEach((cb) => cb.reject(new Error('Failed to load YouTube API')));
        youtubeAPICallbacks.length = 0;
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  });
}

// Vimeo API loading state
let vimeoAPILoading = null;

/**
 * Loads Vimeo Player SDK
 * @returns {Promise} Resolves when SDK is ready
 */
function loadVimeoAPI() {
  if (window.Vimeo && window.Vimeo.Player) {
    return Promise.resolve();
  }

  // Return existing loading promise if already loading
  if (vimeoAPILoading) {
    return vimeoAPILoading;
  }

  // Create new loading promise
  vimeoAPILoading = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="player.vimeo.com/api/player.js"]');

    if (existingScript) {
      // Script exists but SDK might not be ready yet
      const checkInterval = setInterval(() => {
        if (window.Vimeo && window.Vimeo.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 250);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        vimeoAPILoading = null; // Reset so future attempts can retry
        reject(new Error('Vimeo API loading timeout'));
      }, 10000);
    } else {
      // Load SDK script
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = () => resolve();
      script.onerror = () => {
        vimeoAPILoading = null; // Reset on error to allow retry
        reject(new Error('Failed to load Vimeo API'));
      };
      document.head.appendChild(script);
    }
  });

  return vimeoAPILoading;
}

/**
 * Sets up analytics tracking for YouTube video using IFrame Player API
 * @param {HTMLIFrameElement} iframe - YouTube iframe element
 * @param {HTMLElement} block - Block element with data attributes
 * @returns {Promise<Function>} Cleanup function
 */
async function setupYouTubeAnalytics(iframe, block) {
  try {
    await loadYouTubeAPI();

    const videoSource = block.dataset.videoSource || '';
    const videoType = block.dataset.videoType || 'youtube';
    const progressMilestones = { 25: false, 50: false, 75: false };
    let hasStarted = false;
    let videoTitle = '';
    let progressInterval = null;

    // Create YouTube player instance
    const player = new window.YT.Player(iframe, {
      events: {
        onReady: () => {
          // Cache video title when ready
          try {
            videoTitle = player.getVideoData().title || '';
          } catch (e) {
            // Ignore errors getting title
          }
        },
        onStateChange: (event) => {
          try {
            const duration = player.getDuration();
            const currentTime = player.getCurrentTime();

            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1),
            // PAUSED (2), BUFFERING (3), CUED (5)
            if (event.data === window.YT.PlayerState.PLAYING) {
              // Only fire video_started on first play
              if (!hasStarted) {
                hasStarted = true;
                pushVideoEvent('video_started', {
                  action: 'play',
                  source: videoSource,
                  type: videoType,
                  title: videoTitle,
                  duration,
                  currentTime,
                });
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              pushVideoEvent('video_paused', {
                action: 'pause',
                source: videoSource,
                type: videoType,
                currentTime,
              });
            } else if (event.data === window.YT.PlayerState.ENDED) {
              pushVideoEvent('video_completed', {
                action: 'complete',
                source: videoSource,
                type: videoType,
                duration,
                watchedPercentage: 100,
              });
              // Clear interval when video ends
              if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
              }
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('YouTube analytics state change error:', error);
          }
        },
      },
    });

    // Track progress milestones
    progressInterval = setInterval(() => {
      try {
        // Check if player is destroyed or iframe removed from DOM
        if (!player.getPlayerState || !document.body.contains(iframe)) {
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
          return;
        }

        if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
          const duration = player.getDuration();
          const currentTime = player.getCurrentTime();

          if (duration && !Number.isNaN(duration) && duration > 0) {
            const progress = (currentTime / duration) * 100;

            [25, 50, 75].forEach((milestone) => {
              if (progress >= milestone && !progressMilestones[milestone]) {
                progressMilestones[milestone] = true;
                pushVideoEvent(`video_progress_${milestone}`, {
                  action: 'progress',
                  source: videoSource,
                  type: videoType,
                  currentTime,
                  percentage: milestone,
                });
              }
            });
          }
        }
      } catch (error) {
        // Player might be destroyed, clear interval
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }
    }, PROGRESS_CHECK_INTERVAL);

    // Return cleanup function
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to set up YouTube analytics:', error);
    return () => {}; // Return no-op cleanup function
  }
}

/**
 * Sets up analytics tracking for Vimeo video using Player SDK
 * @param {HTMLIFrameElement} iframe - Vimeo iframe element
 * @param {HTMLElement} block - Block element with data attributes
 * @returns {Promise<Function>} Cleanup function
 */
async function setupVimeoAnalytics(iframe, block) {
  try {
    await loadVimeoAPI();

    const videoSource = block.dataset.videoSource || '';
    const videoType = block.dataset.videoType || 'vimeo';
    const progressMilestones = { 25: false, 50: false, 75: false };
    let hasStarted = false;

    // Create Vimeo player instance
    const player = new window.Vimeo.Player(iframe);

    // Get video title
    let videoTitle = '';
    try {
      videoTitle = await player.getVideoTitle();
    } catch (error) {
      // Ignore errors getting title
    }

    // Store event handlers for cleanup
    const handlers = {};

    // Track play event
    handlers.play = async () => {
      try {
        // Only fire video_started on first play
        if (!hasStarted) {
          hasStarted = true;
          const duration = await player.getDuration();
          const currentTime = await player.getCurrentTime();

          pushVideoEvent('video_started', {
            action: 'play',
            source: videoSource,
            type: videoType,
            title: videoTitle,
            duration,
            currentTime,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Vimeo play event error:', error);
      }
    };
    player.on('play', handlers.play);

    // Track pause event
    handlers.pause = async () => {
      try {
        const currentTime = await player.getCurrentTime();

        pushVideoEvent('video_paused', {
          action: 'pause',
          source: videoSource,
          type: videoType,
          currentTime,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Vimeo pause event error:', error);
      }
    };
    player.on('pause', handlers.pause);

    // Track ended event
    handlers.ended = async () => {
      try {
        const duration = await player.getDuration();

        pushVideoEvent('video_completed', {
          action: 'complete',
          source: videoSource,
          type: videoType,
          duration,
          watchedPercentage: 100,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Vimeo ended event error:', error);
      }
    };
    player.on('ended', handlers.ended);

    // Track progress milestones using timeupdate
    handlers.timeupdate = (data) => {
      try {
        if (data.duration && data.duration > 0) {
          const progress = (data.seconds / data.duration) * 100;

          [25, 50, 75].forEach((milestone) => {
            if (progress >= milestone && !progressMilestones[milestone]) {
              progressMilestones[milestone] = true;
              pushVideoEvent(`video_progress_${milestone}`, {
                action: 'progress',
                source: videoSource,
                type: videoType,
                currentTime: data.seconds,
                percentage: milestone,
              });
            }
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Vimeo timeupdate event error:', error);
      }
    };
    player.on('timeupdate', handlers.timeupdate);

    // Return cleanup function
    return () => {
      // Remove all event listeners
      if (player && player.off) {
        try {
          player.off('play', handlers.play);
          player.off('pause', handlers.pause);
          player.off('ended', handlers.ended);
          player.off('timeupdate', handlers.timeupdate);
        } catch (e) {
          // Ignore errors removing listeners
        }
      }
      // Destroy player instance
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to set up Vimeo analytics:', error);
    return () => {}; // Return no-op cleanup function
  }
}

/**
 * Loads video embed into block
 * @param {HTMLElement} block - Block element
 * @param {string} link - Video source URL
 * @param {string} poster - Optional poster image URL
 * @param {string} title - Optional video title
 */
const loadVideoEmbed = (block, link, poster = null, title = '') => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }

  const url = new URL(link);
  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');

  // Set data attributes for analytics
  if (isYoutube) {
    block.dataset.videoSource = getYouTubeVideoId(url);
    block.dataset.videoType = 'youtube';
  } else if (isVimeo) {
    const [, videoId] = url.pathname.split('/');
    block.dataset.videoSource = videoId;
    block.dataset.videoType = 'vimeo';
  } else {
    block.dataset.videoSource = link;
    block.dataset.videoType = 'mp4';
  }

  if (isYoutube) {
    const embedWrapper = embedYoutube(url);
    block.append(embedWrapper);
    const iframe = embedWrapper.querySelector('iframe');
    iframe.addEventListener('load', async () => {
      block.dataset.embedLoaded = 'true';
      // Set up YouTube analytics after iframe loads
      const cleanup = await setupYouTubeAnalytics(iframe, block);
      // Store cleanup function on block for potential future use
      block.videoCleanup = cleanup;
    });
  } else if (isVimeo) {
    const embedWrapper = embedVimeo(url);
    block.append(embedWrapper);
    const iframe = embedWrapper.querySelector('iframe');
    iframe.addEventListener('load', async () => {
      block.dataset.embedLoaded = 'true';
      // Set up Vimeo analytics after iframe loads
      const cleanup = await setupVimeoAnalytics(iframe, block);
      // Store cleanup function on block for potential future use
      block.videoCleanup = cleanup;
    });
  } else {
    // MP4 or other direct video file
    const captions = block.dataset.captions || null;
    const videoEl = getVideoElement(link, poster, captions, title);
    block.append(videoEl);

    // Set up analytics for MP4 videos
    const cleanup = setupVideoAnalytics(videoEl, block);
    // Store cleanup function on block for potential future use
    block.videoCleanup = cleanup;

    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = 'true';
    });
  }
};

/**
 * Decorates video block
 * NO AUTOPLAY - autoplay is disabled
 * @param {HTMLElement} block - Block element to decorate
 * @param {Object} options Configuration options
 * @param {Function} options.onBefore Lifecycle hook called before decoration
 * @param {Function} options.onAfter Lifecycle hook called after decoration
 * @returns {Promise<void>}
 */
export async function decorate(block, options = {}) {
  const ctx = { block, options };

  // lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('video:before', { detail: ctx, bubbles: true }));

  // === VIDEO BLOCK LOGIC ===
  readVariant(block);

  // Check for required video link
  const linkElement = block.querySelector('a');
  if (!linkElement) {
    block.innerHTML = '<div class="video-error">Video source is required</div>';
    options.onAfter?.(ctx);
    block.dispatchEvent(new CustomEvent('video:after', { detail: ctx, bubbles: true }));
    return;
  }

  const placeholder = block.querySelector('picture');
  const link = linkElement.href;
  const title = linkElement.textContent || '';

  // Extract poster from placeholder image if exists and store img reference for reuse
  let poster = null;
  let img = null;
  if (placeholder) {
    img = placeholder.querySelector('img');
    if (img) {
      poster = img.src;
    }
  }

  // Read configuration from DOM elements (NOT key-value, so config is in DOM)
  // Must read BEFORE clearing block content
  const altTextElement = block.querySelector('[data-aue-prop="placeholder-image-alt-text"]');
  const placeholderAltText = altTextElement?.textContent?.trim() || '';

  // Also support data attribute (for backward compatibility or if key-value is added later)
  const placeholderAltTextFromData = block.dataset.placeholderImageAltText || '';
  const finalAltText = placeholderAltText || placeholderAltTextFromData;

  // Read full-width from DOM element or data attribute
  const fullWidthElement = block.querySelector('[data-aue-prop="full-width"]');
  const fullWidthValue = fullWidthElement?.textContent?.trim() || block.dataset.fullWidth || '';
  const isFullWidth = fullWidthValue === 'true';

  // Clear block content (removes config divs and original content)
  block.textContent = '';
  block.dataset.embedLoaded = 'false';

  // Apply full-width class if enabled
  if (isFullWidth) {
    block.classList.add('full-width');
  }

  // Create placeholder with play button
  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';

    // Apply alt text to placeholder image if configured (reuse img reference from earlier)
    if (finalAltText && img) {
      img.setAttribute('alt', finalAltText);
    }

    // Preserve Universal Editor instrumentation attributes
    moveInstrumentation(placeholder, wrapper);
    wrapper.append(placeholder);

    wrapper.insertAdjacentHTML(
      'beforeend',
      '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>',
    );

    wrapper.addEventListener('click', () => {
      block.classList.remove('placeholder');
      wrapper.remove();
      loadVideoEmbed(block, link, poster, title);
    });

    block.append(wrapper);
  } else {
    // Use IntersectionObserver for lazy loading when no placeholder
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideoEmbed(block, link, poster, title);
      }
    });
    observer.observe(block);
  }

  // lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('video:after', { detail: ctx, bubbles: true }));
}

/**
 * Default export
 * - Calls decorate()
 * - Allows global hook injection via window.Video?.hooks
 */
export default (block) => decorate(block, window.Video?.hooks);
