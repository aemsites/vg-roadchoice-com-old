import { createElement } from '../../scripts/common.js';

const toggleAnswer = (e) => {
  const btn = e.target;
  const answer = btn.nextElementSibling;
  answer.classList.toggle('hide');
};

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div > div')];
  const questionList = createElement('ul', { classes: 'accordion-question-list' });

  rows.forEach((row) => {
    const allTexts = [...row.querySelectorAll('p')];
    const questionText = allTexts.shift();
    const item = createElement('li', { classes: 'accordion-item' });
    const button = createElement('button', {
      classes: ['accordion-button'],
      props: {
        type: 'button',
      },
      textContent: questionText.innerText,
    });
    button.onclick = (e) => toggleAnswer(e);
    const answer = createElement('div', { classes: ['accordion-answer', 'hide'] });
    answer.append(...allTexts);
    item.append(button, answer);
    questionList.append(item);
  });

  block.textContent = '';
  block.append(questionList);
}
