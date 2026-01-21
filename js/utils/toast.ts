const VARIANTS = ['log', 'info', 'warn', 'error'] as const;

type ToastVariant = (typeof VARIANTS)[number];

type ToastAction = (message: string, options?: ToastOptions) => void;
type ToastOptions = {
  duration?: number;
};

type ToastAPI = {
  bake: (message: string, variant: ToastVariant, options?: ToastOptions) => void;
} & {
  [K in ToastVariant]: ToastAction;
};

export default ((): ToastAPI => {
  const api = {
    container: null as HTMLDivElement | null,
    DURATION_DEFAULT: 4000,

    bootstrap(): void {
      if (this.container) {
        return;
      }
      const div = document.createElement('div');
      div.classList.add('toast-container');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-atomic', 'true');

      document.body.appendChild(div);
      this.container = div;
    },

    bake(message: string, variant: ToastVariant, options: ToastOptions = {}): void {
      const { duration = this.DURATION_DEFAULT } = options;
      this.bootstrap();

      const el = document.createElement('div');
      el.classList.add('toast', `toast-${variant}`);
      el.textContent = message;

      console.log(message);

      this.container!.appendChild(el);

      requestAnimationFrame((): void => {
        el.classList.add('bake');

        setTimeout(() => {
          el.classList.remove('bake');
          el.remove();
        }, duration);
      });
    },

    make(variant: ToastVariant): ToastAction {
      return (message: string, options?: ToastOptions): void => {
        this.bake(message, variant, options);
      };
    },
  };

  return Object.assign({ bake: api.bake.bind(api) }, Object.fromEntries(VARIANTS.map(v => [v, api.make(v)])));
})();
