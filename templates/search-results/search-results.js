import { getTextLabel, createElement } from '../../scripts/scripts.js';

const titleContent = getTextLabel('search results title');

const query = JSON.parse(sessionStorage.getItem('query'));
const { searchType, value } = query;
const type = (searchType === 'cross' && 'cross-reference') || 'parts';

export default async function decorate(doc) {
  const main = doc.querySelector('main');
  const section = createElement('div', {
    classes: ['section', 'search-results'],
    props: {
      'data-section-status': 'initialized',
      style: 'display: none;',
    },
  });
  const searchBar = main.querySelector('.search-container.section');
  const filters = main.querySelector('.filters-wrapper');
  const resultsList = main.querySelector('.results-list-wrapper');
  const pagination = main.querySelector('.pagination-wrapper');
  const searchResultsWrapper = createElement('div', { classes: 'search-results-wrapper' });
  const searchResultsSection = createElement('div', { classes: 'search-results-section' });
  const titleSection = createElement('div', { classes: 'title-section' });
  const title = createElement('h1', { classes: 'title' });
  const titleText = ((searchType === 'cross') && `${titleContent} ${type}: "${value}"`)
    || `${titleContent} ${query.make} ${query.model} ${value} ${type}`;

  title.textContent = titleText;
  titleSection.appendChild(title);

  searchResultsSection.append(titleSection, filters, pagination, resultsList);
  searchResultsWrapper.appendChild(searchResultsSection);
  section.appendChild(searchResultsWrapper);

  main.textContent = '';
  if (searchBar) main.prepend(searchBar);
  main.append(section);
}
