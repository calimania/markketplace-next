const ImageConfig: Record<'store', Record<string, { multi?: boolean, max_width?: number }>>  = {
  store: {
    Logo: {
      max_width: 1200,
    },
    Slides: { multi: true , max_width: 1600, },
    Favicon: { max_width: 120 },
    // 'SEO.socialImage': {
    //   max_width: 1200,
    // },
    Cover: {
      max_width: 1280,
    },
  }
};

export {
  ImageConfig
};
