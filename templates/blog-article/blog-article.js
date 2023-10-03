import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

const title = getMetadata('og:title');
const date = getMetadata('publication-date');

async function buildSection(container, sectionName = '') {
  const selectedContent = container.querySelector(`.${sectionName}-container .${sectionName}-wrapper`);
  const sectionClassList = sectionName === 'breadcrumbs' ? ['section', 'template', 'article-template', `${sectionName}-container`] : `${sectionName}-container`;
  const sectionContainer = createElement('div', { classes: sectionClassList });

  sectionContainer.append(selectedContent);

  return sectionContainer;
}

export default async function decorate(doc) {
  const container = doc.querySelector('main');
  const article = createElement('div', { classes: ['article-content'] });

  const articleTexts = createElement('div', { classes: ['section', 'template', 'article-template', 'article-texts-container'] });
  const currentArticle = createElement('div', { classes: ['current-article-container'] });

  const [
    breadSection,
    recommendationsSection,
  ] = await Promise.all([
    buildSection(container, 'breadcrumb'),
    buildSection(container, 'recommendations'),
  ]);

  const defaultContent = container.querySelector('.default-content-wrapper');

  const articleTitle = createElement('h1', { classes: ['article-title'] });
  articleTitle.textContent = title;

  const articleDate = createElement('p', { classes: ['article-date'] });
  articleDate.textContent = date;

  defaultContent.insertAdjacentElement('afterbegin', articleDate);
  defaultContent.insertAdjacentElement('afterbegin', articleTitle);

  currentArticle.append(defaultContent);
  articleTexts.append(currentArticle, recommendationsSection);
  article.append(breadSection, articleTexts);

  container.innerText = '';
  container.append(article);
}
