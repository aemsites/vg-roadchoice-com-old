import { createElement, getTextLabel } from '../../scripts/scripts.js';

let isCrossRefActive = true;
const modelsItems = [];

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
  // insert templates to form
  formWrapper.appendChild(form);
  block.appendChild(formWrapper);
}
