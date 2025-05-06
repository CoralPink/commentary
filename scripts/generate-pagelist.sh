sed \
  -e 's|<ol class="section">|<ol>|g' \
  -e 's|<li class="chapter-item expanded ">|<li>|g' \
  -e 's| target="_parent"||g' \
  toc.html > pagelist.html
