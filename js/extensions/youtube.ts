import { ELEMENT_YOUTUBE } from './element.ts';
import type { Disposer } from './types.ts';

import { ROOT_PATH } from '../constants.ts';

const API_URL = 'https://www.youtube.com/iframe_api';

type YouTubePlayer = {
  destroy(): void;
};

type YouTubePlayerOptions = {
  videoId: string;
  playerVars: {
    autoplay: 0;
    origin: string;
    playsinline: 0;
    rel: 0;
  };
  events: {
    onStateChange(event: { data: number }): void;
  };
};

type YouTubeApi = {
  PlayerState: {
    ENDED: number;
  };
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYER_VARS = {
  autoplay: 0,
  origin: location.origin,
  playsinline: 0,
  rel: 0,
} satisfies YouTubePlayerOptions['playerVars'];

let apiPromise: Promise<YouTubeApi> | undefined;

const loadYouTubeApi = (): Promise<YouTubeApi> => {
  if (window.YT?.Player !== undefined) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise !== undefined) {
    return apiPromise;
  }

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();

      if (window.YT?.Player === undefined) {
        reject(new Error('YouTube IFrame Player API failed to initialize'));
        return;
      }

      resolve(window.YT);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${API_URL}"]`);

    if (existingScript !== null) {
      existingScript.addEventListener('error', () => reject(new Error('Failed to load YouTube IFrame Player API')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = API_URL;
    script.async = true;
    script.onerror = () => {
      reject(new Error('Failed to load YouTube IFrame Player API'));
    };

    document.head.append(script);
  }).catch((error: unknown) => {
    apiPromise = undefined;
    throw error;
  });

  return apiPromise;
};

class YouTubeVideo extends HTMLElement {
  private player?: YouTubePlayer;
  private mountVersion = 0;

  private visibilityObserver: IntersectionObserver | undefined;

  constructor() {
    super();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('youtube.css', `${ROOT_PATH}css/`).href;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(link);
  }

  private createPlayer(): void {
    const id = this.dataset['id'];

    if (id === undefined) {
      console.warn('youtube id missing');
      return;
    }

    const mount = document.createElement('div');
    this.shadowRoot!.append(mount);

    const mountVersion = ++this.mountVersion;

    void loadYouTubeApi()
      .then(({ Player, PlayerState }) => {
        if (!this.isConnected || mountVersion !== this.mountVersion) {
          mount.remove();
          return;
        }

        this.player = new Player(mount, {
          videoId: id,
          playerVars: PLAYER_VARS,
          events: {
            onStateChange: ({ data }) => {
              if (data === PlayerState.ENDED) {
                this.dispatchEvent(new Event('ended'));
              }
            },
          },
        });
      })
      .catch((error: unknown) => {
        mount.remove();
        console.error('YouTube Player API initialization failed', error);
      });
  }

  connectedCallback(): void {
    this.visibilityObserver = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) {
          return;
        }

        this.visibilityObserver?.disconnect();
        this.visibilityObserver = undefined;

        this.createPlayer();
      },
      {
        threshold: 0.1,
      },
    );

    this.visibilityObserver.observe(this);
  }

  disconnectedCallback(): void {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;

    this.mountVersion += 1;
    this.player?.destroy();

    delete this.player;

    this.shadowRoot!.querySelector('div')?.remove();
  }
}

const registry = (name: string): void => {
  if (customElements.get(name) !== undefined) {
    return;
  }
  customElements.define(name, YouTubeVideo);
};

export const initialize = (_html: HTMLElement): Disposer => {
  registry(ELEMENT_YOUTUBE);

  return () => {}; // no-op dispose
};
