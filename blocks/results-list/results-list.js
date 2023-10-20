import { createElement } from '../../scripts/scripts.js';
import productCard from './product-card.js';
import { amountOfProducts } from '../search/search.js';
import { results, allProducts } from '../../templates/search-results/search-results.js';

let amount = amountOfProducts;
let products;
let query;
let category;
const isSearchResult = document.querySelector('.search-results') !== null;

if (isSearchResult) {
  amount = JSON.parse(sessionStorage.getItem('amount')) || amountOfProducts;
  products = JSON.parse(sessionStorage.getItem('results')) || [];
  query = JSON.parse(sessionStorage.getItem('query')) || {};
  category = new URLSearchParams(window.location.search).get('cat');
  if (category) {
    products = products.filter((item) => item['Part Category'].toLowerCase() === category) || [];
  }
}

const searchType = (query.searchType === 'cross' && 'cross') || 'parts';

// eslint-disable-next-line object-curly-newline
const renderResults = ({ loadingElement, productList, isTruckLibrary, detail }) => {
  loadingElement.remove();
  products = detail?.results;
  if (products.length === 0) return;
  products.forEach((prod, idx) => {
    prod.hasImage = false;
    const filterLoop = detail.data.imgData.filter((e) => e['Part Number'] === prod['Base Part Number']
    && ((isTruckLibrary(e['Image URL']) && e['Image URL'].includes('.0?$'))
    || (!isTruckLibrary(e['Image URL']) && e['Image URL'].includes('-0.jpg'))));
    if (filterLoop.length >= 1) {
      prod.hasImage = true;
      prod.imgUrl = filterLoop[0]['Image URL'];
    }
    const productItem = productCard(prod, searchType);
    if (idx >= amount) productItem.classList.add('hidden');
    productList.appendChild(productItem);
  });
};

export default async function decorate(block) {
  const resultsSection = createElement('div', { classes: 'results-section' });
  const productList = createElement('ul', { classes: 'results-list' });
  const loadingElement = createElement('div', { classes: 'loading', textContent: 'Loading...' });
  resultsSection.append(loadingElement);

  const isTruckLibrary = (text) => text.includes('trucklibrary.com');

  console.log('%cresults-list no-listener', 'color: deeppink', { results, products, allProducts, window_allProducts: window?.allProducts, window });
  if (results.length > 0) {
    const imgData = window?.allProducts?.imgData || allProducts?.imgData || [];
    renderResults({
      loadingElement, productList, isTruckLibrary, detail: { results, data: { imgData } },
    });
    if (!allProducts?.imgData) {
      setTimeout(() => {
        if (allProducts.imgData) {
          const images = window?.allProducts?.imgData || allProducts?.imgData || [];
          console.log({images});
          productList.innerHTML = '';
          renderResults({
            loadingElement,
            productList,
            isTruckLibrary,
            detail: { results, data: { imgData: images } },
          });
        }
      }, 5000);
    }
  }

  document.addEventListener('DataLoaded', ({ detail }) => {
    console.log('%cDataLoaded results-list', 'color: deeppink');
    renderResults({
      loadingElement, productList, isTruckLibrary, detail,
    });
  });

  resultsSection.append(productList);

  block.textContent = '';
  block.append(resultsSection);
}
