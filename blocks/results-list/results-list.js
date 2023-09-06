import { createElement } from '../../scripts/scripts.js';
import productCard from './product-card.js';
import productsWorker from '../../scripts/delayed.js';

const amountOfProducts = 12;
let products;
let query;
let hasImagesData = false;
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  sessionStorage.setItem('amount', amountOfProducts);
  products = JSON.parse(sessionStorage.getItem('results'));
  query = JSON.parse(sessionStorage.getItem('query'));
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

  document.addEventListener('ImagesLoaded', ({ detail }) => {
    loadingElement.remove();
    products.forEach((prod, idx) => {
      prod.hasImage = false;
      detail.find((e) => {
        if (e['Part Number'] === prod['Base Part Number']) {
          prod.hasImage = true;
          prod.imgUrl = e['Image URL'];
        }
        return null;
      });
      const productItem = productCard(prod, searchType);
      if (idx >= amountOfProducts) productItem.classList.add('hidden');
      productList.appendChild(productItem);
    });
  });

  resultsSection.append(productList);

  block.textContent = '';
  block.append(resultsSection);
}
