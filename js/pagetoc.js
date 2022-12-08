let cacheHeader = document.getElementsByClassName("header");
let cachePagetoc = document.getElementsByClassName("pagetoc")[0].children;

const updateFunction = () => {
  const getCurrentHeadline = () => {
    let head;

    Array.prototype.some.call(cacheHeader, function (el) {
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

  Array.prototype.forEach.call(cachePagetoc, function (el) {
    if (el.href.localeCompare(current.href) == 0) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
};

// Populate sidebar on load
window.addEventListener("load", function () {
  Array.prototype.forEach.call(cacheHeader, function (el) {
    const link = document.createElement("a");

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement.tagName);

    document.getElementsByClassName("pagetoc")[0].appendChild(link);
  });
  updateFunction();
});

// Handle active elements on scroll
window.addEventListener("scroll", updateFunction);
