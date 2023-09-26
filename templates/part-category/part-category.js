import { createElement, getJsonFromUrl } from '../../scripts/scripts.js';

const categoryTestFile = 'batteries';
const catPlaceholder = categoryTestFile;
// FIXME const catPlaceholder = 'Category';
const categoryMaster = '/product-data/rc-attribute-master-file.json';
const amount = 12;
const url = new URL(window.location.href);
let category;

/**
 * return the category from the url
 * @returns {string} category or a placeholder text
 */
const getCategory = async () => {
  const path = url.pathname.split('/').filter((el) => el !== '');
  const urlCategory = path.at(-1);
  return urlCategory === 'part-category' ? catPlaceholder : urlCategory;
};

const getCategoryData = async (cat) => {
  url.pathname = `/product-data/rc-${
    category === catPlaceholder ? categoryTestFile : cat
  }.json`;
  const json = await getJsonFromUrl(url);
  const event = new Event('CategoryDataLoaded');
  sessionStorage.setItem('category-data', (json ? JSON.stringify(json.data) : null));
  sessionStorage.setItem('amount', amount);
  document.dispatchEvent(event);
};

const getFilterAttrib = async (cat) => {
  const json = await getJsonFromUrl(categoryMaster);
  const filterAttribs = json.data.filter((el) => (
    el.Subcategory.toLowerCase() === cat.toLowerCase()
    && el.Filter === ''
  )).map((el) => el.Attributes);
  const event = new Event('FilterAttribsLoaded');
  sessionStorage.setItem('filter-attribs', JSON.stringify(filterAttribs));
  document.dispatchEvent(event);
};

const resetCategoryData = () => {
  sessionStorage.removeItem('category-data');
  sessionStorage.removeItem('filter-attribs');
  sessionStorage.removeItem('amount');
};

export default async function decorate(doc) {
  category = await getCategory();
  const main = doc.querySelector('main');
  const breadcrumbBlock = main.querySelector('.breadcrumb-container .breadcrumb');
  const titleWrapper = createElement('div', { classes: 'title-wrapper' });
  const title = createElement('h1', { classes: 'part-category-title', textContent: category });
  const section = [...main.children]
    .filter((child) => !['breadcrumb-container', 'search-container']
      .some((el) => child.classList.contains(el)))[0];
  section.classList.add('part-category');
  titleWrapper.appendChild(title);
  section.prepend(titleWrapper);
  resetCategoryData();
  getCategoryData(category);
  getFilterAttrib(category);

  // update breadcrumb adding the category dynamically
  const observer = new MutationObserver((mutations) => {
    const { target } = mutations[0];
    if (target.dataset.blockStatus === 'loaded') {
      const breadcrumbList = target.querySelector('.breadcrumb-list');
      const lastElLink = breadcrumbList.lastElementChild.firstElementChild;
      const { length } = breadcrumbList.children;
      const { href, className } = lastElLink;
      const link = createElement('a', {
        classes: className,
        props: { href: href + category },
        textContent: category,
      });
      const breadcrumbItem = createElement('li', {
        classes: ['breadcrumb-item', `breadcrumb-item-${length}`],
      });
      breadcrumbItem.appendChild(link);
      breadcrumbList.appendChild(breadcrumbItem);
      observer.disconnect();
    }
  });
  observer.observe(breadcrumbBlock, { attributes: true, attributeFilter: ['data-block-status'] });
}
