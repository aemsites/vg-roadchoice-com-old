const activeSlideClass = 'carousel-slide-active';
const activeControlStepClass = 'carousel-controls-pagination-step-active';

const buildSlide = (slideTemplate) => {
  const slideEl = document.createElement('li');
  slideEl.classList.add('carousel-slide');
  slideEl.innerHTML = slideTemplate.innerHTML;
  slideEl.children[0].classList.add('carousel-slide-content-wrapper');

  const backgroundImg = slideEl.querySelector('picture');

  // unwrap the picture tag to be direct child of the slide
  if (backgroundImg && backgroundImg.parentElement.tagName === 'P') {
    backgroundImg.parentElement.replaceWith(backgroundImg);
    backgroundImg.classList.add('carousel-slide-background');
  }

  // moving background image as the first child of the slide
  if (backgroundImg) {
    backgroundImg.closest('.carousel-slide').prepend(backgroundImg);
  }

  const heading = slideEl.querySelector('h1, h2, h3');
  heading.classList.add('carousel-heading');

  slideTemplate.replaceWith(slideEl);
};

const renderSlidesControls = (carouselEl, onSelect) => {
  const slidesCount = carouselEl.querySelectorAll('.carousel-slide').length;
  const slidesCountrolsEl = document.createElement('div');
  slidesCountrolsEl.classList.add('carousel-controls');

  const slidesControls = Array(slidesCount).fill(0);
  slidesControls.forEach((_el, index) => {
    const paginationStep = document.createElement('div');
    paginationStep.classList.add('carousel-controls-pagination-step');
    paginationStep.addEventListener('click', () => {
      onSelect(index);
    })
    slidesCountrolsEl.append(paginationStep);
  });

  carouselEl.append(slidesCountrolsEl);
};

const renderArrows = (carouseEl, onSelect, carouselState) => {
  const arrowsControl = `
    <button class="carousel-arrows-left" aria-label="slide left"></button>
    <button class="carousel-arrows-right" aria-label="slide right"></button>
  `;

  const arrowsControlEl = document.createElement('div');
  arrowsControlEl.classList.add('carousel-arrows-controls');
  arrowsControlEl.innerHTML = arrowsControl;

  const leftArrow = arrowsControlEl.querySelector('.carousel-arrows-left');
  const rightArrow = arrowsControlEl.querySelector('.carousel-arrows-right');

  leftArrow.addEventListener('click', () => {
    const activeIndex = carouselState.activeSlideIndex;
    onSelect(activeIndex ? activeIndex - 1 : carouselState.slideNumber - 1);
  });

  rightArrow.addEventListener('click', () => {
    const activeIndex = carouselState.activeSlideIndex;
    onSelect(activeIndex < carouselState.slideNumber - 1 ? activeIndex + 1 : 0);
  });

  carouseEl.append(arrowsControlEl);
};

const autoSlideChange = (carouseEl, onChange, carouselState) => {
  let intervalId;

  const runAutoChange = () => {
    intervalId = setInterval(() => {
      const { activeSlideIndex, slideNumber } = carouselState;

      onChange(activeSlideIndex < slideNumber - 1 ? activeSlideIndex + 1 : 0);
    }, 6000);
  }

  carouseEl.addEventListener('mouseover', () => {
    intervalId && clearInterval(intervalId);
  });

  carouseEl.addEventListener('mouseout', () => {
    runAutoChange();
  });

  runAutoChange();
};

export default function decorate(block) {
  const carouselEl = document.createElement('ul');
  carouselEl.classList.add('carousel-slide-list');
  carouselEl.innerHTML = block.innerHTML;
  block.innerHTML = '';
  block.append(carouselEl);

  const slides = block.querySelectorAll(':scope > ul > div');
  [...slides].forEach(buildSlide);

  const carouselState = {
    activeSlideIndex: 0,
    slideNumber: [...slides].length,
    locked: false,
  }

  const setActiveSlideIndex = (newIndex) => {
    const slides = block.querySelectorAll('.carousel-slide');
    const paginationSteps = [...block.querySelectorAll('.carousel-controls-pagination-step')];

    [...slides].forEach((slide, index) => {
      const action = index === newIndex ? 'add' : 'remove';
      slide.classList[action](activeSlideClass);
      paginationSteps[index].classList[action](activeControlStepClass);
    });

    carouselState.activeSlideIndex = newIndex;
  }

  carouselState.slideNumber > 1 && renderArrows(block, setActiveSlideIndex, carouselState);
  carouselState.slideNumber > 1 && renderSlidesControls(block, setActiveSlideIndex);
  setActiveSlideIndex(0);
  carouselState.slideNumber > 1 && autoSlideChange(block, setActiveSlideIndex, carouselState);
}
