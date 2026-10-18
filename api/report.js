// "Report a bug" form: POST /api/report  { kind, message, email?, website (honeypot), context }  ->  { ok: true }
// Sends one email through Resend (https://resend.com). Vercel environment variables:
//   RESEND_API_KEY   your Resend API key
//   REPORT_TO        where reports go (your email address). Kept here, not in the code.
//   REPORT_FROM      optional, default "ChecklistPro <onboarding@resend.dev>" (Resend's test sender only delivers to the email
//                    address the Resend account was created with; use a verified domain to send anywhere)
// At most 5 reports per IP per day (memory counter: approximate across servers, fine for a contact form).
'use strict';

const LIMIT = 5, WINDOW_MS = 24 * 60 * 60 * 1000, MAX_MESSAGE = 2000, KINDS = ['Bug', 'Idea', 'Other'];
const seen = new Map();

function clientIp(req) {
  const h = req.headers || {}, first = v => (typeof v === 'string' ? v.split(',')[0].trim() : '');
  return first(h['x-vercel-forwarded-for']) || first(h['x-real-ip']) || first(h['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || 'unknown';
}
function allow(ip) {
  const now = Date.now(); let e = seen.get(ip);
  if (!e || e.reset < now) { e = { n: 0, reset: now + WINDOW_MS }; seen.set(ip, e); }
  e.n += 1;
  if (seen.size > 2000) for (const [k, v] of seen) if (v.reset < now) seen.delete(k);
  return e.n <= LIMIT;
}
const clean = (t, max) => String(t == null ? '' : t).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
const oneLine = (t, max) => clean(t, max).replace(/\s+/g, ' ');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const send = (code, body) => res.status(code).json(body);
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'method' }); }
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return send(400, { error: 'bad_request' });
  if (b.website) return send(200, { ok: true }); // honeypot: pretend it worked
  const message = clean(b.message, MAX_MESSAGE);
  if (message.length < 5) return send(400, { error: 'too_short' });
  const email = oneLine(b.email, 200), emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (email && !emailOk) return send(400, { error: 'bad_email' });
  const key = process.env.RESEND_API_KEY, to = process.env.REPORT_TO;
  if (!key || !to) return send(503, { error: 'not_configured' });
  if (!allow(clientIp(req))) return send(429, { error: 'limit' });

  const kind = KINDS.includes(b.kind) ? b.kind : 'Bug', ctx = b.context && typeof b.context === 'object' ? b.context : {};
  const text = [message, '', '--', 'Kind: ' + kind, 'From: ' + (emailOk ? email : '(no email given)'),
    'Page: ' + oneLine(ctx.page, 200), 'Screen: ' + oneLine(ctx.screen, 30) + ' @' + oneLine(ctx.dpr, 6) + 'x', 'Language: ' + oneLine(ctx.lang, 20), 'Browser: ' + oneLine(ctx.ua, 300)].join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.REPORT_FROM || 'ChecklistPro <onboarding@resend.dev>', to: [to], ...(emailOk ? { reply_to: email } : {}), subject: '[ChecklistPro] ' + kind + ': ' + oneLine(message, 60), text }),
    });
    if (!r.ok) return send(502, { error: 'upstream' });
    return send(200, { ok: true });
  } catch (e) { return send(502, { error: 'upstream' }); }
};
