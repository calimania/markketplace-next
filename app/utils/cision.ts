import { markketConfig } from "@/markket/config";

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
};

/**
 * Connects to the CISION API to exchange credentials for a token
 */
 async function Auth() {
  const [user, password] = markketConfig.cision?.split(':');
  console.info(`CISION:Token:${user}`);

  if (!user || !password) {
    return null;
  }

  const url = new URL(`/api/v1.0/auth/login`, server);
  console.log({url})
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

  const json =  await response.json();

  const token = json.auth_token;
  console.log({token});
  cache.token = token;

  return token;
};

/**
 * // Release language. Example: language=en|fr -> find releases where language=en or language=fr. Case insensitive. Values: en|fr|fi|de|it|es|ru|no|pt|nl|pl|cs|id|sv|hi|gu|ms|ta|zhs|zht|ja|da|sk|th|ko|vi
 * // keyword
 */
async function get() {
  const [user, ] = markketConfig.cision?.split(':');
  console.info(`CISION:News:${!!cache.news}`);

  if (cache.news) return cache.news;

  const token = cache.token || await Auth();

  if (!token) {
    return null;
  }

  console.log({token});

  const response = await fetch( new URL(`/api/v1.0/releases`, server), {
    method: 'GET',
    headers: {
      'X-Client': user,
      Authorization: `Bearer ${token}`,
    },
  })

  console.log(`CISION:News:${response.ok}:${response.status}`)

  const json = await response.json();

  console.log({json})

  cache.news = json;

  return json;
}

const News = {
  get,
}

export default News;
