import { createOptimizedPicture, readBlockConfig } from '../../scripts/lib-franklin.js';
import { div } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className += 'ul_list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className += 'li_list';
    li.innerHTML = row.innerHTML;  

    [...li.children].forEach((div) => {
      if (div.children.length === 1)
{
  const div1 = document.createElement('a');
  div1.appendChild(div);

}      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
