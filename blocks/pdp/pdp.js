import { getMetadata,} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';
  
const title = getMetadata('og:title');
const description = getMetadata('og:description');

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

function findPartBySKU(parts, sku){
  return parts.find(part => part['Base Part Number'].toLowerCase() === sku.toLowerCase());
}

export default async function decorate(block) {
  document.querySelector('main .search').classList.add('hide');
  const pathSegments = getQueryParams();
  const part = await getPDPData(pathSegments);

  if (part) {
    await renderPartDetails(part);
  }

  // check if we have catalogs, PDS section
  const catalogs = await fetchCatalogPDS(pathSegments.category);
  if (catalogs) {
    renderCatlaogsPDS(catalogs);
  }
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
  } catch(error) {
    console.error('Error fetching part data:', error);
  }
}


async function fetchPartImages(sku){
  try {
    const route = '/product-images/road-choice-website-images.json'
    const response = await fetch(route);
    const data = await response.json();
    const images = findPartImagesBySKU(data, sku);
    
    if (images.length !== 0 ){
      return images;
    } else {
      return ['default-placeholder-image'];
    }
  } catch(error){
    console.error('Error fetching part image(s):', error);
  }
}

function findPartImagesBySKU(parts, sku){
  return parts.data.find(part => part['Part Number'].toLowerCase() === sku.toLowerCase());
}

//TODO: fetch part image(s) based on part number and render them along with part info.
async function renderPartDetails(part){

  console.log(part);
}

// filter the catalogs by category and group them by language
function findCatalogsPDSByCategory(data, category) {
  let catalogs = data.filter(catalog => catalog.category.replace(/[^\w]/g, '').toLowerCase() === category.replace(/[^\w]/g, '').toLowerCase());

  if (catalogs) {
    return catalogs.reduce((acc, cur) => { 
      (acc[cur['language']] = acc[cur[catalogs]] || []).push(cur);
      return acc;
    },[]);
  }
  return [];
}

// Check if product has catalog, product sheet , ecatalaogs section 
async function fetchCatalogPDS(category) {
  try {
    const route = '/catalogs-categories.json'
    const response = await fetch(route);
    const { data } = await response.json();
   
    return findCatalogsPDSByCategory(data, category);
  } catch(error){
    console.error('Error fetching part catalogs:', error);
  }
}

function renderCatlaogsPDS (catalogs) {
  console.log("Inside rendering catalogs", catalogs);
}