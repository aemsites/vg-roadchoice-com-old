import {
  createElement,
  getJsonFromUrl,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const blockName = 'catalogs';

const buildPairs = (titles, filters) => {
  const pairs = [];
  for (let i = 1; i < titles.length; i += 1) {
    const pair = {
      title: titles[i],
      filters: filters[i],
      position: i,
    };
    pairs.push(pair);
  }
  return pairs;
};

const buildCriteriaSets = (filter) => {
  const criteria = filter.split('&');
  const sets = [];

  criteria.forEach((el) => {
    const [cat, value] = el.split('=');
    const set = {
      cat: cat.trim().toLowerCase(),
      value: value.trim().toLowerCase(),
    };
    sets.push(set);
  });
  return sets;
};

const buildTables = (pairs, catalogs) => {
  const catalogsSection = createElement('div', { classes: `${blockName}-section` });
  pairs.forEach((pair) => {
    const catalogsSubsection = createElement('div', {
      classes: [
        `${blockName}-subsection`,
        `${blockName}-subsection-${pair.position}`,
      ],
    });

    const { title, filters } = pair;
    const heading = createElement('h2', {
      classes: `${blockName}-heading`,
      props: { id: title },
      textContent: (title.replaceAll('-', ' ')),
    });
    const tableSection = createElement('ul', { classes: `${blockName}-table` });

    const criteria = buildCriteriaSets(filters);
    const selectedCatalogs = catalogs.filter((catalog) => {
      const conditions = [];
      criteria.forEach((cr) => {
        const { cat, value } = cr;

        const condition = catalog[cat] === value;
        conditions.push(condition);
      });
      const checker = conditions.every((e) => e === true);
      return checker && catalog;
    });

    selectedCatalogs.forEach((cat) => {
      const catalog = createElement('li', { classes: 'table-item' });
      const link = createElement('a', {
        classes: 'item-link',
        props: { href: cat.file },
        textContent: cat.category,
      });
      const note = createElement('p', { classes: 'item-note', textContent: cat.notes });

      catalog.append(link);
      if (cat.notes.length > 0) catalog.append(note);
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

  const titles = Object.keys(blockConfig);
  const filters = Object.values(blockConfig);
  const pairs = buildPairs(titles, filters);

  const json = await getJsonFromUrl(url);
  const allCatalogs = json.data;
  const tables = buildTables(pairs, allCatalogs);

  block.textContent = '';
  block.append(tables);
}
