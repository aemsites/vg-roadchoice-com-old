import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import { createElement, getTextLabel } from '../../scripts/scripts.js';

const homeText = getTextLabel('brand name');
const homeUrl = getTextLabel('home url');

const pageName = getMetadata('og:title');

export default async function decorate(block) {
  const breadcrumbContent = createElement('div', { classes: ['breadcrumb-content'] });
  const breadcrumbList = createElement('ul', { classes: ['breadcrumb-list'] });
  const currentUrl = window.location.pathname;

  const routes = currentUrl.split('/');
  if (routes[0].length === 0) routes[0] = '/';

  const amountOfLevels = routes.length - 1;
  let partialUrl = homeUrl;

  const isBlogArticle = document.querySelector('.blog-article');

  routes.forEach((path, idx) => {
    if (path.length === 0) return;
    const item = createElement('li', { classes: ['breadcrumb-item', `breadcrumb-item-${idx}`] });
    const link = createElement('a', { classes: ['breadcrumb-link'] });

    partialUrl = idx === 0 ? homeUrl : `${partialUrl}${path}/`;
    link.href = partialUrl;

    if (idx === amountOfLevels && isBlogArticle) {
      link.innerHTML = pageName;
      link.classList.add('active-link');
    } else {
      link.innerHTML = idx === 0 ? homeText : path;
    }

    item.appendChild(link);
    breadcrumbList.appendChild(item);
  });
  breadcrumbContent.appendChild(breadcrumbList);

  block.textContent = '';
  block.appendChild(breadcrumbContent);
}
