Tienda TODO

- [x] Add team button to Tienda home overview, not buried inside edit
- [x] tweak /me and /tienda endppoints
- [x] Fix event|product format missmatch
- [x] Improve editor UX for mobile: better dynamic rich text editing
- [x] Improve TipTap rich text toolbar/help for bold/links without annoying switching
- [ ] display correct image sizes in homepage, currently pixelated
- [ ] display correct fallback images, when some are not present
- [ ] Improve image upload modal and empty preview upload flows
- [ ] Support click-to-upload in empty preview areas
- [ ] Avoid mobile wording like "drag and drop"; use less desktop-centric copy
- [ ] Add CRM inbox UI in the CRM section and fix navigation buttons
- [ ] Consider always reading `/api/inbox` and showing notifications on load
- [ ] Add edit/visibility state so we can show edit button when the user can edit
- [ ] Keep this TODO updated as we iterate

Long-term / follow-up

- [ ] Add dedicated inbox screen after the core Tienda UX and editor improvements
- [ ] Build drag-and-drop friendly image previews for desktop editing

Inbox API contract (updated)

1. List conversations

- Endpoint: GET /api/inbox
- Requires JWT.
- Requires store context. At least one must be sent:
  - store (slug), or
  - storeId (documentId)
- If both are missing: 400 Bad Request.

Supported filters:

- q or search: search by subject, store, threadKey, body, and email
- direction: incoming | outgoing
- : new | read | draft | sent | etc.
- archived: true | false
- read: true | false
- threadKey: exact match
- includeMessages: true | false (default true)
- page (default 1)
- pageSize or limit (default 20, max 100)
- sortBy: latestMessageAt | subject | store | direction | status | Estado
- sortOrder: asc | desc (default desc)

Example:

- GET /api/inbox?store=my-store&q=refund&archived=false&page=1&pageSize=25&sortBy=latestMessageAt&sortOrder=desc

2. Send or save outbound

- Endpoint: POST /api/inbox/outbound
- Requires JWT.

Behavior by payload:

- published false or draft true or status draft:
  - saves draft
  - does not send via SendGrid
  - does not publish in Strapi
- published true (or omitted):
  - sends via SendGrid
  - stores outbound record
  - publishes record
- If store cannot be resolved by routing key: request is rejected.

Draft example payload:

{
  "to": "client@example.com",
  "subject": "Draft message",
  "text": "Work in progress",
  "published": false
}

Send + publish example payload:

{
  "to": "client@example.com",
  "subject": "Ready",
  "text": "Final message",
  "published": true
}

3. Inbound webhook

- Endpoint: POST /api/inbox/inbound
- Public endpoint (with secret if configured).
- Inbound with resolved store:
  - created and auto-published
- Inbound without resolved store (dangling):
  - may be stored as draft for review

Frontend implementation notes (for CRM Inbox phase)

1. Always pass store or storeId when calling GET /api/inbox.
2. Default to includeMessages=false on list views if payload size becomes heavy.
3. Treat drafts and sent as outbound states in UI badges.
4. Show dangling inbound as review-needed if surfaced in admin tooling.


