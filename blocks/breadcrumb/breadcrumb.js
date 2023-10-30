import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement, getTextLabel } from '../../scripts/scripts.js';

const homeText = getTextLabel('brand name');
const url = new URL(window.location.href);

const pageName = getMetadata('og:title');

export default async function decorate(block) {
  const breadcrumbContent = createElement('div', { classes: ['breadcrumb-content'] });
  const breadcrumbList = createElement('ul', { classes: ['breadcrumb-list'] });
  const currentUrl = url.pathname;
  const hasLastSlash = currentUrl[currentUrl.length - 1] === '/';

  const routes = currentUrl.split('/');
  if (routes[0].length === 0) routes[0] = '/';
  if (routes.at(-1).length === 0) routes.pop();

  const amountOfLevels = routes.length - 1;
  const isBlogArticle = document.querySelector('.blog-article');

  let tempUrl = '';
  routes.forEach((path, idx) => {
    const lastItem = idx === amountOfLevels;
    const item = createElement('li', { classes: ['breadcrumb-item', `breadcrumb-item-${idx}`] });
    const link = createElement('a', { classes: ['breadcrumb-link'] });
    tempUrl += idx === 0 ? path : `${path}${!lastItem || (lastItem && hasLastSlash) ? '/' : ''}`;

    link.href = idx === 0 ? url.origin : `${url.origin}${tempUrl}`;
    if (idx === amountOfLevels && isBlogArticle) {
      link.href = `${url.origin}/blog/${path}`;
      link.innerHTML = `${pageName.toLowerCase()} /`;
      link.classList.add('active-link');
    } else {
      link.innerHTML = idx === 0 ? homeText : path.replaceAll('-', ' ');
    }

    item.appendChild(link);
    breadcrumbList.appendChild(item);
  });
  breadcrumbContent.appendChild(breadcrumbList);

  block.textContent = '';
  block.appendChild(breadcrumbContent);
}
