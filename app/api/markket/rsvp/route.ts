import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';

const STRAPI_URL = markketplace.api;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'newsletter@markket.place';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Markketplace';
const PUBLIC_URL = markketplace.markket_url;

function formatEventDate(value?: string, timeZone?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      ...(timeZone ? { timeZone } : {}),
    }).format(parsed);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  }
}

function formatEventTimeRange(start?: string, end?: string, timeZone?: string) {
  if (!start) return '';
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return '';
  const endDate = end ? new Date(end) : null;

  const base: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  };

  try {
    const startFormatted = new Intl.DateTimeFormat('en-US', base).format(startDate);
    if (!endDate || Number.isNaN(endDate.getTime())) return startFormatted;
    const endFormatted = new Intl.DateTimeFormat('en-US', base).format(endDate);
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    const startFormatted = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(startDate);
    if (!endDate || Number.isNaN(endDate.getTime())) return startFormatted;
    const endFormatted = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(endDate);
    return `${startFormatted} - ${endFormatted}`;
  }
}

async function sendConfirmationEmail({
  toEmail,
  toName,
  eventName,
  eventStartDate,
  eventEndDate,
  eventTimezone,
  storeName,
  storeSlug,
  eventSlug,
  rsvpDocumentId,
}: {
  toEmail: string;
  toName: string;
  eventName: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventTimezone?: string;
  storeName?: string;
  storeSlug?: string;
  eventSlug?: string;
  rsvpDocumentId?: string;
}) {
  if (!SENDGRID_API_KEY) return;

  const publicUrl = PUBLIC_URL;
  const eventLink = storeSlug && eventSlug
    ? `${publicUrl}/${storeSlug}/events/${eventSlug}`
    : publicUrl;
  const rsvpLink = rsvpDocumentId
    ? `${publicUrl}/rsvp?id=${rsvpDocumentId}`
    : `${publicUrl}/rsvp`;
  const formattedDate = formatEventDate(eventStartDate, eventTimezone);
  const formattedTimeRange = formatEventTimeRange(eventStartDate, eventEndDate, eventTimezone);
  const scheduleLine = [formattedDate, formattedTimeRange, eventTimezone].filter(Boolean).join(' · ');

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="color: #E4007C; margin-bottom: 8px;">You're in! 🎉</h2>
      <p style="color: #424242; font-size: 16px; line-height: 1.6;">
        Hi ${toName}, your RSVP for <strong>${eventName}</strong>${storeName ? ` by <strong>${storeName}</strong>` : ''} has been confirmed.
      </p>
      ${scheduleLine ? `<p style="color: #424242; font-size: 14px; margin-top: 8px;">${scheduleLine}</p>` : ''}
      <div style="margin: 24px 0; display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${eventLink}" style="background: #E4007C; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; margin-right: 12px;">
          View Event Details
        </a>
        <a href="${rsvpLink}" style="background: #fff; color: #E4007C; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; border: 2px solid #E4007C;">
          View RSVP details
        </a>
      </div>
      <p style="color: #9E9E9E; font-size: 13px;">See you there!</p>
    </div>
  `;

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail, name: toName }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `You're confirmed: ${eventName}`,
      content: [{ type: 'text/html', value: html }],
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      eventId,
      eventName,
      eventStartDate,
      eventEndDate,
      eventTimezone,
      storeName,
      storeSlug,
      eventSlug,
      storeDocumentId,
    } = await request.json();

    if (!name || !email || !eventId) {
      return NextResponse.json(
        { error: 'name, email and eventId are required' },
        { status: 400 },
      );
    }

    const strapiUrl = new URL('api/rsvps', STRAPI_URL);
    console.log(`[rsvp/post] -> POST ${strapiUrl.toString()} email:${email} event:${eventId}`);

    const strapiResponse = await fetch(strapiUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          name,
          email,
          event: { documentId: eventId },
          ...(storeDocumentId ? { store: { documentId: storeDocumentId } } : {}),
        },
      }),
    });

    if (!strapiResponse.ok) {
      const body = await strapiResponse.text();
      console.error(`[rsvp/post] Strapi error ${strapiResponse.status}:`, body);
      return NextResponse.json({ error: 'Could not save RSVP' }, { status: 502 });
    }

    const saved = await strapiResponse.json();
    const rsvpDocumentId: string | undefined = saved?.data?.documentId;
    console.log(`[rsvp/post] saved rsvp:${rsvpDocumentId} for event:${eventId}`);

    // Fire-and-forget — don't fail the response if email fails
    sendConfirmationEmail({
      toEmail: email,
      toName: name,
      eventName: eventName || 'the event',
      eventStartDate,
      eventEndDate,
      eventTimezone,
      storeName,
      storeSlug,
      eventSlug,
      rsvpDocumentId,
    }).catch((err) => console.error('[rsvp] email send failed', err));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[rsvp] route error', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
