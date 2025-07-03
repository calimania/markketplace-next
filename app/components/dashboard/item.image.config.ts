import { ContentTypes } from "@/markket";
import { markketClient, _validImageRef } from "@/markket/api.markket";

type supported_kind = 'store' | 'page' | 'article' | 'product' | 'event' | 'album' | 'track';

const seo = {
  'SEO.socialImage': {
    max_width: 1200
  }
}

const ImageConfig: Record<supported_kind, Record<string, { multi?: boolean, max_width?: number }>> = {
  store: {
    Logo: {
      max_width: 1200,
    },
    // Slides: { multi: true , max_width: 1600, },
    Favicon: { max_width: 120 },
    'SEO.socialImage': {
      max_width: 1200,
    },
    Cover: {
      max_width: 1280,
    },
  },
  page: {
    ...seo,
  },
  article: {
    ...seo,
    cover: { max_width: 1200 }
  },
  product: {
    ...seo,
    //Slides,
    Thumbnail: { max_width: 840 }
  },
  event: {
    ...seo,
    //Slides,
    Thumbnail: { max_width: 840 }
  },
  album: {
    ...seo,
    cover: { max_width: 1200 }
  },
  track: {
    // media,
    ...seo,
  }
};


const upload = (item: ContentTypes, kind: supported_kind) => {
  const markket = new markketClient();

  return async (path: string, img: File, alt: string, multiIndex?: number) => {
    console.log(`uploading:${kind}:${path}:index-${multiIndex}`);

    if (path == 'SEO.socialImage' && item?.SEO?.id) {
      await markket.uploadImage(img, 'socialImage', item.SEO?.id, alt, `common.seo` as _validImageRef);
      return;
    }

    if (item.id) {
      const ref = ((kind == 'track') ? 'api::album.track' : `api::${kind}.${kind}`) as _validImageRef;
      await markket.uploadImage(img, path, item.id, alt, ref);
      return;
    }
  }
}

// Fix actions type and add onToggleMode prop to ImageModal
const ImageActions: Record<string, (documentId: string) => { upload: (path: string, img: any, alt: string, multiIndex?: number) => Promise<void> }> = {
  store: (item) => {
    return ({
      upload: upload(item, 'store'),
    })
  },
  page: (item) => {
    return ({
      upload: upload(item, 'page'),
    })
  },
  article: (item) => {
    return ({
      upload: upload(item, 'article'),
    })
  },
  product: (item) => {
    return ({
      upload: upload(item, 'product'),
    })
  },
  event: (item) => {
    return ({
      upload: upload(item, 'event'),
    })
  },
  album: (item) => {
    return ({
      upload: upload(item, 'album'),
    })
  },
  track: (item) => {
    return ({
      upload: upload(item, 'track'),
    })
  }
};

export {
  ImageConfig,
  ImageActions
};

