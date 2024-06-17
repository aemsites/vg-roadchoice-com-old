import { getAllElWithChildren } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/common.js';

export default function decorate(block) {
  const container = block.querySelector(':scope > div');
  const inputWrapper = createElement('div', { classes: 'find-dealer-input-wrapper' });
  const input = createElement('input', {
    classes: 'find-dealer-input',
    props: {
      title: 'code',
      type: 'text',
      placeholder: 'Search by ZIP Code',
    },
  });
  const searchButton = createElement('button', {
    classes: ['find-dealer-button', 'fa', 'fa-search'],
    props: {
      type: 'button',
    },
  });
  const navigateTo = (value) => {
    const url = new URL('/where-to-buy', window.location.href);
    url.searchParams.set('whereToBuy', value);
    window.location.href = url.toString();
  };
  container.className = 'find-dealer-form-container';
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      navigateTo(e.target.value);
    }
  };
  searchButton.onclick = (e) => {
    const inputSibling = e.target.previousElementSibling;
    if (inputSibling && inputSibling.tagName === 'INPUT') {
      navigateTo(inputSibling.value);
    }
  };

  [...container.children].forEach((element, i) => {
    element.className = `find-dealer-col-${i + 1}`;
  });
  if (getAllElWithChildren(container.firstElementChild.children, 'p').length < 1) {
    const p = createElement('p', { classes: 'find-dealer-text' });
    const col1 = container.firstElementChild;
    p.textContent = col1.textContent;
    col1.textContent = '';
    col1.appendChild(p);
  }

  inputWrapper.append(input, searchButton);
  container.lastElementChild.appendChild(inputWrapper);
}
