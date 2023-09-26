import { createElement, getTextLabel } from '../../scripts/scripts.js';

let amount;
let products;
const moreBtns = [];
let hasMoreItems = false;
let currentAmount = 0;
let newText = '';
const paginationText = getTextLabel('pagination text');
const buttonText = getTextLabel('pagination button');

const loadMoreProducts = (props) => {
  const { hidden, amountText } = props;
  const { length } = hidden;
  const isLessThanAmount = length <= amount;
  const nextAmount = isLessThanAmount ? length : amount;
  currentAmount += nextAmount;

  for (let i = 0; i < nextAmount; i += 1) {
    hidden[i].classList.remove('hidden');
  }

  amountText.textContent = paginationText.replace('[$]', currentAmount);

  if (isLessThanAmount) moreBtns.forEach((btn) => btn.classList.add('hidden'));
};

const addShowMoreHandler = (btn, resultsListBlock, amountText) => {
  btn.onclick = () => loadMoreProducts({
    hidden: resultsListBlock.querySelectorAll('.product.hidden'),
    amountText,
  });
};

const renderBlock = async (block) => {
  const textWrapper = createElement('div', { classes: 'text-wrapper' });
  const text = createElement('p', { classes: 'text', textContent: newText });

  if (hasMoreItems) {
    const moreBtn = createElement('button', {
      classes: ['more-button', 'hidden'], textContent: buttonText,
    });
    const bottomMoreBtn = createElement('button', {
      classes: ['more-button', 'bottom-more-button'], textContent: buttonText,
    });
    const resultsListBlock = document.querySelector('.category-results-list.block');
    addShowMoreHandler(moreBtn, resultsListBlock, text);
    addShowMoreHandler(bottomMoreBtn, resultsListBlock, text);
    textWrapper.append(moreBtn);

    document.addEventListener('ImagesLoaded', () => {
      resultsListBlock.querySelector('.results-wrapper').appendChild(bottomMoreBtn);
      moreBtn.classList.remove('hidden');
      moreBtns.push(moreBtn, bottomMoreBtn);
    });
  }

  textWrapper.prepend(text);
  block.append(textWrapper);
};

export default async function decorate(block) {
  document.addEventListener('CategoryDataLoaded', () => {
    amount = JSON.parse(sessionStorage.getItem('amount'));
    products = JSON.parse(sessionStorage.getItem('category-data'));
    hasMoreItems = products && products.length > amount;
    currentAmount = hasMoreItems ? amount : products.length;
    newText = paginationText.replace('[$]', currentAmount);
    renderBlock(block);
  });
}