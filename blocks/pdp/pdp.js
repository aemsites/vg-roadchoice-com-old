import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

const title = getMetadata('og:title');
const description = getMetadata('og:description');
const docRange = document.createRange();

async function buildSection(container, sectionName = '') {
  const selectedContent = container.querySelector(`.${sectionName}-container .${sectionName}-wrapper`);
  const sectionClassList = sectionName === 'breadcrumbs' ? ['section', 'template', 'pdp', `${sectionName}-container`] : `${sectionName}-container`;
  const sectionContainer = createElement('div', { classes: sectionClassList });

  sectionContainer.append(selectedContent);

  return sectionContainer;
}

function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return { category: urlParams.get('category'), sku: urlParams.get('sku') };
}

function findPartBySKU(parts, sku) {
  return parts.find((part) => part['Base Part Number'].toLowerCase() === sku.toLowerCase());
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} doc The document element
 * @param {Object} pathSegments Object with categroy name and id of the part
 */
export async function getPDPData(pathSegments) {
  const { category, sku } = pathSegments;

  try {
    const route = `/product-data/rc-${category}.json`;
    const response = await fetch(route);
    const { data } = await response.json();
    return findPartBySKU(data, sku);
  } catch (error) {
    console.error('Error fetching part data:', error);
  }
  return null;
}

function findPartImagesBySKU(parts, sku) {
  return parts.data.find((part) => part['Part Number'].toLowerCase() === sku.toLowerCase());
}

async function fetchPartImages(sku) {
  try {
    const route = '/product-images/road-choice-website-images.json';
    const response = await fetch(route);
    const data = await response.json();
    const images = findPartImagesBySKU(data, sku);

    if (images.length !== 0 ) {
      return images;
    }
  } catch (error) {
    console.error('Error fetching part image(s):', error);
  }
  return ['default-placeholder-image'];
}

function renderColDetails(part, listEle) {
  const colKeys = ['Base Part Number',
    'Mack Part Number',
    'Volvo Part Number',
    'Subcategory',
    'Subcategory2',
    'Order Type',
    'Part Name',
    'Category',
    'Parma',
  ];
  const keys = Object.keys(part);

  keys.forEach((key) => {
    if (!colKeys.includes(key) && part[key].length) {
      const liFragment = docRange.createContextualFragment(`<li class="pdp-list-item">
        <span class="pdp-list-item-title"> ${key}:</span>
        <span class="pdp-list-item-value"> ${part[key]}</span>
      </li>`);
      listEle.append(liFragment);
    }
  });
}

// TODO: fetch part image(s) based on part number and render them along with part info.
async function renderPartDetails(part, block) {
  const image = await fetchPartImages(part['Base Part Number']);
  const fragment = `
    <div class="pdp-details-wrapper">
      <div class="pdp-image-column">
        <div class="pdp-image-wrapper">
          <div class="pdp-selected-image">
            <img class="pdp-image" src="https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com/media/images/24CRC--0.jpg"/>
          </div>
          <ul class="pdp-image-list">
            <li class="pdp-image-item active"> 
              <img src="https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com/media/images/24CRC--0.jpg" />
            </li>
            <li class="pdp-image-item"> 
              <img src="https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com/media/images/24CRC--1.jpg" />
            </li>
            <li class="pdp-image-item"> 
              <img src="https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com/media/images/24CRC--2.jpg" />
            </li>
          </ul>
        </div>
      </div>
      <div class="pdp-content-coulmn">
        <h1 class="pdp-title">${part['Base Part Number']}</h1>
        <div class="pdp-description"> ${part['Part Name']}</div>
        <ul class="pdp-list">
        </ul>
      </div>
    </div>
  `;

  const pdpFragment = docRange.createContextualFragment(fragment);
  block.append(pdpFragment);
  renderColDetails(part, block.querySelector('.pdp-list'));
}

// filter the catalogs by category and group them by language
function findCatalogsPDSByCategory(data, category) {
  const catalogs = data.filter((catalog) => catalog.category.replace(/[^\w]/g, '').toLowerCase() === category.replace(/[^\w]/g, '').toLowerCase());

  if (catalogs) {
    return catalogs.reduce((acc, cur) => {
      (acc[cur.language] = acc[cur[catalogs]] || []).push(cur);
      return acc;
    }, []);
  }
  return [];
}

// Check if product has catalog, product sheet , ecatalaogs section
async function fetchCatalogPDS(category) {
  try {
    const route = '/catalogs-categories.json';
    const response = await fetch(route);
    const { data } = await response.json();

    return findCatalogsPDSByCategory(data, category);
  } catch (error) {
    console.error('Error fetching part catalogs:', error);
  }
  return null;
}

function renderCatlaogsPDS(catalogs) {
  console.log('Inside rendering catalogs', catalogs);
}

export default async function decorate(block) {
  document.querySelector('main .search').classList.add('hide');
  const pathSegments = getQueryParams();
  const part = await getPDPData(pathSegments);

  if (part) {
    await renderPartDetails(part, block);
  }

  // check if we have catalogs, PDS section
  const catalogs = await fetchCatalogPDS(pathSegments.category);
  if (catalogs) {
    renderCatlaogsPDS(catalogs);
  }
}
