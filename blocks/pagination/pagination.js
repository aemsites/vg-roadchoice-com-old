import { getTextLabel, createElement } from '../../scripts/common.js';
import { amountOfProducts } from '../search/search.js';

const amount = JSON.parse(sessionStorage.getItem('amount')) || amountOfProducts;
let products = JSON.parse(sessionStorage.getItem('results')) || [];
let moreBtns = [];
let currentAmount = 0;
let hasMoreItems = false;
let newText = '';
let isDecorated = false;
let imageData = [];
const partNumberText = getTextLabel('part number');
const displayedTextContent = getTextLabel('pagination text');
const buttonTextContent = getTextLabel('pagination button');
const firstWord = partNumberText.split(' ')[0];
const category = new URLSearchParams(window.location.search).get('cat');
const blockName = 'pagination';

const loadMoreProducts = (props) => {
  const { hidden, amountText } = props;
  const { length } = hidden;
  const isLessThanAmount = length <= amount;
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

const addButtons = ({ resultsListBlock, moreBtn, bottomMoreBtn }) => {
  resultsListBlock.querySelector('.results-section').appendChild(bottomMoreBtn);
  moreBtn.classList.remove('hidden');
  moreBtns = [moreBtn, bottomMoreBtn];
};

const decoratePagination = (block) => {
  const paginationSection = createElement('div', { classes: `${blockName}-section` });
  const paginationTitle = createElement('h2', { classes: 'title', textContent: `${firstWord}s` });
  const showingSection = createElement('div', { classes: 'showing-section' });
  const displayedText = createElement('p', { classes: 'displayed-text' });
  if (category) {
    products = products.filter((item) => item['Part Category'].toLowerCase() === category);
  }
  hasMoreItems = products && products.length >= amount;
  currentAmount = hasMoreItems ? amount : [...products].length;
  newText = displayedTextContent.replace('[$]', currentAmount);
  displayedText.textContent = newText;
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

    if (imageData.length > 0) {
      addButtons({ resultsListBlock, moreBtn, bottomMoreBtn });
    } else {
      document.addEventListener('DataLoaded', () => {
        addButtons({ resultsListBlock, moreBtn, bottomMoreBtn });
      });
    }
  }

  paginationSection.append(paginationTitle, showingSection);

  block.append(paginationSection);
};

export default async function decorate(block) {
  document.addEventListener('DataLoaded', ({ detail }) => {
    products = detail.results;
    imageData = detail.data.imgData;
    if (!isDecorated) {
      isDecorated = true;
      if (products.length > 0) decoratePagination(block);
    }
  });

  if (sessionStorage.getItem('results') && !isDecorated) {
    isDecorated = true;
    if (products.length > 0) decoratePagination(block);
  }
}
