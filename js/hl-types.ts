type SuccessPayload = { highlightCode: string; needNerdFonts: boolean };
type ErrorPayload = { error: string };

export type Payload = SuccessPayload | ErrorPayload;

export const isErrorPayload = (payload: Payload): payload is ErrorPayload => {
  return 'error' in payload;
}

export type WorkerResponse = {
  id: string;
  payload: Payload;
};

export type SendToWorker = (text: string, lang: string, callback: (payload: Payload) => void) => void;
