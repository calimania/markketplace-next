import { ContentTypes } from "@/markket";
import { markketClient, _validImageRef } from "@/markket/api.markket";

type supported_kind = 'store' | 'page';

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
    'SEO.socialImage': {
      max_width: 1200
    }
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
      await markket.uploadImage(img, path, item.id, alt, `api::${kind}.${kind}` as _validImageRef);
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
};

export {
  ImageConfig,
  ImageActions
};

