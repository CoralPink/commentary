// This is code that is assumed to be called last.

const cachePagetoc = document.getElementsByClassName('pagetoc')[0];

// TODO: I wonder if it could be implemented a little smarter.
let onlyActiveOne = false;

const checkOnly = () => {
  let count = 0;

  Array.prototype.forEach.call(cachePagetoc.children, el => {
    if (el.classList.contains('active')) {
      count++;
    }
  })
  return count <= 1;
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (onlyActiveOne) {
        Array.prototype.forEach.call(cachePagetoc.children, el => {
          el.classList.remove('active');
        })
        onlyActiveOne = false;
      }

      Array.prototype.forEach.call(cachePagetoc.children, el => {
        if (entry.target.text == el.textContent) {
          el.classList.add('active');
        }
      });
      return;
    }

    if (checkOnly()) {
      onlyActiveOne = true;
      return;
    }

    Array.prototype.forEach.call(cachePagetoc.children, el => {
      if (entry.target.text == el.textContent) {
        el.classList.remove('active');
      }
    })
  })
}, {
  root: document.querySelector('content'),
});

document.querySelectorAll('a.header').forEach(el => {
  observer.observe(el);

  const link = document.createElement('a');

  link.appendChild(document.createTextNode(el.text));
  link.href = el.href;
  link.classList.add(el.parentElement.tagName);

  cachePagetoc.appendChild(link);
});
