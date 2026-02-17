/**
 * Video Block
 * Supports YouTube, Vimeo, and direct MP4 videos with autoplay and placeholder image support.
 * 
 * Similar to embed block but focused specifically on video content.
 */

const loadScript = (url) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  head.append(script);
  return script;
};

const getVideoEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allowfullscreen allow="encrypted-media" title="Video from ${url.hostname}" loading="lazy"></iframe>
  </div>`;

const embedYouTube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com/embed/${vid}?rel=0${suffix}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy" title="Video from YouTube"></iframe>
    </div>`;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  return `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
        style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        frameborder="0" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Video from Vimeo"></iframe>
    </div>`;
};

const loadVideo = (block, link, autoplay) => {
  if (block.dataset.embedLoaded === 'true') return;

  const url = new URL(link);
  let videoHTML;

  if (link.includes('youtube.com') || link.includes('youtu.be')) {
    videoHTML = embedYouTube(url, autoplay);
  } else if (link.includes('vimeo.com')) {
    videoHTML = embedVimeo(url, autoplay);
  } else if (link.endsWith('.mp4')) {
    videoHTML = `<video controls${autoplay ? ' autoplay muted' : ''}>
      <source src="${link}" type="video/mp4">
    </video>`;
  } else {
    videoHTML = getVideoEmbed(url);
  }

  block.innerHTML = videoHTML;
  block.dataset.embedLoaded = 'true';
};

/**
 * Decorates the video block
 * @param {HTMLElement} block - The video block element
 * @param {Object} options - Configuration options
 * @returns {void}
 */
export default function decorate(block, options = {}) {
  const ctx = { block, options };

  // Lifecycle hook + event (before)
  options.onBefore?.(ctx);
  block.dispatchEvent(new CustomEvent('video:before', { detail: ctx }));

  block.dataset.embedLoaded = 'false';
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a')?.href;

  if (!link) {
    return;
  }

  block.textContent = '';

  if (placeholder) {
    // With placeholder: click to play
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.innerHTML = '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadVideo(block, link, true);
    });
    block.append(wrapper);
  } else {
    // No placeholder: autoplay on scroll
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadVideo(block, link, false);
      }
    });
    observer.observe(block);
  }

  // Lifecycle hook + event (after)
  options.onAfter?.(ctx);
  block.dispatchEvent(new CustomEvent('video:after', { detail: ctx }));
}
