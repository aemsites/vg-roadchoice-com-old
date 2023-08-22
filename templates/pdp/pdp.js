import {
    getMetadata,
  } from '../../scripts/lib-franklin.js';
  import { createElement, getPathSegments } from '../../scripts/scripts.js';
  
  const title = getMetadata('og:title');
  const description = getMetadata('og:description');
  
  async function buildSection(container, sectionName = '') {
    const selectedContent = container.querySelector(`.${sectionName}-container .${sectionName}-wrapper`);
    const sectionClassList = sectionName === 'breadcrumbs' ? ['section', 'template', 'pdp', `${sectionName}-container`] : `${sectionName}-container`;
    const sectionContainer = createElement('div', { classes: sectionClassList });
  
    sectionContainer.append(selectedContent);
  
    return sectionContainer;
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
  
    const defaultContent = container.querySelector('.default-content-wrapper');
  
    const partTitle = createElement('h1', { classes: ['part-title'] });
    partTitle.textContent = title;
  
    const partDescription = createElement('p', { classes: ['part-description'] });
    partDescription.textContent = description;
  
    defaultContent.insertAdjacentElement('afterbegin', partDescription);
    defaultContent.insertAdjacentElement('afterbegin', partTitle);
  
    currentPart.append(defaultContent);
    partTexts.append(currentPart, recommendationsSection);
    part.append(breadSection, partTexts);
  
    container.innerText = '';
    container.append(part);
    
    const pathSegments = getPathSegments();
    await getPDPData(doc, pathSegments);
  }

  /**
 * Loads JS and CSS for a block.
 * @param {Element} doc The document element
 * @param {Array} pathSegments The array with url elements
 */
export async function getPDPData(doc, pathSegments) {
    debugger;
    const category = pathSegments[2];
    const sku = pathSegments[3];

    fetchPartsData(doc, category, sku);
}

async function fetchPartsData(doc, category, sku){
    try {
        const route = '/product-data/rc-' + category + '.json';
        const response = await fetch(route);
        const data = await response.json();
        const part = findPartBySKU(data, sku);
        
        if (part){
            await renderPartDetails(doc, part);
        } else {
            doc.getElementById('part-details').innerText = 'Part not found';
        }
    } catch(error){
        console.error('Error fetching part data:', error);
    }

}

function findPartBySKU(parts, sku){
    return parts.data.find(part => part["Base Part Number"].toLowerCase() === sku.toLowerCase());
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
    return parts.data.find(part => part["Part Number"].toLowerCase() === sku.toLowerCase());
}

//TODO: fetch part image(s) based on part number and render them along with part info.
async function renderPartDetails(doc, part){

    const partImages = await fetchPartImages(part['Base Part Number']);
    const partDetailsContainer = doc.querySelector('.part-details');
    const partHTML = `
        <h1>${part['Base Part Number']}</h1>
        <p><strong>${part['Base Part Number']}: </strong>${part['Part Name']}</p>
        <p><picture>${partImages['Image URL']}</picture></p>
    `;
    partDetailsContainer.innerHTML = partHTML;
}