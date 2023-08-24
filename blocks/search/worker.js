const URLs = {
  crossReference: '/cross-reference-data/cross-reference-data.json',
  partNumber: '/product-data/road-choice-make-model-part-filter-options.json',
};

const limit = 100_000;
// const limit = 60_000;
// let isCrossRefActive = true;
let crData;
let pnData;
const tempData = [];

async function getJSONData(props) {
  const { url, offset = 0, limit: newLimit = null } = props;
  const nextOffset = offset > 0 ? `?offset=${offset}` : '';
  const nextLimit = limit ? `${offset > 0 ? '&' : '?'}limit=${newLimit}` : '';
  const results = await fetch(`${url}${nextOffset}${nextLimit}`);
  const json = await results.json();
  return json;
}

async function getMoreData(url, total, offset = 0) {
  const newOffset = offset + limit;
  const json = await getJSONData({ url, offset: newOffset, limit });
  const isLastCall = json.offset + limit >= json.total;
  if (isLastCall) {
    const lastData = [...tempData, ...json.data];
    tempData.length = 0;
    return lastData;
  }
  tempData.push(...json.data);
  return getMoreData(total, newOffset);
}

onmessage = async () => {
  const crJson = await getJSONData({ url: URLs.crossReference, limit });
  const pnJson = await getJSONData({ url: URLs.partNumber, limit });
  const crInitialData = [...crJson.data];
  const pnInitialData = [...pnJson.data];
  let crRemainingData;
  let pnRemainingData;
  if (crJson.data.length < crJson.total) {
    crRemainingData = await getMoreData(URLs.crossReference, crJson.total);
  }
  if (pnJson.data.length < pnJson.total) {
    pnRemainingData = await getMoreData(URLs.partNumber, pnJson.total);
  }

  crData = [...crInitialData];
  pnData = [...pnInitialData];
  if (crRemainingData) crData = [...crData, ...crRemainingData];
  if (pnRemainingData) pnData = [...pnRemainingData];
  postMessage({ crData, pnData });
};
