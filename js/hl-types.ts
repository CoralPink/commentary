export type Payload = {
  highlightCode: string;
  needNerdFonts: boolean;
};

export type WorkerResponse = {
  id: number;
  payload: Payload;
};

export type SendToWorker = (text: string, lang: string, callback: (payload: Payload) => void) => void;
