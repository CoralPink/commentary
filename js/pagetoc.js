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

let prevCurrent = null;

const update = () => {
  const y_offset = window.pageYOffset;

  if (y_offset < 0) {
    return;
  }

  const getCurrentHeadline = () => {
    let head;

    Array.prototype.some.call(cacheHeader, (el) => {
      if (y_offset >= el.offsetTop) {
        head = el;
      } else {
        return true;
      }
    });

    return head;
  };

  const current = getCurrentHeadline();

  if (current == prevCurrent) {
    return;
  }

  Array.prototype.forEach.call(cachePagetoc, (el) => {
    if (el.href.localeCompare(current.href) == 0) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  prevCurrent = current;
};

const scrollListenerControl = () => {
  if (window.innerWidth < mobileMaxWidth) {
    globalThis.removeEventListener('scroll', update);
    return;
  }
  update();
  globalThis.addEventListener('scroll', update);
};

globalThis.addEventListener('load', scrollListenerControl);
globalThis.addEventListener('resize', scrollListenerControl);
