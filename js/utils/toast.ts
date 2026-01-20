const VARIANTS = ['info', 'warning'] as const;

type ToastVariant = (typeof VARIANTS)[number];

type ToastOptions = {
  duration?: number;
};

type ToastAPI = {
  bake: (message: string, variant: ToastVariant, options?: ToastOptions) => void;
} & {
  [K in ToastVariant]: (message: string, options?: ToastOptions) => void;
};

export const toast: ToastAPI = (() => {
  const api = {
    container: null as HTMLDivElement | null,
    DURATION_DEFAULT: 4000,

    bootstrap() {
      if (this.container) {
        return;
      }
      const div = document.createElement('div');
      div.className = 'toast-container';
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-atomic', 'true');

      document.body.appendChild(div);
      this.container = div;
    },

    bake(message: string, variant: ToastVariant, options: ToastOptions = {}) {
      const { duration = this.DURATION_DEFAULT } = options;
      this.bootstrap();

      const el = document.createElement('div');
      el.className = `toast toast-${variant}`;
      el.textContent = message;

      console.info(message);

      this.container!.appendChild(el);

      requestAnimationFrame(() => {
        el.classList.add('bake');

        setTimeout(() => {
          el.classList.remove('bake');
          el.remove();
        }, duration);
      });
    },

    make(variant: ToastVariant) {
      return (message: string, options?: ToastOptions) => {
        this.bake(message, variant, options);
      };
    },
  };

  const result: Partial<ToastAPI> = { bake: api.bake.bind(api) };

  for (const v of VARIANTS) {
    result[v] = api.make(v);
  }

  return result as ToastAPI;
})();
