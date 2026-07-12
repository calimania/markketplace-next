# Features

## Upcoming

## 2026

- [ ] tweaks to headers and design, layout
- [ ] markket: newsletter sendgrid sync (add, remove)
- [ ] buyer order_id status page
- [ ] order receipt email, store parameter
- [ ] tienda/me: combined stores inbox
- [ ] tienda: display product orders next to product preview page

## July 2026

- [ ] tienda dashboard: adding/editing Product prices works end-to-end (draft -> save -> list -> detail)
- [ ] tienda dashboard: validate forms for price/date fields and show clear error states
- [ ] tienda: item form, display error when save create (store.slug)
- [ ] auth: magic form & verify better errors
- [ ] edit order status [crm dashboard]
- [ ] tienda: stripe: connect features
- [ ] tienda: start stripe connect flow
- [ ] tienda: display basic stripe dashboard

### v0.4.20

- [x] Tienda: preview and edit prices in Product & Event
- [x] Storefront: display prices, click to buy
- [x] markket: price|product settings, digital, ships_to
- [x] tienda: me: inbox from all stores

### v.0.3.3

- [x] Add team button to Tienda home overview, not buried inside edit
- [x] tweak /me and /tienda endppoints
- [x] Fix event|product format missmatch
- [x] Improve editor UX for mobile: better dynamic rich text editing
- [x] Improve TipTap rich text toolbar/help for bold/links without annoying switching
- [x] display correct image sizes in homepage, currently pixelated
- [x] display correct fallback images, when some are not present
- [x] Improve image upload modal and empty preview upload flows
- [x] Support click-to-upload in empty preview areas
- [x] Support drag-and-drop friendly image drop in desktop, as people expect it
- [x] Avoid mobile wording like "drag and drop"; use less desktop-centric copy
- [x] Add CRM inbox UI in the CRM section and fix navigation buttons
- [x] Add dedicated inbox screen after the core Tienda UX and editor improvements
- [x] reply to email uses markket api
- [x] picsum placeholder grayscale images
- [x] revision to /storefront and /tienda pages

### v0.9.0 May 2026

- [x] content QA: drafts are visible in dashboard lists and can open individual item screens reliably
- [x] tienda dashboard: adding/editing Event dates works end-to-end (draft -> save -> list -> detail)
- [x] tienda dashboard: add/edit `event.timezone` (IANA) and ensure emails/rendering use event timezone instead of server timezone
- [x] buyer side: improve checkout UX (totals, loading states, validation, success/receipt transitions)
- [x] owner dashboard CRM integration (JWT): wire preview/dashboard data to `/api/crm/subscribers?storeRef=<slug>`, `/api/crm/newsletters?storeRef=<slug>`, `/api/crm/orders?storeRef=<slug>`, `/api/crm/customers?storeRef=<slug>` (unified per-email record merging orders + RSVPs + subscriber status)
- [x] owner dashboard actions (JWT): wire `/api/crm/subscribers/:documentId/sync`, `/api/crm/newsletters/:documentId/send`, and `/api/crm/stripe/connect`
- [x] event preview RSVPs (JWT): ensure `/api/tienda/stores/:ref/events/:eventId/rsvps` renders records and `/api/tienda/stores/:ref/events/:eventId/rsvps/sync` only runs when sync metadata exists
- [x] tienda dashboard: verify date/timezone display consistency in list and detail pages
- [x] links not working in tiptapp - articles
- [x] fail error in CMS still says success
- [x] item.edit form meta title fix, include store.title
- [x] item.edit form meta description suggestion
- [x] store settings dashboard modify some
- [x] markket-next changes store_slug under url?
- [x] confirm email during verify if it wasn't already
- [x] image upload in tiptap editor
- [x] tiptap error with urls
- [x] tiptap editor, prevent ctrl+s (PUT draft or save to local storage)
- [x] tiptap editor, drafts in local storage
- [x] tiptap editor preserve content on REST error
- [x] magic user code, invite collaborator to store
- [x] magic code for buyers - token with no user
- [x] rearrange slides in image.manager
- [x] publish / unpublish CMS items
- [x] when magic link login, swap confirmed to true
- [x] image.modal canvas generation images with text
- [x] better image modal unsplash (open libraries) integration
- [x] crm.orders endpoint
- [x] bootstrap initial content (startup|landing_page|community|magazine|store|crowdfund)
- [x] add DATEs to event, forms
- [x] pagination and additional results
- [x] new onboarding: create 1st store & info
- [x] use SEO endpoints to generate, skip asking
- [x] pexels search in image modal
- [x] adding dates to event
- [x] remove or hide an item[product,page,blog,] (unpublish, deactivate)
- [x] store bootstrap content : after create, (pages, blog, products)
- [x] prettier newsletter page
- [x] display orders in dashboard
- [x] display subscribers in dashboard

## April

- [x] homepage design revision
- [x] save store basics, via proxy
- [x] embed mode to load on webview
- [x] new storefront design
- [x] new homepage design
- [x] new rich text utilities
- [x] Security upgrade nextjs
- [x] Fixed rules with markket?proxie
- [x] New design systems
- [x] Mantine v9
- [x] New profile auth path /me
- [x] New store dashboard homepage /tienda
- [x] New store preview page /tienda/storeSlug
- [x] New article|page|event|product list
- [x] New article|page|event|product individual page
- [x] New edit profile, avatar page
- [x] Design implementation review

## 2025

### December

- [x] critical react vulnerabilities [next@16.0.10]
- [x] disable price option when inventory is 0
- [x] remove edit price in edit view, and disclaimer in create
- [x] considers product.extras extensions
- [x] ignore hidden price[]
- [x] ignore sold out price[]
- [x] edit additional price attributes
- [x] nextjs 16
- [x] new homepage design

### November

- [x] remove nextjs favicon
- [x] <title> in products and store sections
- [x] meta in store sections
- [x] not showing page list in /about
- [x] use new store.dashboard endpoints
- [x] /blog/about/products/events needs to be more consistent
- [x] display events in /store/slug/events
- [x] event details & RSVP in /store/slug/events/id

### September

- [x] created components folder
- [x] edit Stripe Product name with API in update
- [x] edit Stripe product picture on save
- [x] product.PRICES editor
- [x] code verification fixes
- [x] when saving Product, get usd_price of PRICES

### August

- [x] review store[content] create limit server side
- [x] fix SSR:SEO in routes under /store
- [x] Seo.title generate input description and store name title
- [x] temp disable image modal in tiptop editor
- [x] move PRICE editing to item.view
- [x] disable checkout if not prices
- [x] review automatic price creation amount (cents) (stripe sync)
- [x] fancy paintings art store template
- [x] bugs with tiptap content editing, deleting content
- [x] tiptap bug preventing typing
- [x] markdown editor
- [x] explain test purchase, /portal - carlos
- [x] display blogs in farmday
- [x] display blog in farmday
- [x] farmday-astro SEO
- [x] farmday receipt email points to correct url
- [x] farmday-astro render Page
- [x] astro (namaku|farmday) magic link dashboard
- [x] farmday disable /portal without user
- [x] farmday display orders in portal
- [x] farmday display some other page in portal
- [x] farmday template dashboard
- [x] fetch orders for buyer [proxy jwt]
- [x] farmday /product pages
- [x] slug should contain dots?
- [x] farmday-astro needs to call api.farmday.io
- [x] farmday login data
- [x] magic link normalize lowercase email trim
- [x] store_settings customize emails
- [x] run in domain farmday (api)
- [x] run farmday in extensioin route
- [x] review store create limits restrictions
- [x] api.farmday.io
- [x] store.configuration object schema
- [x] deploy markket.farmday.io
- [x] email notify store.user[] when order
- [x] markket api sync with stripe
- [x] load URL into canvas in image modal
- [x] dynamic action view waiting screen
- [x] max stores per user (article, page, album, product, )
- [x] markket api creates prices and product ids
- [x] page[slug=receipt] in receipt page, better design, find by order_id
- [x] creating stripe.product _id in dashboard
- [x] creating stripe.price_id [] in dashboard
- [x] multiple image upload & delete (use ids to sort / delete)
- [x] add SKU to product (markket-next)
- [x] add ids to prices (markket-next)
- [x] create Orders when payment.link
- [x] redirect to receipt - currently charging $0.33 + 3.3% of the transaction, with a maximum of $99.9
- [x] update order when stripe.checkout complete
- [x] display order in dashboard, pagination
- [x] upload multiple images (delete at index)
- [x] editing overrides images
- [x] individual image upload for every content type
- [x] error after creating store and old data
- [x] uplod SEO image
- [x] upload cover to article
- [x] upload thumbnail to product
- [x] upload logo to store
- [x] upload cover for store
- [x] fetch stores after login
- [x] passwordless login plugin
- [x] passwordless login & register in client
- [x] Better dashboard layout
- [x] Better dashboard nav menu
- [x] Test neobrutalism components
- [x] Better onboarding steps in dashboard
- [x] Upload image modal
- [x] Better display blog list
