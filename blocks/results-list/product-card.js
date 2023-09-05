import { getTextLabel, createElement } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const partNumberText = getTextLabel('part number');

const getProperties = (prod, st) => {
  const cardContent = {};
  const maxChars = 48;
  const { Description } = prod;
  const cardName = {
    // TODO check for name, we don't have it now in the excel file
    cross: Description && Description.length > maxChars
      ? `${Description.substring(0, maxChars)} ...` : Description,
    parts: prod['Part Name'],
  };

  cardContent.name = cardName[st];
  cardContent.category = prod['Part Category'];
  cardContent.partNumber = prod['Base Part Number'];
  cardContent.hasImage = prod.hasImage;
  return cardContent;
};

// const productCard = (product, searchType, idx, amount) => {
const productCard = (product, searchType) => {
  const object = getProperties(product, searchType);

  // todo unfinished... a way to add a page number to make the pagination
  // let page = 1;
  // amount = 2;
  // if (idx === amount) page += 1;
  // console.log(page);

  const {
    category,
    name,
    partNumber,
    hasImage,
  } = object;

  const item = createElement('li', { classes: 'product' });

  // TODO check if this is the way to point to the repository
  const repository = 'https://adobe.sharepoint.com/:i:/r/sites/HelixProjects/Shared%20Documents/sites/VolvoGroup/vg-roadchoice-com';

  const productImageUrl = `${repository}/media/images/${partNumber}--0.jpg`;
  const placeholderImageUrl = `${repository}/media/images/000-rc-placeholder-image.png`;
  const imageUrl = hasImage ? productImageUrl : placeholderImageUrl;

  // TODO check how the link content should finally be
  const linkUrl = `${window.location.href}/${category}/${partNumber}`;
  const imageLink = createElement('a', { classes: 'image-link', props: { href: linkUrl } });
  const picture = createOptimizedPicture(
    imageUrl,
    'product image',
    false,
    [{ width: '200' }],
    true,
  );
  picture.classList.add('image');
  imageLink.appendChild(picture);

  const titleLink = createElement('a', { classes: 'title-link', props: { href: linkUrl } });
  const title = createElement('h6', { classes: 'title', textContent: name });
  titleLink.appendChild(title);

  const partLabel = createElement('span', { classes: 'part-number' });
  const text = createElement('p', { classes: 'part-label', textContent: `${partNumberText}:` });
  const number = createElement('a', { classes: 'part-link', props: { href: linkUrl }, textContent: partNumber });
  partLabel.append(text, number);

  item.append(imageLink, titleLink, partLabel);

  return item;
};

export default productCard;
