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

  const results = createElement('div', { classes: 'allCatalogs' });
  // eslint-disable-next-line no-undef

  const catalogHeading = createElement('h2', { classes: ['subHeading'], props: { id: 'CATALOGS' } });
  catalogHeading.textContent = catalogTitle;

  const contentCatalog = createElement('div', { classes: 'tableContent' });
  const groupByTypeCatalog = createElement('ul', { classes: 'groupCatalog' });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].type === 'catalog' && catalogs[idx].language === 'en') {
      const catalog = createElement('li', { classes: ['cataloglist', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;
      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupByTypeCatalog.appendChild(catalog);
      contentCatalog.appendChild(groupByTypeCatalog);
    }
  });
  results.append(catalogHeading, contentCatalog);

  // product-dat-sheet Table
  const productHeading = createElement('h2', { classes: ['subHeading'], props: { id: 'PRODUCT' } });
  productHeading.textContent = product;
  const contentProduct = createElement('div', { classes: 'tableContent' });
  const groupByTypeproductSheet = createElement('ul', { classes: 'groupproductSheet', props: { id: 'PRODUCTSHEETSANDMORE' } });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].type === 'product-data-sheet' && catalogs[idx].language === 'en') {
      const catalog = createElement('li', { classes: ['cataloglist', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;
      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupByTypeproductSheet.appendChild(catalog);
      contentProduct.appendChild(groupByTypeproductSheet);
    }
  });
  results.append(productHeading, contentProduct);

  // Spanish Table
  const spanishHeading = createElement('h2', { classes: ['subHeading'], props: { id: 'SPANISHRESOURCES' } });
  spanishHeading.textContent = spanish;
  const contentSpanish = createElement('div', { classes: 'tableContent' });
  const groupBylangSpanish = createElement('ul', { classes: 'groupSpanish' });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].language === 'es') {
      const catalog = createElement('li', { classes: ['cataloglist', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupBylangSpanish.appendChild(catalog);
      contentSpanish.appendChild(groupBylangSpanish);
    }
  });
  results.append(spanishHeading, contentSpanish);

  // FrenchTable
  const frenchHeading = createElement('h2', { classes: ['subHeading'], props: { id: 'frenchResources' } });
  frenchHeading.textContent = french;

  const contentFrench = createElement('div', { classes: 'tableContent' });
  const groupBylangFrench = createElement('ul', { classes: 'groupFrench' });
  catalogs.forEach((ctype, idx) => {
    if (catalogs[idx].language === 'fr') {
      const catalog = createElement('li', { classes: ['cataloglist', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      const catagoryNote = createElement('sub', { classes: 'notes' });
      if (catalogs[idx].notes) {
        catagoryNote.textContent = `(${ctype.notes})`;
      }

      catalog.append(categoryLink);
      catalog.appendChild(catagoryNote);
      groupBylangFrench.appendChild(catalog);
      contentFrench.appendChild(groupBylangFrench);
    }
  });
  results.append(frenchHeading, contentFrench);

  return results;
};

// Trim the resource links
const resourceListAnchors = document.querySelectorAll('.resource-list li a');
resourceListAnchors.forEach((anchor, i) => {
  anchor.removeAttribute('target');
  anchor.removeAttribute('href');
  anchor.setAttribute('id', `resources-${i}`);

  const resourceEnglish = document.getElementById('resources-0');
  resourceEnglish.setAttribute('href', '#CATALOGS');
});
const resourceSpanish = document.getElementById('resources-1');
resourceSpanish.setAttribute('href', '#SPANISHRESOURCES');

const resourceFrench = document.getElementById('resources-2');
resourceFrench.setAttribute('href', '#frenchResources');

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const [url] = Object.values(blockConfig);
  allCatalog = await getAllCatolog(url);
  const results = buildResults(allCatalog, 0);
  block.textContent = '';
  block.append(results);
}
