import { getTextLabel, createElement } from '../../scripts/scripts.js';

let amount;
let newText;
let products;
let displayBtn;
const partNumberText = getTextLabel('part number');
const displayedTextContent = getTextLabel('pagination text');
const buttonTextContent = getTextLabel('pagination button');
const firstWord = partNumberText.split(' ')[0];
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  amount = JSON.parse(sessionStorage.getItem('amount'));
  products = JSON.parse(sessionStorage.getItem('results'));
}

if ([...products].length <= amount) {
  newText = displayedTextContent.replace('[$]', [...products].length);
  displayBtn = false;
} else {
  newText = displayedTextContent.replace('[$]', amount);
  displayBtn = true;
}

const loadMoreProducts = () => {
  // todo make more products appear at the end and update the amount
  console.log('click');
};

export default async function decorate(block) {
  const paginationSection = createElement('div', { classes: 'pagination-section' });

  const paginationTitle = createElement('h2', { classes: 'title', textContent: `${firstWord}s` });

  const moreProductsSection = createElement('div', { classes: 'more-section' });
  const displayedText = createElement('p', { classes: 'displayed-text', textContent: `${newText}` });
  moreProductsSection.append(displayedText);

  const moreBtn = createElement('button', { classes: 'more-button', textContent: buttonTextContent });
  moreBtn.onclick = () => loadMoreProducts();
  if (displayBtn) moreProductsSection.append(moreBtn);

  paginationSection.append(paginationTitle, moreProductsSection);

  block.textContent = '';
  block.append(paginationSection);
}
