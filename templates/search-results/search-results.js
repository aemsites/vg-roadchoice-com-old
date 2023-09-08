import { getTextLabel, createElement } from '../../scripts/scripts.js';

const titleContent = getTextLabel('search results title');
const noResultsContent = getTextLabel('no results title');
const subTitleText = getTextLabel('no results subtitle');
const needHelp = getTextLabel('no results need help');
const contactUsText = getTextLabel('no results contact us');

const query = JSON.parse(sessionStorage.getItem('query'));
const results = JSON.parse(sessionStorage.getItem('results'));
const { searchType, value } = query;
const type = (searchType === 'cross' && 'cross-reference') || 'parts';

const isTextNull = (text) => (text === 'null' ? '' : text);

const noResultsTemplate = `
  <div class="no-results-section">
    <h5 class="no-results-subtitle">${subTitleText}</h5>
    <div class="no-results-options">
      <h5 class="no-results-help">${needHelp}</h5>
      <p class="no-results-contact">${contactUsText}
      <a class="no-results-contact-link" href="mailto:info@roadchoice.com">
        info@roadchoice.com</a>
      </p>
    </div>
  </div>
`;

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
  const breadcrumb = main.querySelector('.breadcrumb-container.section');
  const filters = main.querySelector('.filters-wrapper');
  const resultsList = main.querySelector('.results-list-wrapper');
  const pagination = main.querySelector('.pagination-wrapper');
  const searchResultsWrapper = createElement('div', { classes: 'search-results-wrapper' });
  const searchResultsSection = createElement('div', { classes: 'search-results-section' });
  const titleSection = createElement('div', { classes: 'title-section' });
  const title = createElement('h1', { classes: 'title' });
  const titleText = ((searchType === 'cross') && `${titleContent} ${type}: "${value}"`)
    || `${titleContent} ${isTextNull(query.make)} ${isTextNull(query.model)} ${value} ${type}`;
  const noResults = results === null || results.length === 0;
  const noResultsText = noResultsContent.replace('[$]', value);

  title.textContent = !noResults ? titleText : noResultsText;
  titleSection.appendChild(title);

  searchResultsSection.append(titleSection, filters, pagination, resultsList);
  searchResultsWrapper.appendChild(searchResultsSection);
  section.appendChild(searchResultsWrapper);

  main.textContent = '';
  if (breadcrumb) main.prepend(breadcrumb);
  if (searchBar) main.prepend(searchBar);
  if (noResults) {
    const fragment = document.createRange().createContextualFragment(noResultsTemplate);
    searchResultsSection.classList.add('no-results');
    searchResultsSection.insertBefore(fragment, filters);
  }
  main.append(section);
}
