import { createElement } from '../../scripts/scripts.js';
import productCard from './product-card.js';

const amountOfProducts = 12;
let products;
let query;
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  sessionStorage.setItem('amount', amountOfProducts);
  products = JSON.parse(sessionStorage.getItem('results'));
  query = JSON.parse(sessionStorage.getItem('query'));
}

const searchType = (query.searchType === 'cross' && 'cross') || 'parts';

// todo delete this
// import mock from './mock.js';
// products = mock;

const getJSONData = async (url) => {
  const results = await fetch(url);
  const json = await results.json();
  return json;
};

const getImageUrls = (prods, images) => {
  prods.forEach((prod) => {
    prod.hasImage = false;
    // todo make this work on time
    images.data.find((e) => {
      if (e['Part Number'] === prod['Base Part Number']) {
        prod.hasImage = true;
      }
      return null;
    });
  });
};

const imagesUrl = '/product-images/road-choice-website-images.json';
const imageData = await getJSONData(imagesUrl);

await getImageUrls(products, imageData);

export default async function decorate(block) {
  const resultsSection = createElement('div', { classes: 'results-section' });
  const productList = createElement('ul', { classes: 'results-list' });

  products.forEach(async (product, idx) => {
    const productItem = productCard(product, searchType, idx, amountOfProducts);
    productList.appendChild(productItem);
  });

  resultsSection.append(productList);

  block.textContent = '';
  block.append(resultsSection);
}
