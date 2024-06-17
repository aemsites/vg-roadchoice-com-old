import { createElement } from '../../scripts/common.js';

const ACTIVE_SLIDE_CLASS = 'carousel-slide-active';
const ACTIVE_CONTROL_STEP_CLASS = 'carousel-controls-pagination-step-active';
const SLIDE_CHANGE_TIME = 6000;

const buildSlide = (slideTemplate) => {
  const slideEl = createElement('li', { classes: 'carousel-slide' });
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
  const slidesCountrolsEl = createElement('div', { classes: 'carousel-controls' });

  const slidesControls = Array(slidesCount).fill(0);
  slidesControls.forEach((_el, index) => {
    const paginationStep = createElement('div', { classes: 'carousel-controls-pagination-step' });
    paginationStep.addEventListener('click', () => {
      onSelect(index);
    });
    slidesCountrolsEl.append(paginationStep);
  });

  carouselEl.append(slidesCountrolsEl);
};

const renderArrows = (carouseEl, onSelect, carouselState) => {
  const arrowsControl = `
    <button class="carousel-arrows-left" aria-label="slide left"></button>
    <button class="carousel-arrows-right" aria-label="slide right"></button>
  `;

  const arrowsControlEl = createElement('div', { classes: 'carousel-arrows-controls' });
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
    }, SLIDE_CHANGE_TIME);
  };

  carouseEl.addEventListener('mouseover', () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  carouseEl.addEventListener('mouseout', () => {
    runAutoChange();
  });

  runAutoChange();
};

const onScroll = (carousel, onChange, carouselState) => {
  const list = carousel.querySelector('ul.carousel-slide-list');
  let pauseTimeout = null;

  const disableScrollingForTime = (el, time = 50) => {
    const prevStyle = el.style.overflow;

    el.style.overflow = 'hidden';

    pauseTimeout = setTimeout(() => {
      el.style.overflow = prevStyle;
      pauseTimeout = null;
    }, time);
  };

  list.addEventListener('scroll', () => {
    const { activeSlideIndex, slideNumber } = carouselState;

    if (pauseTimeout) {
      return;
    }

    const listWidth = list.getBoundingClientRect().width;
    const actualItemStartPosition = listWidth * activeSlideIndex;

    if (actualItemStartPosition < list.scrollLeft) {
      const newIndex = activeSlideIndex < slideNumber - 1 ? activeSlideIndex + 1 : 0;

      if (activeSlideIndex !== newIndex) {
        onChange(newIndex);
      }

      disableScrollingForTime(list);

      return;
    }

    if (actualItemStartPosition > list.scrollLeft) {
      const newIndex = activeSlideIndex ? activeSlideIndex - 1 : slideNumber - 1;

      if (activeSlideIndex !== newIndex) {
        onChange(newIndex);
      }

      disableScrollingForTime(list);
    }
  });
};

export default function decorate(block) {
  const carouselEl = createElement('ul', { classes: 'carousel-slide-list' });
  carouselEl.innerHTML = block.innerHTML;
  block.innerHTML = '';
  block.append(carouselEl);

  const slides = block.querySelectorAll(':scope > ul > div');
  [...slides].forEach(buildSlide);

  const carouselState = {
    activeSlideIndex: 0,
    slideNumber: [...slides].length,
    locked: false,
  };

  const setActiveSlideIndex = (newIndex) => {
    const slidesList = block.querySelectorAll('.carousel-slide');
    const paginationSteps = [...block.querySelectorAll('.carousel-controls-pagination-step')];

    [...slidesList].forEach((slide, index) => {
      const action = index === newIndex ? 'add' : 'remove';
      slide.classList[action](ACTIVE_SLIDE_CLASS);

      if (paginationSteps.length) {
        paginationSteps[index].classList[action](ACTIVE_CONTROL_STEP_CLASS);
      }
    });

    const ul = block.querySelector('ul.carousel-slide-list');
    const left = ul.getBoundingClientRect().width * newIndex;

    ul.scrollTo({ top: 0, left, behavior: 'instant' });

    carouselState.activeSlideIndex = newIndex;
  };

  window.addEventListener('resize', () => {
    const ul = block.querySelector('ul.carousel-slide-list');
    const left = ul.getBoundingClientRect().width * carouselState.activeSlideIndex;

    ul.scrollTo({ top: 0, left, behavior: 'instant' });
  });

  if (carouselState.slideNumber > 1) {
    renderArrows(block, setActiveSlideIndex, carouselState);
  }
  if (carouselState.slideNumber > 1) {
    renderSlidesControls(block, setActiveSlideIndex);
  }
  setActiveSlideIndex(0);
  if (carouselState.slideNumber > 1) {
    autoSlideChange(block, setActiveSlideIndex, carouselState);
  }
  onScroll(block, setActiveSlideIndex, carouselState);
}
