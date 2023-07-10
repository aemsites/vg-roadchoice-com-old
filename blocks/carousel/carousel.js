const activeSlideClass = 'carousel-slide-active';
const activeControlStepClass = 'carousel-controls-pagination-step-active';

const buildSlide = (slide) => {
  slide.classList.add('carousel-slide');
  const backgroundImg = slide.querySelector('picture');

  // unwrap the picture tag to be direct child of the slide
  if (backgroundImg && backgroundImg.parentElement.tagName === 'P') {
    backgroundImg.parentElement.replaceWith(backgroundImg);
  }

  const heading = slide.querySelector('h1, h2, h3');
  heading.classList.add('carousel-heading');
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
    <div class="carousel-arrows-left">\<</div>
    <div class="carousel-arrows-right">\></div>
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
  const slides = block.querySelectorAll(':scope > div');
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

  renderArrows(block, setActiveSlideIndex, carouselState);
  renderSlidesControls(block, setActiveSlideIndex);
  setActiveSlideIndex(0);
  autoSlideChange(block, setActiveSlideIndex, carouselState);
}
