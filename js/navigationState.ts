export default (() => {
  let url = new URL(location.href);

  return {
    get url() {
      return url;
    },

    isSame(next: URL): boolean {
      return url.href === next.href;
    },

    commit(next: URL): void {
      url = next;
    },
  };
})();
