/* eslint-disable no-unused-vars */
import {
  createElement,
  getAllCatolog,
  getTextLabel,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const catalogPerPage = 20;
const btnPagesText = getTextLabel('catalog-title');
const firstBuild = true;
let allCatalog;
let buildResults;
let buildResulttype;

const divideArray = (mainArray, perChunk) => {
  const dividedArrays = mainArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, []);
  return dividedArrays;
};

// eslint-disable-next-line prefer-const
buildResults = (catalogs, page) => {
  const groupedCatolog = (page === 0 && firstBuild)
    ? divideArray(catalogs, catalogPerPage)
    : catalogs;
  //   const activePage = groupedArticles[page];

  const tableText = btnPagesText;
  const tableLabels = tableText.split('[/]');
  const [catalogTitle, spanish, french, product] = tableLabels;

  const groupByType = groupedCatolog[page];
  const groupByTable = groupedCatolog[page];
  const results = createElement('div', { classes: 'cata-results-articles' });
  // eslint-disable-next-line no-undef

  const catalogHeading = createElement('h2', { classes: ['catalogHeading'], props: { id: 'CATALOGS' } });
  catalogHeading.textContent = catalogTitle;

  const groupByTypeCatalog1 = createElement('ul', { classes: 'groupByTypeCatalog' });
  groupByType.forEach((ctype, idx) => {
    if (groupByType[idx].type === 'catalog') {
      const catalog1 = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink1 = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink1.textContent = ctype.category;

      //   const category = createElement('td', { classes: 'category' });
      //   category.appendChild(categoryLink);

      catalog1.append(categoryLink1);
      groupByTypeCatalog1.appendChild(catalog1);
    }
  });
  results.append(catalogHeading, groupByTypeCatalog1);

  // Spanish Table
  const spanishHeading = createElement('h2', { classes: ['spanishHeading'] });
  spanishHeading.textContent = spanish;
  const groupBylangSpanish = createElement('ul', { classes: 'groupBylangSpanish', props: { id: 'SPANISHRESOURCES' } });
  groupByType.forEach((ctype, idx) => {
    if (groupByType[idx].language === 'es') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      //   const category = createElement('td', { classes: 'category' });
      //   categoryLink.appendChild(categoryLink);

      catalog.append(categoryLink);
      groupBylangSpanish.appendChild(catalog);
    }
  });
  results.append(spanishHeading, groupBylangSpanish);

  // FenchTable
  const frenchHeading = createElement('h2', { classes: ['frenchHeading'] });
  frenchHeading.textContent = french;
  const groupBylangFrench = createElement('ul', { classes: 'groupBylangFrench', props: { id: 'FRENCHRESOURCES' } });
  groupByType.forEach((ctype, idx) => {
    if (groupByType[idx].language === 'fr') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      //   const category = createElement('td', { classes: 'category' });
      //   category.appendChild(categoryLink);

      catalog.append(categoryLink);
      groupBylangFrench.appendChild(catalog);
    }
  });
  results.append(frenchHeading, groupBylangFrench);

  // product-dat-sheet Table
  const productHeading = createElement('h2', { classes: ['productHeading'] });
  productHeading.textContent = product;
  const groupByTypeproductSheet = createElement('ul', { classes: 'groupByTypeproductSheet', props: { id: 'PRODUCTSHEETSANDMORE' } });
  groupByType.forEach((ctype, idx) => {
    if (groupByType[idx].type === 'product-data-sheet') {
      const catalog = createElement('li', { classes: ['catalog', `category-${idx}`] });

      const categoryLink = createElement('a', { classes: 'categoryLink', props: { href: ctype.file, target: '_blank' } });
      categoryLink.textContent = ctype.category;

      //   const category = createElement('td', { classes: 'category' });
      //   category.appendChild(categoryLink);

      catalog.append(categoryLink);
      groupByTypeproductSheet.appendChild(catalog);
    }
  });
  results.append(productHeading, groupByTypeproductSheet);

  return results;
};
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const [url] = Object.values(blockConfig);
  allCatalog = await getAllCatolog(url);
  const results = buildResults(allCatalog, 0);
  block.textContent = '';
  block.append(results);
}
