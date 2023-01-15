"use strict";const playground_text=(e,t=!0)=>t?e.querySelector("code").textContent:e.querySelector("code").innerText;(()=>{hljs.configure({tabReplace:"    ",languages:[]});var e=Array.from(document.querySelectorAll("code")).filter(e=>!e.parentElement.classList.contains("header"));e.forEach(e=>{hljs.highlightBlock(e)}),e.forEach(e=>{e.classList.add("hljs")}),window.playground_copyable&&Array.from(document.querySelectorAll("pre code")).forEach(t=>{t=t.parentNode;if(!t.classList.contains("playground")){let e=t.querySelector(".buttons");e||((e=document.createElement("div")).className="buttons",t.insertBefore(e,t.firstChild));t=document.createElement("button");t.className="fa-copy clip-button",t.title="Copy to clipboard",t.setAttribute("aria-label",t.title),t.innerHTML='<i class="tooltiptext"></i>',e.insertBefore(t,e.firstChild)}}),Array.from(document.querySelectorAll(".playground")).forEach(()=>{var e;window.playground_copyable&&((e=document.createElement("button")).className="fa-copy clip-button",e.innerHTML='<i class="tooltiptext"></i>',e.title="Copy to clipboard",e.setAttribute("aria-label",e.title),buttons.insertBefore(e,buttons.firstChild))})})(),(()=>{const o=document.querySelector("html"),t=document.getElementById("theme-toggle"),l=document.getElementById("theme-list"),n=document.querySelector('meta[name="theme-color"]'),a={highlight:document.querySelector("[href$='highlight.css']")},s=()=>{let e;try{e=localStorage.getItem("mdbook-theme")}catch(e){console.log("ERROR: get_theme#mdbook-theme")}return null===e||void 0===e?default_theme:e},r=(e,t=!0)=>{a.highlight.disabled=!1,setTimeout(()=>{n.content=getComputedStyle(document.body).backgroundColor},1);var r=s();if(t)try{localStorage.setItem("mdbook-theme",e)}catch(e){console.log("ERROR: set_theme#mdbook-theme")}o.classList.remove(r),o.classList.add(e),l.querySelectorAll(".theme-selected").forEach(e=>{e.classList.remove("theme-selected")}),l.querySelector("button#"+s()).classList.add("theme-selected")},i=()=>{l.style.display="none",t.setAttribute("aria-expanded",!1),t.focus()};r(s(),!1),t.addEventListener("click",()=>{"block"===l.style.display?i():(l.style.display="block",t.setAttribute("aria-expanded",!0),l.querySelector("button#"+s()).focus())}),l.addEventListener("click",e=>{let t;if("theme"===e.target.className)t=e.target.id;else{if("theme"!==e.target.parentElement.className)return;t=e.target.parentElement.id}r(t)}),l.addEventListener("focusout",e=>{!e.relatedTarget||t.contains(e.relatedTarget)||l.contains(e.relatedTarget)||i()}),document.addEventListener("click",e=>{"block"!==l.style.display||t.contains(e.target)||l.contains(e.target)||i()}),document.addEventListener("keydown",e=>{var t;e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||l.contains(e.target)&&("Escape"==e.key?(e.preventDefault(),i()):"ArrowUp"==e.key?(e.preventDefault(),(t=document.activeElement.parentElement)&&t.previousElementSibling&&t.previousElementSibling.querySelector("button").focus()):"ArrowDown"==e.key?(e.preventDefault(),(t=document.activeElement.parentElement)&&t.nextElementSibling&&t.nextElementSibling.querySelector("button").focus()):"Home"==e.key?(e.preventDefault(),l.querySelector("li:first-child button").focus()):"End"==e.key&&(e.preventDefault(),l.querySelector("li:last-child button").focus()))})})(),(()=>{const e=document.querySelector("html"),t=document.getElementById("sidebar"),r=document.querySelectorAll("#sidebar a"),o=document.getElementById("sidebar-toggle");let l=null;const n=e=>{e.currentTarget.parentElement.classList.toggle("expanded")},a=(Array.from(document.querySelectorAll("#sidebar a.toggle")).forEach(e=>{e.addEventListener("click",n)}),()=>{if(!e.classList.contains("sidebar-visible")){e.classList.remove("sidebar-hidden"),e.classList.add("sidebar-visible"),Array.from(r).forEach(e=>{e.setAttribute("tabIndex",0)}),o.setAttribute("aria-expanded",!0),t.setAttribute("aria-hidden",!1);try{localStorage.setItem("mdbook-sidebar","visible")}catch(e){console.log("ERROR: showSidebar")}}}),s=()=>{if(!e.classList.contains("sidebar-hidden")){e.classList.remove("sidebar-visible"),e.classList.add("sidebar-hidden"),Array.from(r).forEach(e=>{e.setAttribute("tabIndex",-1)}),o.setAttribute("aria-expanded",!1),t.setAttribute("aria-hidden",!0);try{localStorage.setItem("mdbook-sidebar","hidden")}catch(e){console.log("ERROR: hideSidebar")}}};o.addEventListener("click",()=>{(e.classList.contains("sidebar-hidden")?a:s)()});let i;window.addEventListener("resize",()=>{clearTimeout(i),i=setTimeout(()=>{1200<=window.innerWidth&&a()},500)}),document.addEventListener("touchstart",e=>{l={x:e.touches[0].clientX,time:Date.now()}},{passive:!0}),document.addEventListener("touchmove",e=>{var t;l&&(t=(e=e.touches[0].clientX)-l.x,Date.now()-l.time<250)&&150<=Math.abs(t)&&(0<=t?l.x<Math.min(.25*document.body.clientWidth,300)&&a():e<300&&s(),l=null)},{passive:!0});var c=document.getElementById("sidebar").querySelector(".active");c&&c.scrollIntoView({block:"center"}),window.innerWidth<750&&s()})(),document.addEventListener("keydown",e=>{if(!(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||window.search&&window.search.hasFocus()))switch(e.key){case"ArrowRight":e.preventDefault();var t=document.querySelector(".nav-chapters.next");t&&(window.location.href=t.href);break;case"ArrowLeft":e.preventDefault();t=document.querySelector(".nav-chapters.previous");t&&(window.location.href=t.href)}}),(()=>{const t=e=>{e.firstChild.innerText="",e.className="fa-copy clip-button"},r=(e,t)=>{e.firstChild.innerText=t,e.className="fa-copy tooltipped"};var e=new ClipboardJS(".clip-button",{text:e=>(t(e),playground_text(e.closest("pre"),!1))});Array.from(document.querySelectorAll(".clip-button")).forEach(e=>{e.addEventListener("mouseout",e=>{t(e.currentTarget)})}),e.on("success",e=>{e.clearSelection(),r(e.trigger,"Copied!")}),e.on("error",e=>{r(e.trigger,"Clipboard error!")})})(),document.querySelector(".menu-title").addEventListener("click",()=>{document.scrollingElement.scrollTo({top:0,behavior:"smooth"})}),(()=>{const l=document.getElementById("menu-bar");{var e=document.scrollingElement.scrollTop;const n=e;l.style.top=e+"px",l.classList.remove("sticky"),document.addEventListener("scroll",()=>{var e=Math.max(document.scrollingElement.scrollTop,0),t=l.style.top.slice(0,-2)-e;let r=null,o=!1;e>n?0<t&&(r=n):0<t?o=!0:t<(e=-l.clientHeight-50)&&(r=n+e),!0===o?l.classList.add("sticky"):l.classList.remove("sticky"),null!==r&&(l.style.top=r+"px")},{passive:!0})}l.classList.remove("bordered"),document.addEventListener("scroll",()=>{0===l.offsetTop?l.classList.remove("bordered"):l.classList.add("bordered")},{passive:!0})})();