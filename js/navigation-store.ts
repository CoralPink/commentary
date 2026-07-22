export default (() => {
  let url = new URL(location.href);

  return {
    get current() {
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
