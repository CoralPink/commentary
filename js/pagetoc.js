// This is code that is assumed to be called last.

const cacheHeader = document.getElementsByClassName('header');
const cachePagetoc = document.getElementsByClassName('pagetoc')[0].children;

// FIXME: The definitions are all over the place.
const mobileMaxWidth = 750;

Array.prototype.forEach.call(cacheHeader, (el) => {
  const link = document.createElement('a');

  link.appendChild(document.createTextNode(el.text));
  link.href = el.href;
  link.classList.add(el.parentElement.tagName);

  document.getElementsByClassName('pagetoc')[0].appendChild(link);
});

const update = () => {
  const getCurrentHeadline = () => {
    let head;

    Array.prototype.some.call(cacheHeader, (el) => {
      if (window.pageYOffset >= el.offsetTop) {
        head = el;
      } else {
        return true;
      }
    });

    return head;
  };

  const current = getCurrentHeadline();

  if (!current) {
    return;
  }

  Array.prototype.forEach.call(cachePagetoc, (el) => {
    if (el.href.localeCompare(current.href) == 0) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
};

const scrollListenerControl = () => {
  if (window.innerWidth < mobileMaxWidth) {
    window.removeEventListener('scroll', update);
    return;
  }
  update();
  window.addEventListener('scroll', update);
};

window.addEventListener('load', scrollListenerControl);
window.addEventListener('resize', scrollListenerControl);
