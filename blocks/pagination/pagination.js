import { getTextLabel, createElement } from '../../scripts/scripts.js';

let amount;
let products;
let moreBtns = [];
const partNumberText = getTextLabel('part number');
const displayedTextContent = getTextLabel('pagination text');
const buttonTextContent = getTextLabel('pagination button');
const firstWord = partNumberText.split(' ')[0];
const isSearchResult = document.querySelector('.search-results') !== null;
const category = new URLSearchParams(window.location.search).get('cat');

if (isSearchResult) {
  amount = JSON.parse(sessionStorage.getItem('amount'));
  products = JSON.parse(sessionStorage.getItem('results'));
  if (category) {
    products = products.filter((item) => item['Part Category'] === category);
  }
}

const hasMoreItems = products && [...products].length > amount;
let currentAmount = hasMoreItems ? amount : [...products].length;
const newText = displayedTextContent.replace('[$]', currentAmount);

const loadMoreProducts = (props) => {
  const { hidden, amountText } = props;
  const { length } = hidden;
  const isLessThanAmount = length < amount;
  const nextAmount = isLessThanAmount ? length : amount;
  currentAmount += nextAmount;

  for (let i = 0; i < nextAmount; i += 1) {
    hidden[i].classList.remove('hidden');
  }

  amountText.textContent = displayedTextContent.replace('[$]', currentAmount);

  if (isLessThanAmount) moreBtns.forEach((btn) => btn.classList.add('hidden'));
};

const addShowMoreHandler = (btn, resultsListBlock, amountText) => {
  btn.onclick = () => loadMoreProducts({
    hidden: resultsListBlock.querySelectorAll('.product.hidden'),
    amountText,
  });
};

export default async function decorate(block) {
  const paginationSection = createElement('div', { classes: 'pagination-section' });

  const paginationTitle = createElement('h2', { classes: 'title', textContent: `${firstWord}s` });

  const showingSection = createElement('div', { classes: 'showing-section' });
  const displayedText = createElement('p', { classes: 'displayed-text', textContent: `${newText}` });
  showingSection.append(displayedText);

  if (hasMoreItems) {
    const moreBtn = createElement('button', {
      classes: ['more-button', 'hidden'], textContent: buttonTextContent,
    });
    const bottomMoreBtn = createElement('button', {
      classes: ['more-button', 'bottom-more-button'], textContent: buttonTextContent,
    });
    const resultsListBlock = document.querySelector('.results-list.block');
    addShowMoreHandler(moreBtn, resultsListBlock, displayedText);
    addShowMoreHandler(bottomMoreBtn, resultsListBlock, displayedText);
    showingSection.append(moreBtn);

    document.addEventListener('ImagesLoaded', () => {
      resultsListBlock.querySelector('.results-section').appendChild(bottomMoreBtn);
      moreBtn.classList.remove('hidden');
      moreBtns = [moreBtn, bottomMoreBtn];
    });
  }

  paginationSection.append(paginationTitle, showingSection);

  block.textContent = '';
  block.append(paginationSection);
}
