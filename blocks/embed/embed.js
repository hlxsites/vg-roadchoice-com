import { createIframe, isVideoLink } from '../../scripts/scripts.js';

const ratioWidth = 16;
const ratioHeight = 9;
const defaultWidth = '100';

export default function decorate(block) {
  const link = block.querySelector(':scope a');
  const videoContainer = block.querySelector(':scope > div');
  const isYTLink = isVideoLink(link);
  // if has Width class, use that to set the ratio
  const configWidth = block.className.includes('width-')
    ? block.className.split('width-')[1].split(' ')[0] : null;
  videoContainer.className = 'embed-video-container';
  videoContainer.textContent = '';
  if (!isYTLink) {
    // eslint-disable-next-line no-console
    console.warn('%cEmbed block: Not an embedded YouTube link', 'color: cornflowerblue', { link });
    return;
  }

  if (configWidth !== null && configWidth !== defaultWidth) {
    const newRatioHeight = Math.round((ratioHeight / ratioWidth) * configWidth);
    videoContainer.style.setProperty('--embed-video-width', `${configWidth}%`);
    videoContainer.style.setProperty('--embed-video-height', `${newRatioHeight}%`);
  }

  createIframe(link, { parentEl: videoContainer, className: 'embed-video' });
}
