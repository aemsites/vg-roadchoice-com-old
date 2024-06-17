import { getJsonFromUrl } from '../../scripts/scripts.js';
import { createElement } from '../../scripts/common.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

const rowsToDelete = ['type', 'bold'];

const buildHeaders = (headers) => {
  const tableRow = createElement('tr', { classes: 'cookie-table-row' });
  headers.forEach((header, idx) => {
    if (rowsToDelete.includes(header)) return null;
    const head = createElement('th', { classes: ['cookie-table-head', `t-${idx}`] });
    head.textContent = header.replace('-', ' ');
    tableRow.appendChild(head);
    return null;
  });
  return tableRow;
};

const buildData = (data) => {
  const tableRows = [];
  data.forEach((e) => {
    const tableRow = createElement('tr', { classes: 'cookie-table-row' });
    const boldValue = e[e.bold];
    rowsToDelete.forEach((row) => delete e[row]);
    const values = Object.values(e);
    values.forEach((value, idx) => {
      const cell = createElement('td', { classes: ['cookie-table-cell', `t-${idx}`] });
      if (value === boldValue) cell.classList.add('bold-red');
      cell.textContent = value.replace('-', ' ');
      tableRow.appendChild(cell);
    });
    tableRows.push(tableRow);
  });
  return tableRows;
};

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const { type } = blockConfig;

  const url = '/resources/cookie-list.json';
  const { data: allCookies } = await getJsonFromUrl(url);

  const selectedCookies = allCookies.filter((cookie) => cookie.type === type);
  const headers = Object.keys(selectedCookies[0]);

  const table = createElement('table', { classes: 'cookie-table' });

  const tableHeaders = buildHeaders(headers);
  const tableData = buildData(selectedCookies);

  table.append(tableHeaders);
  tableData.forEach((row) => {
    table.appendChild(row);
  });
  block.textContent = '';
  block.appendChild(table);
}
