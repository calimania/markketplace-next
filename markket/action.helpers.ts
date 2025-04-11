import { Page, Article, Product, Event, Album, AlbumTrack , Tag } from '@/markket';
import { markketClient } from '@/markket/api';
import { JSONDocToBlocks } from '@/markket/helpers.blocks';
import { getTagColorName } from '@/markket/tag.helpers';

type Values = Page | Article | Product | Event | Album | AlbumTrack;

export type contentTypes = 'page' | 'article' | 'product' | 'event' | 'album' | 'track';

const client = new markketClient();


// Are different to the cms.route.helpers
// This occur client side, and can later require user input
// Additionally these are particular to this client, API must remain agnostic
// Basic cleanup to ensure the client formats data as expected by the API
const transformBody = (values: Values, contentType: contentTypes) => {

  let body = values;


  if (['page', 'article'].includes(contentType)) {
    body = body as Page;
    body.Content = JSONDocToBlocks(body.Content);
  }

  if (['album', 'track'].includes(contentType)) {
    return {
      ...body,
      content: JSONDocToBlocks((body as Album).content),
    } as Album;
  }

  if (['article'].includes(contentType)) {
    body = body as Article;
    body.Tags = body?.Tags?.map((t) => ({
      Label: t.Label,
      Color: getTagColorName(t.Color as string)
    } as Tag )) || [];
  }

  return body;
}

export const createContentAction = (contentType: contentTypes) =>
  async (values: Values, storeId?: string | number) => {
    const body = transformBody(values, contentType);

    return await client.post(`/api/markket/cms?contentType=${contentType}&storeId=${storeId}`, {
      body: {
        [contentType]: body,
      },
    });
  };

export const updateContentAction = (contentType: contentTypes) =>
  async (values: Values, id: string, storeId?: string | number) => {
    const body = transformBody(values, contentType);

    return await client.put(`/api/markket/cms?contentType=${contentType}&storeId=${storeId}&id=${id}`, {
      body: {
        [contentType]: body,
      },
    });
  };
