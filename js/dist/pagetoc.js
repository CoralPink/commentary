const cacheHeader=document.getElementsByClassName("header"),cachePagetoc=document.getElementsByClassName("pagetoc")[0].children,mobileMaxWidth=750,update=(Array.prototype.forEach.call(cacheHeader,e=>{var t=document.createElement("a");t.appendChild(document.createTextNode(e.text)),t.href=e.href,t.classList.add(e.parentElement.tagName),document.getElementsByClassName("pagetoc")[0].appendChild(t)}),()=>{const t=(()=>{let t;return Array.prototype.some.call(cacheHeader,e=>{if(!(window.pageYOffset>=e.offsetTop))return!0;t=e}),t})();t&&Array.prototype.forEach.call(cachePagetoc,e=>{0==e.href.localeCompare(t.href)?e.classList.add("active"):e.classList.remove("active")})}),scrollListenerControl=()=>{window.innerWidth<mobileMaxWidth?window.removeEventListener("scroll",update):(update(),window.addEventListener("scroll",update))};window.addEventListener("load",scrollListenerControl),window.addEventListener("resize",scrollListenerControl);