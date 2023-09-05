import { getTextLabel, createElement } from '../../scripts/scripts.js';

let amount;
let products;
const partNumberText = getTextLabel('part number');
const displayedTextContent = getTextLabel('pagination text');
const buttonTextContent = getTextLabel('pagination button');
const firstWord = partNumberText.split(' ')[0];
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  amount = JSON.parse(sessionStorage.getItem('amount'));
  products = JSON.parse(sessionStorage.getItem('results'));
}

const hasMoreItems = products && [...products].length > amount;
let currentAmount = hasMoreItems ? amount : [...products].length;
const newText = displayedTextContent.replace('[$]', currentAmount);

const loadMoreProducts = (props) => {
  const { hidden, btn, amountText } = props;
  const { length } = hidden;
  const isLessThanAmount = length < amount;
  const nextAmount = isLessThanAmount ? length : amount;
  currentAmount += nextAmount;

  for (let i = 0; i < nextAmount; i += 1) {
    hidden[i].classList.remove('hidden');
  }

  amountText.textContent = displayedTextContent.replace('[$]', currentAmount);

  if (isLessThanAmount) btn.classList.add('hidden');
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
      classes: ['bottom-more-button', 'hidden'], textContent: buttonTextContent,
    });
    const resultsListBlock = document.querySelector('.results-list.block');
    moreBtn.onclick = () => loadMoreProducts({
      hidden: resultsListBlock.querySelectorAll('.product.hidden'),
      btn: moreBtn,
      amountText: displayedText,
    });
    showingSection.append(moreBtn);

    document.addEventListener('ImagesLoaded', () => {
      resultsListBlock.querySelector('.results-section').appendChild(bottomMoreBtn);
      moreBtn.classList.remove('hidden');
    });

    // TODO add an observer to check if resultsListBlock has data-block-status="loaded"
  }

  paginationSection.append(paginationTitle, showingSection);

  block.textContent = '';
  block.append(paginationSection);
}
