import { createElement } from '../../scripts/scripts.js';

let products;
// todo make this come from te placeholder
const titleContent = 'Categories';
const isSearchResult = document.querySelector('.search-results') !== null;

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
  const reducedCategories = reduceArrays(categoryList);
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

  cats.forEach((cat) => {
    const [category, amount] = cat;
    const item = createElement('li', { classes: 'item' });
    const link = createElement('a', { classes: 'link', props: { href: 'link' } });
    link.textContent = `${category} (${amount})`;
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
