import { createElement, getJsonFromUrl as getFiltersData, getTextLabel } from '../../scripts/scripts.js';

let isCrossRefActive = true;
const modelsItems = [];
const FILTERS_DATA = '/search/search-filters.json';
let crData;
let pnData;
const amountOfProducts = 12;

const PLACEHOLDERS = {
  crossReference: getTextLabel('Cross-Reference No'),
  partNumber: getTextLabel('Part No'),
};

const TEMPLATES = {
  searchBy: `
  <div class="search__search-by__container">
    <label class="search__search-by__label" name="SearchBy">Search By</label>
    <div class="search__buttons__wrapper">
      <button class="button search__cross-reference__btn shadow active" type="button" name="crossReference">
        Cross-Reference
      </button>
      <button class="button search__part-number__btn shadow" type="button" name="partNumber">
        Part Number
      </button>
    </div>
  </div>
  `,
  filters: `
  <div class="search__filters__container">
    <div class="search__make-filter__wrapper">
      <label class="search__make-filter__label">Make</label>
      <select class="search__make-filter__select shadow">
        <option value="null">Make (All)</option>
      </select>
    </div>
    <div class="search__model-filter__wrapper">
      <label class="search__model-filter__label">Model</label>
      <select class="search__model-filter__select shadow" disabled>
        <option value="null">Model (All)</option>
      </select>
    </div>
  </div>
  `,
  filtersResetOpt: `
    <option value="null">Model (All)</option>
  `,
  inputCR: `
  <div class="search__input-cr__container">
    <label class="search__input-cr__label">Cross-Reference Number</label>
    <div class="search__input-cr__wrapper">
      <input class="search__input-cr__input shadow" type="search" placeholder="${PLACEHOLDERS.crossReference}" />
      <button class="button search__input-cr__submit shadow search-button" type="submit">
        SEARCH &nbsp;
        <span class="fa fa-search"></span>
      </button>
    </div>
  </div>
  `,
  inputPN: `
  <div class="search__input-pn__container">
    <label class="search__input-pn__label">Part Number</label>
    <div class="search__input-pn__wrapper">
      <input class="search__input-pn__input shadow" type="search" placeholder="${PLACEHOLDERS.partNumber}" />
      <button class="button search__input-pn__submit shadow search-button" type="submit">
        SEARCH &nbsp;
        <span class="fa fa-search"></span>
      </button>
    </div>
  </div>
  `,
};

function resetModelsFilter(models, disabled = true) {
  models.innerHTML = TEMPLATES.filtersResetOpt;
  models.disabled = disabled;
}

function addSearchByListeners(wrapper, form) {
  wrapper.onclick = (e) => {
    if (e.target.classList.contains('active')) return;
    // swap between search-by buttons
    form.querySelector('.search__cross-reference__btn').classList.toggle('active', !isCrossRefActive);
    form.querySelector('.search__part-number__btn').classList.toggle('active', isCrossRefActive);
    isCrossRefActive = !isCrossRefActive;
    // swap inputs and filters
    form.querySelector('.search__filters-input__container').classList.toggle('hide', isCrossRefActive);
    form.querySelector('.search__input-cr__container').classList.toggle('hide', !isCrossRefActive);
    // remove the value from the not active input
    form.querySelector(`.search__input-${isCrossRefActive ? 'pn' : 'cr'}__input`).value = '';
    // reset filters
    if (isCrossRefActive) {
      form.querySelector('.search__make-filter__select').selectedIndex = 0;
      resetModelsFilter(form.querySelector('.search__model-filter__select'));
    }
  };
}

function populateFilter(select, items) {
  const docRange = document.createRange();
  let htmlFragment = '';
  items.forEach((item) => {
    htmlFragment += `
      <option value="${item !== 'Others' ? item.toLowerCase() : 'null'}">${item}</option>
    `;
  });
  const fragment = docRange.createContextualFragment(htmlFragment);
  select.appendChild(fragment);
}

async function getAndApplyFiltersData(form) {
  const makeSelect = form.querySelector('.search__make-filter__select');
  const modelsSelect = form.querySelector('.search__model-filter__select');
  const makeItems = [];
  const filters = await getFiltersData(FILTERS_DATA);
  const { data } = filters;
  if (!data) return;
  data.forEach((item) => {
    const itemModels = item.Models !== 'null' ? item.Models.split(',') : [];
    modelsItems.push({ Make: item.Make, Models: itemModels });
    makeItems.push(item.Make);
  });
  populateFilter(makeSelect, makeItems);
  makeSelect.onchange = (e) => {
    const isNotNull = e.target.value !== 'null';
    // if is null then disable the models filter
    if (!isNotNull) {
      resetModelsFilter(modelsSelect);
      return;
    }
    // if is not null then enable the select and then is filled by the maker value
    const models = modelsItems.filter(
      (item) => item.Make.toLowerCase() === e.target.value,
    )[0].Models;
    resetModelsFilter(modelsSelect, false);
    populateFilter(modelsSelect, models);
  };
}

function searchCRPartNumValue(value) {
  const partNumberBrands = ['OEM_num', 'Base Part Number', 'VOLVO_RC', 'MACK_1000'];
  const results = new Set();
  partNumberBrands.forEach((brand) => {
    const tempResults = crData.filter(
      (item) => new RegExp(`.*${value}.*`, 'i').test(item[brand]),
    );
    if (tempResults.length > 0) {
      tempResults.forEach((item) => results.add(item));
    }
  });
  return [...results];
}

function filterResults(results, filter, isMake = true) {
  const itemFilter = isMake ? 'Make' : 'Model';
  return results.filter((item) => {
    const itemValue = item[itemFilter].toLowerCase();
    const filterValue = filter.toLowerCase();
    // if is Model, can have a list of models
    if (!isMake && itemValue.includes(',')) {
      const modelArray = itemValue.split(',').map((s) => s.trim());
      return modelArray.includes(filterValue);
    }
    return itemValue === filterValue;
  });
}

function searchPartNumValue(value, make, model) {
  const partNumberBrands = ['Base Part Number', 'Volvo Part Number', 'Mack Part Number'];
  const results = new Set();
  partNumberBrands.forEach((brand) => {
    let tempResults = pnData.filter((item) => new RegExp(`.*${value}.*`, 'i').test(item[brand]));
    if (make !== 'null' && tempResults.length > 0) {
      tempResults = filterResults(tempResults, make);
    }
    if (model !== 'null' && tempResults.length > 0) {
      tempResults = filterResults(tempResults, model, false);
    }
    tempResults.forEach((item) => results.add(item));
  });
  return [...results];
}

function getFieldValue(selector, items) {
  return items.filter((item) => item.classList.contains(selector))[0]?.value;
}

function formListener(form) {
  form.onsubmit = async (e) => {
    ({ crData, pnData } = window.allProducts);
    const ssData = ['query', 'results', 'amount'];
    ssData.forEach((item) => sessionStorage.removeItem(item));

    const items = [...form];
    const value = getFieldValue(`search__input-${isCrossRefActive ? 'cr' : 'pn'}__input`, items);
    const makeFilterValue = getFieldValue('search__make-filter__select', items);
    const modelFilterValue = getFieldValue('search__model-filter__select', items);
    e.preventDefault();
    if (!crData || !pnData) return;
    const results = isCrossRefActive
      ? searchCRPartNumValue(value)
      : searchPartNumValue(value, makeFilterValue, modelFilterValue);

    let url = window.location.pathname;
    const searchType = isCrossRefActive ? 'cross' : `parts&make=${makeFilterValue}&model=${modelFilterValue}`;
    const isHomepage = url === '/' ? 'search/' : '';
    const query = {
      searchType,
      value,
    };
    if (!isCrossRefActive) {
      query.make = makeFilterValue;
      query.model = modelFilterValue;
    }
    const ssDataItems = [query, results, amountOfProducts];
    ssData.forEach((item, i) => sessionStorage.setItem(item, JSON.stringify(ssDataItems[i])));

    url = `${url}${isHomepage}?q=${value}&st=${searchType}`;
    window.location.href = url;
  };
}

export default function decorate(block) {
  const formWrapper = createElement('div', { classes: 'search-wrapper' });
  const form = createElement('form', { classes: 'search-form' });
  const pnContainer = createElement('div', { classes: ['search__filters-input__container', 'hide'] });
  form.innerHTML = TEMPLATES.searchBy + TEMPLATES.inputCR;
  // Part number input and its filters are hidden by default
  pnContainer.innerHTML = TEMPLATES.filters + TEMPLATES.inputPN;
  form.appendChild(pnContainer);
  // add listeners and fill filters with data
  addSearchByListeners(form.querySelector('.search__buttons__wrapper'), form);
  getAndApplyFiltersData(form);
  formListener(form);
  // insert templates to form
  formWrapper.appendChild(form);
  block.appendChild(formWrapper);
}
