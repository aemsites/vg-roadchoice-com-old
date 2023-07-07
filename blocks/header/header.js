/* eslint-disable no-use-before-define */
import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 992px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
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
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
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
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
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
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        const nextLevelList = navSection.querySelector('ul');
        if (nextLevelList) {
          nextLevelList.className = 'level-2';
          navSection.classList.add('nav-drop');
        }
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });

      navSections.querySelectorAll(':scope > ul > li > ul > li').forEach((navSection) => {
        const nextLevelList = navSection.querySelector('ul');
        if (nextLevelList) {
          nextLevelList.className = 'level-3';
          navSection.classList.add('nav-drop');
        }
      });

      // add css classes for styling purposes
      const sectionClasses = ['main', 'mobile'];
      const sectionNavs = navSections.querySelectorAll(':scope > ul');
      if (sectionNavs.length === sectionClasses.length) {
        sectionNavs[0].className = 'level-1';
        sectionClasses.forEach((c, i) => sectionNavs[i].classList.add(`nav-sections-${c}`));
      }
      const sectionNavsLvl2 = sectionNavs[0].querySelectorAll('ul.level-2');
      if (sectionNavsLvl2) {
        [...sectionNavsLvl2].forEach((ul) => {
          const lvl2Wrapper = ul.closest('li');
          const arrowRight = createElement('span', { classes: ['fa', 'fa-arrow-right'] });
          lvl2Wrapper.appendChild(arrowRight);
          lvl2Wrapper.classList.add('has-lvl2');
          console.log({ lvl2Wrapper });
        });
      }
    }
    // TODO: add listener to the arrow to navigate in mobile viewport

    // hamburger for mobile
    const hamburger = createElement('div', { classes: 'nav-hamburger' });
    const hamburgerInnerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
    </button>`;
    const fragment = docRange.createContextualFragment(hamburgerInnerHTML);
    hamburger.appendChild(fragment);
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateIcons(nav);
    const navWrapper = createElement('div', { classes: 'nav-wrapper' });
    navWrapper.append(nav);

    // move tools as direct children of nav-wrapper
    const navTools = nav.querySelector('.nav-tools');
    navWrapper.appendChild(navTools);

    block.append(navWrapper);
  }
}
