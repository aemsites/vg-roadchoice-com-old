export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className += 'ul_list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className += 'li_list';
    const div1 = document.createElement('a');
    div1.innerHTML = row.innerHTML;

    [...li.children].forEach((divw) => {
      if (divw.children.length === 1);
      else divw.className = 'cards-card-body';
    });
    ul.append(li);
    li.appendChild(div1);
  });
  block.textContent = '';
  block.append(ul);
}
