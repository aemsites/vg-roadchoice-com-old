/* eslint-disable no-use-before-define */
import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 992px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function HideOtherNavItems(parent, element) {
  const { children } = parent;
  if (['level-2', 'level-3'].some((item) => parent.classList.contains(item))) {
    parent.closest('.has-sublevel').classList.add('next-level');
  }
  const otherItems = [...children].filter((item) => item !== element);
  otherItems.forEach((item) => item.classList.add('hide'));
}

function ShowOtherNavItems(parent) {
  const { children } = parent;
  if (['level-2', 'level-3'].some((item) => parent.classList.contains(item))) {
    parent.closest('.has-sublevel').classList.remove('next-level');
  }
  [...children].forEach((item) => item.classList.remove('hide'));
}

function buildSubSection(sectionNavs) {
  [...sectionNavs].forEach((ul) => {
    const lvlWrapper = ul.closest('li');
    const arrowRight = createElement('span', { classes: ['icon', 'fa', 'fa-arrow-right'] });
    const arrowLeft = createElement('span', { classes: ['icon', 'fa', 'fa-arrow-left', 'hide'] });
    lvlWrapper.appendChild(arrowRight);
    lvlWrapper.prepend(arrowLeft);
    lvlWrapper.classList.add('has-sublevel');
    arrowRight.onclick = () => {
      lvlWrapper.classList.add('show');
      lvlWrapper.setAttribute('aria-expanded', 'true');
      HideOtherNavItems(lvlWrapper.parentElement, lvlWrapper);
      arrowRight.classList.add('hide');
      arrowLeft.classList.remove('hide');
    };
    arrowLeft.onclick = () => {
      lvlWrapper.classList.remove('show');
      lvlWrapper.setAttribute('aria-expanded', 'false');
      ShowOtherNavItems(lvlWrapper.parentElement);
      arrowRight.classList.remove('hide');
      arrowLeft.classList.add('hide');
    };
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function setupNextLevelList(navSections, selector, level) {
  navSections.querySelectorAll(selector).forEach((navSection) => {
    const nextLevelList = navSection.querySelector('ul');
    if (nextLevelList) {
      nextLevelList.className = `level-${level}`;
      navSection.classList.add('nav-drop');
      navSection.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const docRange = document.createRange();
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    block.textContent = '';
    const html = await resp.text();

    // decorate nav DOM
    const nav = createElement('nav', { props: { id: 'nav' } });
    const navFragment = docRange.createContextualFragment(html);
    nav.appendChild(navFragment);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      const navLevels = 4;
      let selector = ':scope';
      for (let i = 2; i <= navLevels; i += 1) {
        selector += ' > ul > li';
        setupNextLevelList(navSections, selector, i);
      }

      // TODO prepare styling and scripts for desktop version

      // navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
      //   const nextLevelList = navSection.querySelector('ul');
      //   if (nextLevelList) {
      //     nextLevelList.className = 'level-2';
      //     navSection.classList.add('nav-drop');
      //     navSection.setAttribute('aria-expanded', 'false');
      //   }
      //   navSection.onclick = () => {
      //     // * is Desktop Mode ?
      //     if (isDesktop.matches) {
      //       const expanded = navSection.getAttribute('aria-expanded') === 'true';
      //       // toggleAllNavSections(navSections);
      //       navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      //     }
      //   };
      // });

      // add css classes for styling purposes
      const sectionClasses = ['main', 'mobile'];
      const sectionNavs = navSections.querySelectorAll(':scope > ul');
      if (sectionNavs.length === sectionClasses.length) {
        sectionNavs[0].className = 'level-1';
        sectionClasses.forEach((c, i) => sectionNavs[i].classList.add(`nav-sections-${c}`));
      }
      for (let i = 2; i <= navLevels; i += 1) {
        const subSectionNav = sectionNavs[0].querySelectorAll(`ul.level-${i}`);
        if (subSectionNav) buildSubSection(subSectionNav);
      }
    }

    // hamburger for mobile
    const hamburger = createElement('div', { classes: 'nav-hamburger' });
    const hamburgerInnerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
    </button>`;
    const fragment = docRange.createContextualFragment(hamburgerInnerHTML);
    hamburger.appendChild(fragment);
    hamburger.onclick = () => toggleMenu(nav, navSections);
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.onclick = () => toggleMenu(nav, navSections, isDesktop.matches);

    // decorateIcons(nav); // ?
    const navWrapper = createElement('div', { classes: 'nav-wrapper' });
    navWrapper.append(nav);

    // move tools as direct children of nav-wrapper
    const navTools = nav.querySelector('.nav-tools');
    navWrapper.appendChild(navTools);

    block.append(navWrapper);
  }
}
