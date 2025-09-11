import { markketplace } from "@/markket/config";
import qs from 'qs';
import { format, parseISO } from 'date-fns';

const server = 'https://contentapi.cision.com/';

const cache = {
  token: '',
  news: null,
};

export type Release = {
  company: string[];
  title: string;
  date: string;
  release_id: string;
  status: string;
  url: string;
  body: string;
  multimedia?: {
    caption: string;
    seq: string;
    thumbnailurl: string;
    type: string;
    url: string;
  }[];
  geography: string[];
  industry: string[];
  language: string;
  source_company: string;
  style: string;
  sub_title: string[];
  subject: string[];
  ticker: string[];
  websiteUrl: string[];
};

export const formatReleaseDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'PPP');
  } catch (e) {
    console.error(e);
    return dateStr;
  }
};

/**
 * Connects to the CISION API to exchange credentials for a token
 */
async function Auth() {
  const [user, password] = markketplace.cision?.split(':');
  console.info(`CISION:Token:${user}`);

  if (!user || !password) {
    return null;
  }

  const url = new URL(`/api/v1.0/auth/login`, server);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Client': user,
    },
    body: JSON.stringify({
      login: user,
      pwd: password,
    })
  });

  if (!response.ok) {
    console.error(`CISION:Token:${user}:${response.ok}:${response.status}`);
    return null;
  }

  const json = await response.json();

  const token = json.auth_token;
  console.log({ token: !!token });
  cache.token = token;

  return token;
};

type GET = {
  keyword_or?: string;
}

/**
 * // Release language. Example: language=en|fr -> find releases where language=en or language=fr. Case insensitive. Values: en|fr|fi|de|it|es|ru|no|pt|nl|pl|cs|id|sv|hi|gu|ms|ta|zhs|zht|ja|da|sk|th|ko|vi
 * // keyword keyword All keywords must be present in result. Multiple keywords are separated by space
 * // keyword_not All keywords must not be present in result
 * // keyword_or At least one of keywords must be present in result
 * // keyword_fields Release fields that are searched for given keyword or phrase. If not provided default is: title|sub_titlebody|contact. Possible keyword fields: title, sub_title, body, contact, company. Example: keyword_fields=title|company -> search for keyword in title or company
 * // phrase All phrase words must be present in search result in same order. Multiple phrases are separated by '|' : phrase=phrase1|phrase
 * // phrase_not
 * // phrase_or
 * // from - pagination  Defines the offset from the first result you want to fetch. Default 'from=0'
 * // size - page size
 * // fields - Release fields returned in response. Available fields: title, summary, date, release_id, company, feed, industry, subject, geography, ticker, language, dateline, multimedia. Default: title|date|release_id|company.
 */
async function get({ keyword_or }: GET) {
  const [user,] = markketplace.cision?.split(':');
  console.info(`CISION:News:${!!cache.news}`);

  if (cache.news) return cache.news;

  const token = cache.token || await Auth();

  if (!token) {
    return null;
  }

  const response = await fetch(new URL(`/api/v1.0/releases?${qs.stringify({
    show_del: false,
    mod_startdate: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss-0000"),
    language: 'en|es',
    keyword_or,
    fields: 'title|body|date|release_id|company|multimedia',
    size: 50,
  })}`, server), {
    method: 'GET',
    headers: {
      'X-Client': user,
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`CISION:News:${response.ok}:${response.status}`)

  const json = await response.json();

  cache.news = json;
  return json;
}

async function get_by_id(release_id: string) {
  const [user,] = markketplace.cision?.split(':');
// console.info(`CISION:News:${!!cache.news}`);
// if (cache.news) return cache.news;

  const token = cache.token || await Auth();
  if (!token) {
    return null;
  }
  const response = await fetch(new URL(`/api/v1.0/releases/${release_id}`, server), {
    method: 'GET',
    headers: {
      'X-Client': user,
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 100 },
  });

  console.log(`CISION:News:id:${release_id}:${response.ok}:${response.status}`)
  const json = await response.json();
  return json;
}


async function get_codes(code: 'industry' | 'subject' | 'geography' | 'exhange' | 'language') {
  const [user,] = markketplace.cision?.split(':');

  const token = cache.token || await Auth();
  if (!token) {
    return null;
  }
  const response = await fetch(new URL(`/api/v1.0/codes/${code}`, server), {
    method: 'GET',
    headers: {
      'X-Client': user,
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 100 },
  });

  console.log(`CISION:codes:${code}:${response.ok}:${response.status}`)
  const json = await response.json();
  return json;
}

const News = {
  get,
  get_by_id,
  get_codes,
}

export default News;
