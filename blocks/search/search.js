import { createElement } from '../../scripts/scripts.js';

let isCrossRefActive = true;

const PLACEHOLDERS = {
  crossReference: 'Cross-Reference No',
  partNumber: 'Part No',
};

const TEMPLATES = {
  searchBy: `
  <div class="search__search-by__container">
    <label class="search__search-by__label" name="SearchBy">Search By</label>
    <div class="search__buttons__wrapper shadow">
      <button class="button search__cross-reference__btn active" type="button" name="crossReference">
        Cross-Reference
      </button>
      <button class="button search__part-number__btn" type="button" name="partNumber">
        Part Number
      </button>
    </div>
  </div>
  `,
  filters: `
  <div class="search__filters__container hide">
    <div class="search__make-filter__wrapper">
      <label class="search__make-filter__label">Make</label>
      <select class="search__make-filter__select shadow">
        <option value="">Make (All)</option>
      </select>
    </div>
    <div class="search__model-filter__wrapper">
      <label class="search__model-filter__label">Model</label>
      <select class="search__model-filter__select shadow">
        <option value="">model (All)</option>
      </select>
    </div>
  </div>
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
  <div class="search__input-pn__container hide">
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

function addSearchByListeners(wrapper, form) {
  wrapper.onclick = (e) => {
    if (e.target.classList.contains('active')) return;
    // swap between search-by buttons
    form.querySelector('.search__cross-reference__btn').classList.toggle('active', !isCrossRefActive);
    form.querySelector('.search__part-number__btn').classList.toggle('active', isCrossRefActive);
    isCrossRefActive = !isCrossRefActive;
    // swap inputs and filters
    form.querySelector('.search__filters__container').classList.toggle('hide', isCrossRefActive);
    form.querySelector('.search__input-pn__container').classList.toggle('hide', isCrossRefActive);
    form.querySelector('.search__input-cr__container').classList.toggle('hide', !isCrossRefActive);
    // remove the value from the not active input
    form.querySelector(`.search__input-${isCrossRefActive ? 'pn' : 'cr'}__input`).value = '';
  };
}

export default function decorate(block) {
  const formWrapper = createElement('div', { classes: 'search-wrapper' });
  const form = createElement('form', { classes: 'search-form' });
  form.innerHTML = TEMPLATES.searchBy;
  form.innerHTML += TEMPLATES.inputCR;
  // Part number input and its filters are hidden by default
  form.innerHTML += TEMPLATES.filters;
  form.innerHTML += TEMPLATES.inputPN;

  // add searchBy listeners
  addSearchByListeners(form.querySelector('.search__buttons__wrapper'), form);

  // insert templates to form
  formWrapper.appendChild(form);
  block.appendChild(formWrapper);
}
