export default function decorate(block) {
  const tableRows = block.querySelectorAll(':scope > div');
  [...tableRows].forEach((row) => {
    const tableColumns = row.querySelectorAll(':scope > div');
    row.className = 'table-row';
    [...tableColumns].forEach((column) => {
      column.className = 'table-column';
      column.removeAttribute('data-align');
      const strong = column.querySelector(':scope > strong');
      if (strong) {
        row.classList.add('title');
        column.classList.add('strong');
      }
    });
  });
}
