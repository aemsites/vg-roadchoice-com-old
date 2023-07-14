import { checkLinkProps } from '../../scripts/scripts.js';
import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    decorateIcons(footer);

    const children = footer.querySelectorAll('div');
    const [social, internal, privacy] = children;

    social.classList.add('footer-social-section');
    internal.classList.add('footer-internal-section');
    privacy.classList.add('footer-privacy-section');

    social.querySelectorAll('a').forEach((link) => {
      link.target = '_blank';
      const linkText = link.innerText.toLowerCase();
      const icon = document.createElement('i');
      icon.classList.add('social-icon', 'fa', `fa-${linkText}`);
      link.innerHTML = '';
      link.appendChild(icon);
    });

    checkLinkProps(internal.querySelectorAll('a'));
    checkLinkProps(privacy.querySelectorAll('a'));

    const privacyChildren = privacy.querySelectorAll('a');
    const lastChild = privacyChildren[privacyChildren.length - 1];
    lastChild.target = '_blank';

    block.append(footer);
  }
}
