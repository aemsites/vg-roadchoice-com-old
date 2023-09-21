import { createElement, getTextLabel, getJsonFromUrl } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const docRange = document.createRange();

function getQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return { category: urlParams.get('category'), sku: urlParams.get('sku') };
}

function findPartBySKU(parts, sku) {
  return parts.find((part) => part['Base Part Number'].toLowerCase() === sku.toLowerCase());
}

async function getPDPData(pathSegments) {
  const { category, sku } = pathSegments;

  try {
    const { data } = await getJsonFromUrl(`/product-data/rc-${category}.json`);
    return findPartBySKU(data, sku);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching part data:', error);
  }
  return null;
}

function findPartImagesBySKU(parts, sku) {
  return parts.filter((part) => part['Part Number'].toLowerCase() === sku.toLowerCase());
}

async function fetchPartImages(sku) {
  const placeholderImage = '/product-images/rc-placeholder-image.png';
  try {
    const { data } = await getJsonFromUrl('/product-images/road-choice-website-images.json');
    const images = findPartImagesBySKU(data, sku);

    if (images.length !== 0) {
      return images;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching part image(s):', error);
  }
  return [{ 'Image URL': placeholderImage }];
}

function renderColDetails(part, block, categoryKeys) {
  const list = block.querySelector('.pdp-list');
  const keys = Object.keys(part);
  keys.forEach((key) => {
    if (!categoryKeys.includes(key) && part[key].length) {
      const liFragment = docRange.createContextualFragment(`<li class="pdp-list-item">
        <span class="pdp-list-item-title"> ${key}:</span>
        <span class="pdp-list-item-value"> ${part[key]}</span>
      </li>`);
      list.append(liFragment);
    }
  });
}

function renderImages(block, images) {
  const imageWrapper = block.querySelector('.pdp-image-wrapper');
  const selectedImage = block.querySelector('.pdp-selected-image');

  // main image
  const mainPictureUrl = images[0]['Image URL'];
  const mainPicture = createOptimizedPicture(mainPictureUrl, 'Part image', true, undefined, !mainPictureUrl.startsWith('/'));
  mainPicture.querySelector('img').classList.add('pdp-image');
  selectedImage.append(mainPicture);

  // aditional images
  if (images.length <= 1) return;

  const imageList = createElement('ul', { classes: 'pdp-image-list' });
  images.forEach((image, id) => {
    const liFragment = docRange.createContextualFragment(`<li class="pdp-image-item ${id === 0 ? 'active' : ''}"> </li>`);
    const picture = createOptimizedPicture(image['Image URL'], 'Additional part image', false, undefined, !image['Image URL'].startsWith('/'));
    picture.querySelector('img').classList.add('pdp-gallery-image');
    liFragment.querySelector('li').append(picture);
    imageList.append(liFragment);
  });
  imageWrapper.append(imageList);
  imageWrapper.addEventListener('click', (e) => {
    const target = e.target.closest('.pdp-image-item');
    if (target) {
      const activeImage = imageWrapper.querySelector('.pdp-image-item.active');
      activeImage.classList.remove('active');
      target.classList.add('active');
      const newMainImage = target.querySelector('picture').cloneNode(true);
      selectedImage.replaceChildren(newMainImage);
    }
  });
}

function renderPartBlock(block) {
  const fragment = `
    <div class="pdp-details-wrapper">
      <div class="pdp-image-column">
        <div class="pdp-image-wrapper">
          <div class="pdp-selected-image">
          </div>
        </div>
      </div>
      <div class="pdp-content-coulmn">
        <h1 class="pdp-title"></h1>
        <div class="pdp-description"></div>
        <ul class="pdp-list"></ul>
      </div>
    </div>
  `;

  const pdpFragment = docRange.createContextualFragment(fragment);
  block.append(pdpFragment);
}

function setPartData(part, block) {
  block.querySelector('.pdp-title').textContent = part['Base Part Number'];
  block.querySelector('.pdp-description').textContent = part['Part Name'];
}

function filterByCategory(data, category, categoryKey = 'category') {
  return data.filter((item) => item[categoryKey].replace(/[^\w]/g, '').toLowerCase() === category.replace(/[^\w]/g, '').toLowerCase());
}

function groupByLanguage(data) {
  return data.reduce((acc, cur) => {
    acc[cur.language] = acc[cur.language] || [];
    acc[cur.language].push(cur);
    return acc;
  }, {});
}

async function fetchCategoryKeys(category) {
  try {
    const { data } = await getJsonFromUrl('/product-data/rc-attribute-master-file.json');
    return filterByCategory(data, category, 'Subcategory');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Category Keys:', error);
  }
  return [];
}

async function fetchDocs(category) {
  try {
    const { data } = await getJsonFromUrl('/catalogs-categories.json');
    return {
      catalogs: groupByLanguage(filterByCategory(data.filter((catalog) => catalog.type.toLowerCase() !== 'manual'), category)),
      manuals: groupByLanguage(filterByCategory(data.filter((catalog) => catalog.type.toLowerCase() === 'manual'), category)),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Docs:', error);
  }
  return null;
}

function renderDocsSection(docsList, sectionType) {
  const section = document.querySelector(`.pdp-${sectionType}`);
  const sectionWrapper = section.querySelector('.default-content-wrapper');
  if (!section || !sectionWrapper || !Object.keys(docsList).length) return;

  const fragment = docRange.createContextualFragment(`
    <ul class="pdp-${sectionType}-list"></ul>
  `);
  sectionWrapper.append(fragment);

  Object.entries(docsList).forEach(([language, docs]) => {
    const docsFragment = docRange.createContextualFragment(`
      <li class="pdp-${sectionType}-list-item">
        <div class="pdp-${sectionType}-list-title">${getTextLabel(language)}</div>
        <div class="pdp-${sectionType}-list-link">
          ${docs.map((doc) => `<a target="_blank" href="${doc.file}">${doc.title}</a>`).join('')}
        </div>
      </li>
    `);
    sectionWrapper.querySelector(`.pdp-${sectionType}-list`).append(docsFragment);
  });
  section.classList.remove('hide');
}

function renderDocs(docs) {
  renderDocsSection(docs.catalogs, 'catalogs');
  renderDocsSection(docs.manuals, 'manuals');
}

// Check if product has catalog, product sheet , ecatalaogs section
async function fetchSDS(category) {
  try {
    const { data } = await getJsonFromUrl('/sds-categories.json');

    return filterByCategory(data, category);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching part SDS:', error);
  }
  return null;
}

function renderSDS(sdsList) {
  const sdsContainer = document.querySelector('.pdp-sds');
  const sectionWrapper = sdsContainer.querySelector('.default-content-wrapper');
  if (!sdsContainer || !sectionWrapper || !sdsList.length) return;

  const fragment = docRange.createContextualFragment(`
    <ul class="pdp-sds-list"></ul>
  `);
  sectionWrapper.append(fragment);

  sdsList.forEach((sds) => {
    const sdsFragment = docRange.createContextualFragment(`
      <li class="pdp-sds-list-item">
        <a target="_blank" href="${sds.file}">${sds.title}</a>
      </li>
    `);
    sectionWrapper.querySelector('.pdp-sds-list').append(sdsFragment);
  });
  sdsContainer.classList.remove('hide');
}

// Check if product has catalog, product sheet , ecatalaogs section
async function fetchBlogs(category) {
  try {
    const { data } = await getJsonFromUrl('/blog/query-index.json');

    return filterByCategory(data, category);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching Blogs:', error);
  }
  return null;
}

function renderBlogs(blogList) {
  const blogsContainer = document.querySelector('.pdp-blogs');
  const sectionWrapper = blogsContainer.querySelector('.default-content-wrapper');
  if (!blogsContainer || !sectionWrapper || !blogList.length) return;

  const fragment = docRange.createContextualFragment(`
    <ul class="pdp-blogs-list"></ul>
  `);
  sectionWrapper.append(fragment);

  blogList
    .filter((blog) => Number.isInteger(parseInt(blog.date, 10)))
    .sort((blog1, blog2) => blog1.date - blog2.date)
    .slice(-3)
    .forEach((sds) => {
      const sdsFragment = docRange.createContextualFragment(`
        <li class="pdp-blogs-list-item">
          <a target="_blank" href="${sds.path}"><h6 class="pdp-blogs-title">${sds.title}</h6></a>
          <p class="pdp-blogs-date">${new Date(parseInt(sds.date, 10) * 1000).toLocaleDateString()}</p>
          <p class="pdp-blogs-description">${sds.description}</p>
          <a class="pdp-blogs-cta" target="_blank" href="${sds.path}">Read More</a>
        </li>
      `);
      sectionWrapper.querySelector('.pdp-blogs-list').append(sdsFragment);
    });
  blogsContainer.classList.remove('hide');
}

function setOrCreateMetadata(propName, propVal) {
  const meta = document.head.querySelector(`meta[property="${propName}"]`);
  if (meta) {
    meta.setAttribute('content', propVal);
  } else {
    const newMeta = createElement('meta', {
      props: {
        property: propName,
        content: propVal,
      },
    });
    document.head.appendChild(newMeta);
  }
}

function updateMetadata(part) {
  setOrCreateMetadata('og:title', part['Base Part Number']);
  setOrCreateMetadata('og:description', part['Part Name']);
  setOrCreateMetadata('og:url', window.location.href);
  setOrCreateMetadata('twitter:title', part['Base Part Number']);
  setOrCreateMetadata('twitter:description', part['Part Name']);
}

function updateImageMetadata(images) {
  setOrCreateMetadata('og:image', images[0]['Image URL']);
  setOrCreateMetadata('twitter:image', images[0]['Image URL']);
}

function renderBreadcrumbs(part) {
  const breadcrumbSection = document.querySelector('.section.breadcrumbs');
  if (!breadcrumbSection) return;

  const breadcrumbs = docRange.createContextualFragment(`
    <div class="breadcrumb-wrapper">
      <div class="breadcrumb block">
        <div class="breadcrumb-content">
          <ul class="breadcrumb-list">
            <li class="breadcrumb-item breadcrumb-item-0">
              <a class="breadcrumb-link" href="/">Road Choice</a>
            </li>
            <li class="breadcrumb-item breadcrumb-item-0">
              <a class="breadcrumb-link" href="/">Parts</a>
            </li>
            <li class="breadcrumb-item breadcrumb-item-1">
              <a class="breadcrumb-link" href="/part-category/${part.Category.toLowerCase()}">${part.Category}</a>
            </li>
            <li class="breadcrumb-item breadcrumb-item-2">
              <a class="breadcrumb-link" href="/part-category/${part.Subcategory.toLowerCase()}">${part.Subcategory}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `);
  breadcrumbSection.append(breadcrumbs);
}

export default async function decorate(block) {
  const pathSegments = getQueryParams();
  renderPartBlock(block);

  getPDPData(pathSegments).then((part) => {
    if (part) {
      renderBreadcrumbs(part, block);
      setPartData(part, block);
      updateMetadata(part);
      fetchCategoryKeys(pathSegments.category).then((categoryKeys) => {
        renderColDetails(part, block, categoryKeys);
      });
    }
  });

  fetchPartImages(pathSegments.sku).then((images) => {
    updateImageMetadata(images);
    renderImages(block, images);
  });

  fetchDocs(pathSegments.category).then(renderDocs);
  fetchSDS(pathSegments.category).then(renderSDS);
  fetchBlogs(pathSegments.category).then(renderBlogs);

  document.querySelector('main').addEventListener('click', (e) => {
    if (e.target.matches('.section.accordion h5')) {
      e.target.closest('.section.accordion').classList.toggle('accordion-open');
    }
  });
}
