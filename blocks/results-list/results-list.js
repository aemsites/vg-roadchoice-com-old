import { createElement } from '../../scripts/scripts.js';
import productCard from './product-card.js';
import productsWorker from '../../scripts/delayed.js';

let amountOfProducts;
let products;
let query;
let category;
let hasImagesData = false;
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  amountOfProducts = JSON.parse(sessionStorage.getItem('amount'));
  products = JSON.parse(sessionStorage.getItem('results'));
  query = JSON.parse(sessionStorage.getItem('query'));
  category = new URLSearchParams(window.location.search).get('cat');
  if (category) {
    products = products.filter((item) => item['Part Category'].toLowerCase() === category);
  }
}

const searchType = (query.searchType === 'cross' && 'cross') || 'parts';

export default async function decorate(block) {
  const resultsSection = createElement('div', { classes: 'results-section' });
  const productList = createElement('ul', { classes: 'results-list' });

  productsWorker.onmessage = ({ data }) => {
    if (data.imgData && !hasImagesData) {
      hasImagesData = true;
      const event = new CustomEvent('ImagesLoaded', { detail: data.imgData });
      document.dispatchEvent(event);
    }
    // when all messages are send, save the data in the window object again
    if (data.crData && data.pnData && data.imgData) {
      if (!Object.prototype.hasOwnProperty.call(window, 'allProducts')) {
        window.allProducts = data;
      }
    }
  };

  const loadingElement = createElement('div', { classes: 'loading', textContent: 'Loading...' });
  resultsSection.append(loadingElement);

  const isTruckLibrary = (text) => text.includes('trucklibrary.com');

  document.addEventListener('ImagesLoaded', ({ detail }) => {
    loadingElement.remove();
    products.forEach((prod, idx) => {
      prod.hasImage = false;
      const filterLoop = detail.filter((e) => e['Part Number'] === prod['Base Part Number']
      && ((isTruckLibrary(e['Image URL']) && e['Image URL'].includes('.0?$'))
      || (!isTruckLibrary(e['Image URL']) && e['Image URL'].includes('-0.jpg'))));
      if (filterLoop.length >= 1) {
        prod.hasImage = true;
        prod.imgUrl = filterLoop[0]['Image URL'];
      }
      const productItem = productCard(prod, searchType);
      if (idx >= amountOfProducts) productItem.classList.add('hidden');
      productList.appendChild(productItem);
    });
  });

  resultsSection.append(productList);

  block.textContent = '';
  block.append(resultsSection);
}
