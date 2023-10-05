export default function decorate(block) {
  const tableRows = block.querySelectorAll(':scope > div');
  [...tableRows].forEach((row) => {
    const tableColumns = row.querySelectorAll(':scope > div');
    [...tableColumns].forEach((column) => {
      const link = column.querySelector(':scope > a');
      column.removeAttribute('data-valign');
      column.className = 'manuals-table-column';
      if (!link) return;
      column.textContent = '';
      column.appendChild(link);
    });
  });
}
