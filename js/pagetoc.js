// This is code that is assumed to be called last.

const tocMap = new Map();
let onlyActive = null;

const addActive = entry => {
  if (onlyActive) {
    onlyActive.classList.remove('active');
    onlyActive = null;
  }
  tocMap.get(entry.target).classList.add('active');
}

const removeActive = entry => {
  let count = 0;
  let active = null;

  tocMap.forEach(key => { if (key.classList.contains('active')) {
    count++;
    active = key;
  }});

  if (count <= 1) {
    onlyActive = active;
    return;
  }
  tocMap.get(entry.target).classList.remove('active');
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(x => { x.isIntersecting ? addActive(x) : removeActive(x); })
}, {
  root: document.querySelector('content'),
});

document.querySelectorAll('a.header').forEach(el => {
  observer.observe(el);

  const link = document.createElement('a');

  link.appendChild(document.createTextNode(el.text));
  link.href = el.href;
  link.classList.add(el.parentElement.tagName);

  document.getElementsByClassName('pagetoc')[0].appendChild(link);
  tocMap.set(el, link);
});
