// Un-active everything when you click it
Array.prototype.forEach.call(
  document.getElementsByClassName("pagetoc")[0].children,
  function (el) {
    el.addEventHandler("click", function () {
      Array.prototype.forEach.call(
        document.getElementsByClassName("pagetoc")[0].children,
        function (el) {
          el.classList.remove("active");
        }
      );
      el.classList.add("active");
    });
  }
);

var updateFunction = function () {
  var id;

  Array.prototype.some.call(
    document.getElementsByClassName("header"),
    function (el) {
      if (window.pageYOffset >= el.offsetTop) {
        id = el;
      } else {
        return true;
      }
    }
  );

  if (!id) {
    return;
  }

  Array.prototype.forEach.call(
    document.getElementsByClassName("pagetoc")[0].children,
    function (el) {
      if (id.href.localeCompare(el.href) == 0) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    }
  );
};

// Populate sidebar on load
window.addEventListener("load", function () {
  Array.prototype.forEach.call(
    document.getElementsByClassName("header"),
    function (el) {
      var link = document.createElement("a");

      link.appendChild(document.createTextNode(el.text));
      link.href = el.href;
      link.classList.add("pagetoc-" + el.parentElement.tagName);

      document.getElementsByClassName("pagetoc")[0].appendChild(link);
    }
  );
  updateFunction.call();
});

// Handle active elements on scroll
window.addEventListener("scroll", updateFunction);
