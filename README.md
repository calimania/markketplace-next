# Markkët Client

## NextJS application compatible with Markkët API

Front end client for a Markkëtplace stores & managers

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

### Static Pages (GitHub Pages)
The following pages are pre-rendered at build time:
- Home page
- About page
- Documentation
- Landing pages

### Dynamic Pages (Digital Ocean)
The following pages are server-rendered:
- Products listing & details
- Store management
- User account

### NextJS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

Opens by default in port `4020`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
