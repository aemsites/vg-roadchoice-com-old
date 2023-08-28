import { getTextLabel, createElement } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const partNumberText = getTextLabel('part number');

// todo in case we need the fallback image locally
// const placeholderImageLocal = '/media/00-rc-placeholder-image.png'

const getProperties = (prod, st) => {
  const cardContent = {};

  if (st === 'cross') {
    cardContent.category = prod['Part Category'];
    // todo check for name, we dont have it now in the excel file
    cardContent.name = prod['Description'];
    cardContent.partNumber = prod['Base Part Number'];
    cardContent.hasImage = prod.hasImage;
  }
  if (st === 'parts') {
    cardContent.category = prod['Part Category'];
    cardContent.name = prod['Part Name'];
    cardContent.partNumber = prod['Base Part Number'];
    cardContent.hasImage = prod.hasImage;
  }
  return cardContent;
};

const productCard = (product, searchType, idx, amount) => {
  const object = getProperties(product, searchType);

  // todo unfinished... a way to add a page number to make the pagination
  let page = 1;
  amount = 2;
  if (idx === amount) page += 1;
  console.log(page);

  const [
    category,
    name,
    partNumber,
    // todo see if this is needed when images go to sharepoint
    // hasImage,
  ] = Object.values(object);

  const item = createElement('li', { classes: 'product' });

  // todo check if this is the way to point to the repository
  const repository = 'https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com';

  const imageUrl = `${repository}/media/images/${partNumber}--0.jpg`;
  const placeholderImageUrl = `${repository}/media/images/00-rc-placeholder-image.jpg`;

  // todo check how the link content should finally be
  const linkUrl = `${window.location.href}/${category}/${partNumber}`;

  const imageLink = createElement('a', { classes: 'image-link', props: { href: linkUrl } });
  const image = createOptimizedPicture((imageUrl || placeholderImageUrl), 'product image', false, [{ width: '200' }], true);
  image.classList.add('image');
  imageLink.appendChild(image);

  // todo make fallback image appear when no image is in sharepoint
  // const imgtag = image.querySelector('img')
  // imgtag.setAttribute('onerror', `this.onerror=null;this.src='${placeholderImageLocal}';`)
  // imgtag.onerror =  placeholderImageLocal

  const titleLink = createElement('a', { classes: 'title-link', props: { href: linkUrl } });
  const title = createElement('h6', { classes: 'title' });
  title.textContent = name;
  titleLink.appendChild(title);

  const partLabel = createElement('span', { classes: 'part-number' });
  const text = createElement('p', { classes: 'part-label', textContent: `${partNumberText}:` });
  const number = createElement('a', { classes: 'part-link', props: { href: linkUrl }, textContent: partNumber });
  partLabel.append(text, number);

  item.append(imageLink, titleLink, partLabel);

  return item;
};

export default productCard;
