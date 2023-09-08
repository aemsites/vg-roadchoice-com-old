import {
  createElement,
  getJsonFromUrl,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const blockName = 'catalogs';

const tableInfo = [
  {
    title: 'catalogs',
    criteria: [
      { type: 'catalog' },
      { language: 'en' },
    ],
    position: 1,
  },
  {
    title: 'product-data-sheets',
    criteria: [
      { type: 'product-data-sheet' },
    ],
    position: 2,
  },
  {
    title: 'spanish-catalogs',
    criteria: [
      { type: 'catalog' },
      { language: 'es' },
    ],
    position: 3,
  },
  {
    title: 'french-catalogs',
    criteria: [
      { type: 'catalog' },
      { language: 'fr' },
    ],
    position: 4,
  },
];

const buildTables = (catalogs) => {
  const catalogsSection = createElement('div', { classes: `${blockName}-section` });
  tableInfo.forEach((el) => {
    const { title, criteria, position } = el;

    const catalogsSubsection = createElement('div', {
      classes: [
        `${blockName}-subsection`,
        `${blockName}-subsection-${position}`,
      ],
    });
    const heading = createElement('h2', {
      classes: `${blockName}-heading`,
      props: { id: title },
      textContent: (title.replaceAll('-', ' ')),
    });
    const tableSection = createElement('ul', { classes: `${blockName}-table` });

    const selectedCatalogs = catalogs.filter((catalog) => {
      const conditions = [];
      criteria.forEach((cat) => {
        const [key] = Object.keys(cat);
        const [value] = Object.values(cat);

        const condition = catalog[key] === value;
        conditions.push(condition);
      });
      const checker = conditions.every((e) => e === true);
      return checker && catalog;
    });

    selectedCatalogs.forEach(({ notes, file, category }) => {
      const catalog = createElement('li', { classes: 'table-item' });
      const link = createElement('a', {
        classes: 'item-link',
        props: { href: file },
        textContent: category,
      });
      const note = createElement('span', { classes: 'item-note', textContent: `(${notes})` });

      catalog.append(link);
      if (notes.length > 0) link.append(note);
      tableSection.append(catalog);
    });
    catalogsSubsection.append(heading, tableSection);
    catalogsSection.append(catalogsSubsection);
  });
  return catalogsSection;
};

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const { url } = blockConfig;

  const { data: allCatalogs } = await getJsonFromUrl(url);
  const tables = buildTables(allCatalogs);

  block.textContent = '';
  block.append(tables);
}
