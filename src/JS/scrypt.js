import { error, notice } from '@pnotify/core';
import galleryTemplate from '../templates/gallery.hbs';
import { Select } from './select';
import * as basicLightbox from 'basiclightbox';

const refs = {
  btnSearch: document.querySelector('.search-form__btn'),
  btnLoadMore: document.querySelector('.load-more_btn'),
  gallery: document.querySelector('.gallery'),
  query: document.querySelector('.search-form__input'),
  form: document.querySelector('.search-form'),
};

new Select('#select', {
  selectedId: '1',
  data: [
    { id: '1', value: 'en' },
    { id: '2', value: 'ru' },
    { id: '3', value: 'de' },
    { id: '4', value: 'fr' },
    { id: '5', value: 'it' },
  ],
  onSelect(item) {
    ImageFinder.lenguage = item.value;
  },
});

const ImageFinder = {
  key: 'key=18267918-a545f4b922b3d8b59313b99e1',
  page: 1,
  lenguage: 'en',
  baseURL:
    'https://pixabay.com/api/?image_type=photo&orientation=horizontal&q=',
};

refs.btnSearch.addEventListener('click', onClickSearch);
refs.gallery.addEventListener('click', onImageClick);

const Observer = new IntersectionObserver(loadMore, {
  rootMargin: '0px',
  threshold: 0.4,
});

async function getData() {
  const { baseURL, searchQuery, key, page, lenguage } = ImageFinder;
  const url = `${baseURL}${searchQuery}&page=${page}&lang=${lenguage}&per_page=12&${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const { hits, total } = data;
    if (!total) return notice('Search failed');
    const layout = galleryTemplate(hits);
    refs.gallery.insertAdjacentHTML('beforeend', layout);
    Observer.observe(refs.gallery.lastElementChild);
  } catch (e) {
    error(e);
  }
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onClickSearch(event) {
  event.preventDefault();
  clearGallery();
  ImageFinder.page = 1;
  ImageFinder.searchQuery = refs.query.value;
  getData();
}

function onImageClick(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }
  const src = event.target.dataset.source;
  basicLightbox
    .create(
      `
  	<img width="1400" height="900" src=${src}>
  `,
    )
    .show();
}

function loadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      ImageFinder.page += 1;
      getData();
    }
  });
}
