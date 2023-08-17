import { createElement, getTextLabel } from '../../scripts/scripts.js';

let isCrossRefActive = true;
const modelsItems = [];
let crData;
let pnData;

const PLACEHOLDERS = {
  crossReference: getTextLabel('Cross-Reference No'),
  partNumber: getTextLabel('Part No'),
};

const TEMPLATES = {
  searchBy: `
  <div class="search__search-by__container">
    <label class="search__search-by__label" name="SearchBy">Search By</label>
    <div class="search__buttons__wrapper">
      <button class="button search__cross-reference__btn shadow active " type="button" name="crossReference">
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
        <option value="null">model (All)</option>
      </select>
    </div>
  </div>
  `,
  filtersResetOpt: `
    <option value="null">model (All)</option>
  `,
  inputCR: `
  <div class="search__input-cr__container">
    <label class="search__input-cr__label">Cross-Reference Number</label>
    <div class="search__input-cr__wrapper">
      <input class="search__input-cr__input shadow" type="search" placeholder="${PLACEHOLDERS.crossReference}" />
      <button class="button search__input-cr__submit shadow" type="submit">
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
      <button class="button search__input-pn__submit shadow" type="submit">
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

async function getFiltersData() {
  const filtersUrl = '/search/search-filters.json';
  const response = await fetch(filtersUrl);
  const json = await response.json();
  return json;
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
  const filters = await getFiltersData();
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
    // if is not null the enable the select and then is filled by the maker value
    const models = modelsItems.filter(
      (item) => item.Make.toLowerCase() === e.target.value,
    )[0].Models;
    resetModelsFilter(modelsSelect, false);
    populateFilter(modelsSelect, models);
  };
}

function searchCRPartNumValue(value) {
  const partNumberBrands = ['OEM_num', 'Road Choice Part Number', 'Volvo Part Number', 'Mack Part Number'];
  let results;
  partNumberBrands.forEach((brand, i) => {
    if (results && results.length > 0) return;
    const data = i < 2 ? crData : pnData;
    const tempResults = data.filter(
      (item) => item[brand].toUpperCase() === value.toUpperCase(),
    );
    results = tempResults.length > 0 ? tempResults : null;
  });
  return results;
}

function searchPartNumValue(value, make, model) {
  const isMakeNull = make === 'null';
  const isModelNull = model === 'null';
  const partNumberBrands = ['Base Part Number', 'Volvo Part Number', 'Mack Part Number'];
  let results = [];
  partNumberBrands.forEach((brand) => {
    let tempResults = pnData.filter((item) => new RegExp(value, 'i').test(item[brand]));
    if (!isMakeNull && tempResults.length > 0) {
      tempResults = tempResults.filter((item) => item.Make.toLowerCase() === make.toLowerCase());
    }
    if (!isModelNull && tempResults.length > 0) {
      tempResults = tempResults.filter((item) => item.Model.toLowerCase() === model.toLowerCase());
    }
    if (results.length > 0) {
      const isEqualLength = results.length === tempResults.length;
      results = isEqualLength && results.filter((item, i) => item !== tempResults[i]);
    }
    results = tempResults.length > 0 ? results.concat(tempResults) : [...results];
  });
  return results;
}

function getFieldValue(selector, items) {
  return items.filter((item) => item.classList.contains(selector))[0]?.value;
}

function formListener(form) {
  form.onsubmit = async (e) => {
    const items = [...form];
    const value = getFieldValue(`search__input-${isCrossRefActive ? 'cr' : 'pn'}__input`, items);
    const makeFilterValue = getFieldValue('search__make-filter__select', items);
    const modelFilterValue = getFieldValue('search__model-filter__select', items);
    e.preventDefault();
    if (!crData || !pnData) return;
    const results = isCrossRefActive
      ? searchCRPartNumValue(value)
      : searchPartNumValue(value, makeFilterValue, modelFilterValue);

    sessionStorage.setItem('results', JSON.stringify(results));
    sessionStorage.setItem('value', value);
    console.log(results)

    let url = getTextLabel('home url');
    url = `${url}search/?q=${value}`;
    console.log(url)
    // window.location.href = homeUrl;
  };
}

export default function decorate(block) {
  const worker = new Worker('/blocks/search/worker.js');
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
  // run the worker in parallel
  worker.postMessage('run');
  worker.onmessage = (e) => {
    crData = e.data.crData;
    pnData = e.data.pnData;
  };
}
