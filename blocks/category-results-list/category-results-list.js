import productsWorker from '../../scripts/delayed.js';
import { createElement } from '../../scripts/scripts.js';
import productCard from '../results-list/product-card.js';

let amount;
let products;
let hasImagesData = false;
const searchType = 'parts';

const renderBlock = async (block) => {
  const resultsWrapper = createElement('div', { classes: 'results-wrapper' });
  const productList = createElement('ul', { classes: 'results-list' });
  const loadingElement = createElement('div', { classes: 'loading', textContent: 'Loading...' });

  productsWorker.onmessage = ({ data }) => {
    if (products && data.imgData && !hasImagesData) {
      hasImagesData = true;
      const event = new CustomEvent('ImagesLoaded', { detail: data.imgData });
      document.dispatchEvent(event);
    }
  };

  resultsWrapper.append(productList, loadingElement);
  block.append(resultsWrapper);

  document.addEventListener('ImagesLoaded', ({ detail }) => {
    loadingElement.remove();
    products.forEach((prod, idx) => {
      prod.hasImage = false;
      detail.find((e) => {
        if (e['Part Number'] === prod['Base Part Number']) {
          prod.hasImage = true;
        }
        return null;
      });
      const productItem = productCard(prod, searchType);
      if (idx >= amount) productItem.classList.add('hidden');
      productList.appendChild(productItem);
    });
  });
};

export default async function decorate(block) {
  document.addEventListener('CategoryDataLoaded', () => {
    amount = JSON.parse(sessionStorage.getItem('amount'));
    products = JSON.parse(sessionStorage.getItem('category-data'));
    renderBlock(block);
  });
}
