import productsWorker from '../../scripts/delayed.js';
import { createElement } from '../../scripts/scripts.js';
import productCard from '../results-list/product-card.js';

let amount;
let products;
let hasImagesData = false;
let imgData;
const searchType = 'parts';

productsWorker.onmessage = ({ data }) => {
  if (products && data.imgData && !hasImagesData) {
    hasImagesData = true;
    imgData = data.imgData;
    const event = new CustomEvent('ImagesLoaded', { detail: data.imgData });
    document.dispatchEvent(event);
  }
};

const getImagesData = ({ productList, loadingElement, detail }) => {
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
};

const addImagesHandler = ({ productList, loadingElement }) => {
  document.addEventListener('ImagesLoaded', ({ detail }) => {
    getImagesData({ productList, loadingElement, detail });
  });
};

const renderBlock = async (block) => {
  const resultsWrapper = createElement('div', { classes: 'results-wrapper' });
  const productList = createElement('ul', { classes: 'results-list' });
  const loadingElement = createElement('div', { classes: 'loading', textContent: 'Loading...' });

  resultsWrapper.append(productList, loadingElement);
  block.append(resultsWrapper);

  if (!hasImagesData) addImagesHandler({ productList, loadingElement });
  else getImagesData({ productList, loadingElement, detail: imgData });
};

export default async function decorate(block) {
  document.addEventListener('CategoryDataLoaded', () => {
    amount = JSON.parse(sessionStorage.getItem('amount'));
    products = JSON.parse(sessionStorage.getItem('category-data'));
    renderBlock(block);
  });
  document.addEventListener('FilteredProducts', (e) => {
    products = [...e.detail.filteredProducts];
    const bottomBtn = block.querySelector('.bottom-more-button');
    block.textContent = '';
    renderBlock(block);
    if (products.length > amount) {
      block.querySelector('.results-wrapper').appendChild(bottomBtn);
    }
  });
}
