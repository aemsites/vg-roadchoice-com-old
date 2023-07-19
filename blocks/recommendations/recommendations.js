import { createElement, getTextLabel, convertDateExcel } from '../../scripts/scripts.js';

const title = getTextLabel('recommendations title');
const linkText = getTextLabel('read more');
const [homeTitle, recommendationsTitle] = title.split('[/]');

const isBlogArticle = document.querySelector('.blog-article');

export const getAllArticles = async () => {
  // TODO change this route
  const response = await fetch('/drafts/shomps/blog-articles.json');
  const json = await response.json();
  return json.data;
};

export const getLimit = (block) => {
  const classes = block.classList;
  let limit;
  classes.forEach((e) => {
    const [name, value] = e.split('-');
    if (name === 'limit') limit = value;
  });
  return limit;
};

export const clearRepeatedArticles = (articles) => articles.filter((e) => {
  const currentArticlePath = window.location.href.split('/').pop();
  const path = e.path.split('/').pop();
  if (path !== currentArticlePath) return e;
  return null;
});

const formatDate = (date) => {
  const convertedDate = new Date(convertDateExcel(date));

  const day = convertedDate.getDate();
  const month = convertedDate.getMonth() + 1;
  const year = convertedDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export default async function decorate(block) {
  const limit = Number(getLimit(block));
  const allArticles = await getAllArticles();

  const sortedArticles = allArticles.sort((a, b) => {
    a.date = +(a.date);
    b.date = +(b.date);
    return b.date - a.date;
  });
  const filteredArticles = clearRepeatedArticles(sortedArticles);
  const selectedArticles = filteredArticles.slice(0, limit);

  const recommmendationsContent = createElement('div', { classes: ['recommendations-content'] });
  const titleSection = createElement('div', { classes: ['title-section'] });

  const titleElement = createElement('h3', { classes: ['title'] });
  titleElement.innerText = isBlogArticle ? recommendationsTitle : homeTitle;

  if (!isBlogArticle) {
    const link = createElement('a', { classes: ['link'] });
    link.append(titleElement);
    titleSection.appendChild(link);
  } else {
    titleSection.appendChild(titleElement);
  }

  const recommendationsList = createElement('ul', { classes: ['recommendations-list'] });

  selectedArticles.forEach((art) => {
    const article = createElement('li', { classes: ['article'] });

    const articleTitle = createElement('h2', { classes: ['article-title'] });
    const articleTitleLink = createElement('a', { classes: ['article-title-link'] });
    articleTitleLink.innerText = art.title;
    articleTitleLink.href = art.path;

    articleTitle.appendChild(articleTitleLink);

    const articleDate = createElement('p', { classes: ['article-date'] });
    articleDate.innerText = formatDate(art.date);

    const articleText = createElement('p', { classes: ['article-text'] });
    articleText.innerText = art.extract;

    const strongLink = createElement('strong');
    const articleLink = createElement('a', { classes: ['article-link'] });
    articleLink.innerText = linkText;
    articleLink.href = art.path;
    strongLink.appendChild(articleLink);

    article.append(articleTitle, (isBlogArticle ? articleDate : ''), articleText, strongLink);

    recommendationsList.appendChild(article);
  });
  recommmendationsContent.append(titleSection, recommendationsList);

  block.textContent = '';
  block.appendChild(recommmendationsContent);
}
