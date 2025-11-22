interface DataLayerEventBase {
  event: string;
}

interface PageViewEvent extends DataLayerEventBase {
  event: 'page_view';
  page_path: string;
  page_title: string;
}

type DataLayerEvent = PageViewEvent;
