export const attributeExternalLinks = () => {
  const article = document.getElementById('article');

  if (!article) {
    return;
  }

  for (const el of Array.from(article.querySelectorAll('a[href^="http://"], a[href^="https://"]'))) {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  }
};
