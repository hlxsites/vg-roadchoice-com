/* eslint-disable no-useless-concat */
import { getMetadata } from '../../scripts/lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import { createElement, getQueryParams, findParamByName } from '../../scripts/scripts.js';

async function buildSection(container, sectionName = '') {
  const selectedContent = container.querySelector(`.${sectionName}-container .${sectionName}-wrapper`);
  const sectionClassList = sectionName === 'breadcrumbs' ? ['section', 'template', 'pdp', `${sectionName}-container`] : `${sectionName}-container`;
  const sectionContainer = createElement('div', { classes: sectionClassList });

  sectionContainer.append(selectedContent);

  return sectionContainer;
}

function findPartImagesBySKU(parts, sku) {
  return parts.data.find((part) => part['Part Number'].toLowerCase() === sku.toLowerCase());
}

async function fetchPartImages(sku) {
  try {
    const route = '/product-images/road-choice-website-images.json?limit=100000';
    const response = await fetch(route);
    const data = await response.json();
    const images = findPartImagesBySKU(data, sku);

    if (images.length !== 0) {
      return images;
    }
  } catch (error) {
    console.error('Error fetching part image(s):', error);
  }
  return ['default-placeholder-image'];
}

// TODO: fetch part image(s) based on part number and render them along with part info.
async function renderPartDetails(doc, part) {
  const partImages = await fetchPartImages(part['Base Part Number']);
  const partDetailsContainer = doc.querySelector('.part-details');
  const partHTML = `
            <h1>${part['Base Part Number']}</h1>
            <p><strong>${part['Base Part Number']}: </strong>${part['Part Name']}</p>
            <p><picture><img style='width:400px;height=400px' src='${partImages['Image URL']}'/></picture></p>
        `;
  partDetailsContainer.innerHTML = partHTML;
}

function findPartBySKU(parts, sku) {
  return parts.data.find((part) => part['Base Part Number'].toLowerCase() === sku.toLowerCase());
}

function createMetadata(document, part, propVal) {
  if (propVal === 'og:title') {
    const title = createElement('meta', {
      props: {
        property: `${propVal}`,
        content: `${part['Base Part Number']}`,
      },
    });
    document.head.appendChild(title);
  }
  if (propVal === 'og:description') {
    const desc = createElement('meta', {
      props: {
        property: `${propVal}`,
        content: `${part['Part Name']}`,
      },
    });
    document.head.appendChild(desc);
  }
}

async function updateMetadata(doc, part) {
  const title = doc.head.querySelector('meta[property="og:title"]');
  if (title) {
    title.setAttribute('content', part['Base Part Number']);
  } else {
    createMetadata(doc, part, 'og:title');
  }

  const desc = doc.head.querySelector('meta[property="og:description"]');
  if (desc) {
    desc.setAttribute('content', part['Part Name']);
  } else {
    createMetadata(doc, part, 'og:description');
  }
}

async function fetchPartsData(doc, category, sku) {
  try {
    const route = '/product-data/rc-' + `${category}` + '.json';
    const response = await fetch(route);
    const data = await response.json();
    const part = findPartBySKU(data, sku);
    if (part) {
      await renderPartDetails(doc, part);
      await updateMetadata(doc, part);
    } else {
      doc.getElementById('part-details').innerText = 'Part not found';
    }
  } catch (error) {
    console.error('Error fetching part data:', error);
  }
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} doc The document element
 * @param {Array} pathSegments The array with url elements
 */
export async function getPDPData(doc, queryParams) {
  const category = findParamByName(queryParams, 'category');
  const sku = findParamByName(queryParams, 'partnumber');
  fetchPartsData(doc, category, sku);
}

export default async function decorate(doc) {
  debugger;
  const container = doc.querySelector('main');
  const part = createElement('div', { classes: ['part-details'] });

  const partTexts = createElement('div', { classes: ['section', 'template', 'pdp', 'part-texts-container'] });
  const currentPart = createElement('div', { classes: ['current-part-container'] });

  const [
    breadSection,
    recommendationsSection,
  ] = await Promise.all([
    buildSection(container, 'breadcrumb'),
    buildSection(container, 'recommendations'),
  ]);

  const defaultContent = container.querySelector('.section');

  const partTitle = createElement('h1', { classes: ['part-title'] });
  partTitle.textContent = doc.querySelector('meta[name="og:title"');

  const partDescription = createElement('p', { classes: ['part-description'] });
  partDescription.textContent = getMetadata('og:description');

  defaultContent.insertAdjacentElement('afterbegin', partDescription);
  defaultContent.insertAdjacentElement('afterbegin', partTitle);

  currentPart.append(defaultContent);
  partTexts.append(currentPart, recommendationsSection);
  part.append(breadSection, partTexts);

  container.innerText = '';
  container.append(part);

  const queryParams = getQueryParams();
  await getPDPData(doc, queryParams);
}
