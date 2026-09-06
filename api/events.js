'use strict';

// Anonymous funnel counters for Vercel runtime logs. No form content or user IDs.
const EVENTS = new Set(['page_view', 'application_viewed', 'application_started', 'application_step', 'message_prepared', 'message_copied', 'application_received', 'application_save_failed', 'telegram_handoff', 'direct_chat', 'calculator_used', 'application_cta']);
const PAGES = new Set(['/', '/index.html', '/scout.html', '/model.html', '/payments.html', '/privacy.html', '/404.html']);
const ORIGINS = new Set(['https://www.scautdom.com', 'https://scautdom.com']);
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  if (!ORIGINS.has(req.headers.origin)) return res.status(403).end();
  if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return res.status(403).end();
  if (req.headers.dnt === '1' || req.headers['sec-gpc'] === '1') return res.status(204).end();
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).end();
  if (Number(req.headers['content-length'] || 0) > 1024) return res.status(413).end();
  let input;
  try { input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).end(); }
  if (!input || typeof input !== 'object' || Array.isArray(input) || JSON.stringify(input).length > 1024) return res.status(400).end();
  if (!EVENTS.has(input.event) || !PAGES.has(input.page) || !['site', 'scout', 'model'].includes(input.flow) || !Number.isInteger(input.step) || input.step < 0 || input.step > 3) return res.status(400).end();
  // Explicit projection: arbitrary keys, query strings and text are never logged.
  console.info(JSON.stringify({ type: 'scautdom_funnel', version: 1, event: input.event, page: input.page, flow: input.flow, step: input.step, at: new Date().toISOString() }));
  return res.status(204).end();
};
