import { getTextLabel, createElement } from '../../scripts/scripts.js';

const titleContent = getTextLabel('search results title');

const query = JSON.parse(sessionStorage.getItem('query'));
const { searchType, value } = query;
const type = (searchType === 'cross' && 'cross-reference') || 'parts';

export default async function decorate(doc) {
  const container = doc.querySelector('main');

  const filters = container.querySelector('.filters-wrapper');
  const resultsList = container.querySelector('.results-list-wrapper');
  const pagination = container.querySelector('.pagination-wrapper');

  const searchResultsSection = createElement('div', { classes: 'search-results-section' });

  const titleSection = createElement('div', { classes: 'title-section' });
  const title = createElement('h1', { classes: 'title' });
  const titleText = ((searchType === 'cross') && `${titleContent} ${type}: "${value}"`) || `${titleContent} ${query.make} ${query.model} ${value} ${type}`;
  title.textContent = titleText;
  titleSection.appendChild(title);

  searchResultsSection.append(titleSection, filters, pagination, resultsList);

  container.textContent = '';
  container.append(searchResultsSection);
}
