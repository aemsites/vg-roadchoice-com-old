export default function decorate(block) { 
  const ul = document.createElement('ul');
  ul.className += 'ul_list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className += 'li_list'; 
    const divOne = document.createElement('a');
    divOne.innerHTML = row.innerHTML;
    divOne.className = 'cards-card-body';
   ul.append(li);
    li.appendChild(divOne);
  });
  block.textContent = '';
  block.append(ul);
}
