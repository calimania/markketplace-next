# Markkët Client

## NextJS application compatible with Markkët API

Client for  Markkëtplace stores & managers

This client requires a Markket API, connects to our live version by default

The `STORE_SLUG` determines the store in the instance that manages subscriptions, & other ownership tasks

Allow for new stores to be created, and for store owners to login in a friendly interface to manage & preview their content

Easily publish new content, and allow your users to grow their online presence

### Manage storefronts

New & existing users can manage their accounts, and store content

### Multi user & stores

Individual store fronts can use static site templates to read all the data during build time [markketplace-astro](https://github.com/calimania/markketplace-astro)

This client combines server & browser isomorphic javascript to interact with our decentralized markket instances

Server operations are performed with keys generated secretly for broad operations

Users perform operations in the browser with their granted credentials

### Self hosting

Create an account in our instance, or deploy in your infrastructure for more control & customization

### Open source ecosystem

The markkët API is powered by Strapi, Postgres, Docker & Redis

This client uses typescript, react, tailwind, mantine, tabler & is open to community contributions

### NextJS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## ENV VARS

Use the following ENV Vars to connect to our live API. This applications adds extended functionality to our markket ecosystem, with new API routes & dashboards

```
MARKKET_URL=https://api.markket.place/
MARKKET_STORE_SLUG=next
NODE_ENV=development
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Debugging

Use `--legacy-peer-deps` to install if there are errors, react 19 is not fully supported, and swagger-ui-react causes some peer dependency issues

```
npm ci --legacy-peer-deps

# or

npm i --legacy-peer-deps

```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API

API routes live in the `app/api`

Add JSDoc comments in the correct format to generate documentation & perform sample requests, using Swagger

Markket Next extends the functionality from the Markket APIc

- [App router documentation](https://nextjs.org/docs/app)
- [API Docs (Autogenerated with Swagger)](http://de.markket.place/docs/api)
- [Strapi 5 rest API docs](https://docs.strapi.io/dev-docs/api/rest)
- [Markket API github](https://github.com/calimania/markketplace)

## UI

### Mantine

[Using Mantine with NextJS](https://mantine.dev/guides/next/)

### Tailwind

### React

### Tabler/icons-react

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
