import { getTextLabel, createElement } from '../../scripts/scripts.js';

let products;
const titleContent = getTextLabel('Categories');
const isSearchResult = document.querySelector('.search-results') !== null;
const urlCategory = new URLSearchParams(window.location.search).get('cat');

if (isSearchResult) products = JSON.parse(sessionStorage.getItem('results'));

const reduceArrays = (array) => {
  const initialValue = {};
  const reduced = array.reduce(
    (acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }),
    initialValue,
  );
  return reduced;
};

const reduceCategories = (cats) => {
  const categoryList = cats.map((x) => x['Part Category']);
  const catToReduce = urlCategory
    ? categoryList.filter((item) => item.toLowerCase() === urlCategory) : categoryList;
  const reducedCategories = reduceArrays(catToReduce);
  const orderedCategories = Object.keys(reducedCategories).sort().reduce(
    (obj, key) => {
      obj[key] = reducedCategories[key];
      return obj;
    },
    {},
  );
  const reducedArray = Object.entries(orderedCategories);

  return reducedArray;
};

const buildFilter = (cats) => {
  const section = createElement('div', { classes: 'filter-section' });
  const title = createElement('h3', { classes: 'title', textContent: titleContent });
  const list = createElement('ul', { classes: 'list' });
  const currentUrl = new URL(window.location.href);
  const urlParams = new URLSearchParams(currentUrl.search);

  cats.forEach((cat) => {
    const [category, amount] = cat;
    urlParams.set('cat', category.toLowerCase());
    const filterUrl = `${currentUrl.pathname}?${urlParams.toString()}`;
    const item = createElement('li', { classes: 'item' });
    const link = createElement('a', {
      classes: 'categories-link',
      props: { href: filterUrl },
      textContent: `${category.toLowerCase()} (${amount})`,
    });
    item.appendChild(link);
    list.appendChild(item);
  });
  section.append(title, list);

  return section;
};

export default async function decorate(block) {
  const filtersSection = createElement('div', { classes: 'filters-wrapper' });

  const categories = reduceCategories(products);

  const categoryFilterSection = buildFilter(categories);

  filtersSection.append(categoryFilterSection);

  block.textContent = '';
  block.append(filtersSection);
}
