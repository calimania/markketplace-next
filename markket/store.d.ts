export interface Store {
  id: number;
  attributes: {
    title: string;
    Description: string;
    slug: string;
    Logo: {
      data: {
        attributes: {
          url: string;
          width: number;
          height: number;
        };
      };
    };
    SEO: {
      title: string;
      description: string;
      socialImage?: {
        data: {
          attributes: {
            url: string;
          };
        };
      };
    };
  };
};
