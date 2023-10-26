import { createElement } from '../../scripts/scripts.js';

let products = window.categoryData;
let filters = JSON.parse(sessionStorage.getItem('filter-attribs'));
let isDecorated = false;

const renderBlock = async (block) => {
  const filterTitle = createElement('h3', { classes: 'filters-title', textContent: 'Filters' });
  const filterForm = createElement('form', { classes: 'filter-form', props: { id: 'filter-form' } });
  const buttonsWrapper = createElement('div', { classes: 'filters-buttons-wrapper' });
  const clearFilterBtn = createElement('button', {
    classes: ['clear-filter-btn', 'filter-btn', 'secondary'],
    props: {
      type: 'submit', form: 'filter-form', disabled: 'disabled', id: 'clear-filter-btn',
    },
    textContent: 'Clear Filters',
  });
  const applyFilterBtn = createElement('button', {
    classes: ['apply-filter-btn', 'filter-btn', 'primary'],
    props: {
      type: 'submit', form: 'filter-form', disabled: 'disabled', id: 'apply-filter-btn',
    },
    textContent: 'Apply',
  });
  const filterList = createElement('ul', { classes: 'filter-list' });

  // filter the data to add extra filters to every attribute
  filters.forEach((attribute) => {
    const filterItem = createElement('li', { classes: 'filter-item' });
    const titleWrapper = createElement('div', { classes: 'filter-title-wrapper' });
    const filterAttrib = createElement('h6', { classes: 'filter-title', textContent: attribute });
    const plusBtn = createElement('span', { classes: ['plus-btn', 'fa', 'fa-plus'] });
    const filterOptionsWrapper = createElement('ul', {
      classes: ['filter-options-wrapper', 'hidden'],
    });
    const set = new Set();
    products.forEach((product) => {
      if (product[attribute] !== '') set.add(product[attribute]);
    });
    if (set.size <= 0) return;
    [...set].sort().forEach((el) => {
      const filterOption = createElement('li', { classes: 'filter-option' });
      const inputId = `${attribute ? attribute.replace(' ', '_') : null}<&>${el ? el.replace(' ', '_') : null}`;
      const filterInput = createElement('input', {
        classes: 'filter-input',
        props: {
          type: 'checkbox',
          'data-filter-title': attribute,
          value: el,
          id: inputId,
        },
      });
      const filterLabel = createElement('label', {
        classes: 'filter-label',
        textContent: el,
        props: {
          for: inputId,
        },
      });
      filterOption.append(filterInput, filterLabel);
      filterOptionsWrapper.appendChild(filterOption);
    });
    titleWrapper.append(filterAttrib, plusBtn);
    filterItem.append(titleWrapper, filterOptionsWrapper);
    filterList.appendChild(filterItem);
  });

  filterList.onclick = (e) => {
    const elements = ['filter-title-wrapper', 'filter-title', 'plus-btn'];
    if (elements.some((el) => e.target.classList.contains(el))) {
      const element = e.target.classList.contains('filter-title-wrapper')
        ? e.target
        : e.target.parentElement;
      element.classList.toggle('active');
      element.nextElementSibling.classList.toggle('hidden');
    }
    if (e.target.classList.contains('filter-input')) {
      /* enable/disable the Apply button
       * depending on if there is at least one checked input of the whole list */
      const parentFilterList = e.target.closest('.filter-list');
      const filterInputs = parentFilterList.querySelectorAll('.filter-input');
      const checkedInputs = [...filterInputs].filter((el) => el.checked);
      const isChecked = checkedInputs.length > 0;
      const targetBtnsWrapper = parentFilterList.previousElementSibling;
      targetBtnsWrapper.querySelector('.apply-filter-btn').disabled = !isChecked;
    }
  };

  filterForm.onsubmit = (e) => {
    e.preventDefault();
    const { submitter: { id } } = e;
    const isApply = id === 'apply-filter-btn';
    if (isApply) {
      const checkedInputs = [...filterList.querySelectorAll('.filter-input:checked')];
      const filteredAttrib = [];
      filterForm.querySelector('.clear-filter-btn').disabled = false;
      // [{ title, values: [value1, value2, ...] }]
      checkedInputs.forEach((el) => {
        const title = el.dataset.filterTitle;
        const { value } = el;
        const obj = filteredAttrib.find((attrib) => attrib.title === title);
        if (obj) {
          obj.values.push(value);
        } else {
          filteredAttrib.push({ title, values: [value] });
        }
      });
      const filteredProducts = new Set();
      products.forEach((product) => {
        const isFiltered = filteredAttrib.every((attrib) => attrib
          .values.includes(product[attrib.title]));
        if (isFiltered) filteredProducts.add(product);
      });
      const event = new CustomEvent('FilteredProducts', { detail: { filteredProducts } });
      document.dispatchEvent(event);
    } else {
      filterForm.reset();
      filterForm.querySelector('.clear-filter-btn').disabled = true;
      filterForm.querySelector('.apply-filter-btn').disabled = true;
      const event = new CustomEvent('FilteredProducts', { detail: { filteredProducts: products } });
      document.dispatchEvent(event);
      // close active title filters
      const activeTitles = [...filterList.querySelectorAll('.filter-title-wrapper.active')];
      activeTitles.forEach((el) => {
        el.classList.remove('active');
        el.nextElementSibling.classList.add('hidden');
      });
    }
  };

  buttonsWrapper.append(clearFilterBtn, applyFilterBtn);
  filterForm.append(buttonsWrapper, filterList);
  block.append(filterTitle, filterForm);
};

const isRenderedCheck = (block) => {
  if (filters && products && !isDecorated) {
    isDecorated = true;
    renderBlock(block);
  }
};

export default async function decorate(block) {
  isRenderedCheck(block);
  if (isDecorated) return;
  ['FilterAttribsLoaded', 'CategoryDataLoaded'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      filters = JSON.parse(sessionStorage.getItem('filter-attribs'));
      products = JSON.parse(sessionStorage.getItem('category-data'));
      isRenderedCheck(block);
    });
  });
}
