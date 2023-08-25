import {
  createElement,
  getAllCatolog,
  getTextLabel,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const btnPagesText = getTextLabel('catalog-title');
let allCatalog;
let buildResults;

// eslint-disable-next-line prefer-const
buildResults = (catalogs) => {
  const tableText = btnPagesText;
  const tableLabels = tableText.split('[/]');
  const [catalogTitle, spanish, french, product] = tableLabels;

  const results = createElement('div', { classes: 'cata-results-articles' });
  // eslint-disable-next-line no-undef

  const catalogHeading = createElement('h2', { classes: ['catalogHeading'], props: { id: 'CATALOGS' } });
  catalogHeading.textContent = catalogTitle;

  const groupByTypeCatalog = createElement('ul', { classes: 'groupByTypeCatalog' });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].type === 'catalog' && catalogs[idx].language === 'en') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;
      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupByTypeCatalog.appendChild(catalog);
    }
  });
  results.append(catalogHeading, groupByTypeCatalog);

  // product-dat-sheet Table
  const productHeading = createElement('h2', { classes: ['productHeading'] });
  productHeading.textContent = product;
  const groupByTypeproductSheet = createElement('ul', { classes: 'groupByTypeproductSheet', props: { id: 'PRODUCTSHEETSANDMORE' } });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].type === 'product-data-sheet' && catalogs[idx].language === 'en') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;
      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupByTypeproductSheet.appendChild(catalog);
    }
  });
  results.append(productHeading, groupByTypeproductSheet);

  // Spanish Table
  const spanishHeading = createElement('h2', { classes: ['spanishHeading'], props: { id: 'SPANISHRESOURCES' } });
  spanishHeading.textContent = spanish;
  const groupBylangSpanish = createElement('ul', { classes: 'groupBylangSpanish', props: { id: 'SPANISHRESOURCES' } });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].language === 'es') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupBylangSpanish.appendChild(catalog);
    }
  });
  results.append(spanishHeading, groupBylangSpanish);

  // FrenchTable
  const frenchHeading = createElement('h2', { classes: ['frenchHeading'], props: { id: 'frenchResources' } });
  frenchHeading.textContent = french;
  const groupBylangFrench = createElement('ul', { classes: 'groupBylangFrench' });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].language === 'fr') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupBylangFrench.appendChild(catalog);
    }
  });
  results.append(frenchHeading, groupBylangFrench);

  return results;
};

// Trim the resource links
const resourceListAnchors = document.querySelectorAll('.resource-list li a');
resourceListAnchors.forEach((anchor, i) => {
  anchor.removeAttribute('target');
  anchor.removeAttribute('href');
  anchor.setAttribute('id', `link${i}`);

  const link1 = document.getElementById('link0');
  link1.setAttribute('href', '#CATALOGS');
});
const link2 = document.getElementById('link1');
link2.setAttribute('href', '#CATALOGS');

const link3 = document.getElementById('link2');
link3.setAttribute('href', '#frenchResources');

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const [url] = Object.values(blockConfig);
  allCatalog = await getAllCatolog(url);
  const results = buildResults(allCatalog, 0);
  block.textContent = '';
  block.append(results);
}
