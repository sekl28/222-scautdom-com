# SCAUTDOM

Russian scout-first programme at https://www.scautdom.com/. The model page remains a reference for scouts, with a separate voluntary adult self-application below the conditions.

## Source and publication

Generate public HTML with `python scripts/build-pages.py`. Shared form markup is in `scripts/application.py`, browser behaviour in `assets/site.js`, pure message/validation logic in `assets/lead-core.js`. No npm dependencies are required for the public static frontend or the Vercel Node function. `python scripts/build-preview.py` mirrors public assets to `dist` for the existing Sites publication. Preserve `.openai/hosting.json` identity. The Vercel-only `api/events.js` is not part of the static Sites mirror.

The current ink/chartreuse/off-white design, illustrations and self-hosted Onest font are retained. `assets/og.png` is a typographic social preview, not a case study or proof. No testimonials, cases, staff claims or evidence blocks have been added. Preserve font licensing in `assets/Onest-OFL.txt`.

## Entry and reading

The full programme remains in order: scout role, model conditions, workflow, rewards, questions, application. Header, hero and chapter links let informed readers enter the same application earlier. Essential adult format, model hours, basic share and payment conditions stay visible. Model VIP thresholds and equipment specifications use accessible native disclosures. Early departure is explained in a two-column table. Unknown settlement details are flagged for agreement; no payment terms are invented.

## Application contract

At `/#apply` scouts choose one of three situations:

- `candidate`: candidate discussion stage, optional handoff context; no third-party identifiers or documents.
- `source`: source category and a nonempty first step, without an arbitrary minimum-length requirement.
- `exploring`: a selected question topic and optional background, with no required plan.

Common fields: own name, adult self-declaration, understanding of format/terms, optional question. Hidden route fields never appear in the outgoing message. Changing the route retains unsent field values locally so a back-navigation does not lose work. Model self-application keeps its existing age, schedule and equipment gating. Neither validation nor a completed form constitutes business approval, identity verification or verified third-party consent.

The reviewed message includes a random code, situation-specific labels, confirmations and allowlisted campaign slugs. The Telegram destination stays `@scauttdom`. Opening Telegram is not receipt by the team: the visitor must press Send. Copy/manual-paste fallback remains available. The optional direct chat path lets a person ask a question without completing the form.

Drafts, progress, application code and attribution are saved in `sessionStorage` in the current tab for 24 hours from the last change. Expired drafts are discarded on load; deletion clears saved and visible values. Storage failure leaves the form usable and shows an honest warning. No cross-tab identity or cookies are added.

## CRM context compatibility

The existing Telegram form prefix, Code/Name/Plan/Source/Question and understanding lines remain compatible with the intake processor. New labels: Situation, Candidate readiness, Before introduction, Interest, About self (Russian labels are defined in `lead-core.js`). The CRM cabinet extractor records these in a source-qualified context summary; exploratory background is never written as a search plan, and an existing candidate never implies verified adulthood, consent or approval.

The existing CRM cabinet has public site-level access while its dashboard and settings require ChatGPT authentication. A dedicated public POST endpoint at `https://scautdom-crm-control.tutu5744.chatgpt.site/api/applications` accepts only the application contract from approved form origins. The save button explicitly posts the reviewed answers to encrypted D1 storage and opens Telegram only after a receipt read-back. It does not require Vercel credentials. The code is the idempotency key; identical retries return the existing receipt, while changed answers use a new code. A timed-out request never produces a fake success. The direct Telegram/copy fallback remains usable.

This is durable website intake in the CRM cabinet, **not advance creation of an amoCRM deal**. After a matching inbound Telegram message has been validated and its CRM fields verified, the receipt links to that existing lead/contact. No placeholder deal or automatic merge is created. Reuse of a receipt in another lead/contact/role requires review. This avoids producing duplicate CRM cards for the same handoff. Native assistant field visibility, real webhook delivery and the full live flow remain separate verification items.

The public endpoint accepts no owner, account or field IDs, and uses the sole ready connection to the existing SCAUTDOM account; ambiguity fails closed. Server validation, payload limits, encrypted answers, idempotency checks, a honeypot, origin allowlist and D1-backed rate limits protect intake. Read access remains authenticated and owner-scoped. Copies expire after 90 days; bounded purge runs during intake/dashboard use. Browser drafts are still temporary and are not the authoritative receipt. The secret never enters the public site.

## Website analytics

On the public domain, `assets/analytics.js` asks for optional statistics consent before tracking. The footer reopens preferences; DNT/GPC are respected. The first-party `/api/events` Vercel proxy validates an allowlist and forwards events to the existing SCAUTDOM CRM app's D1 collector. It replaces the earlier runtime-log-only counter. No external advertising pixels or recording of form answers, chat content, names or network addresses is added.

Random browser IDs expire after 90 days; the preference lasts 180 days. A per-tab visit expires after 30 minutes of inactivity or a different tagged arrival. Page engagement is cumulative, capped, counted only while visible and for up to 60 seconds after interaction. The report distinguishes visits, visitors, form steps, Telegram clicks, durably saved applications, linked CRM cards and confirmed business outcomes. Country is approximate, supplied by Vercel's country header; it is not applicant residence. Application codes link consenting sessions to receipts; business receipts remain countable without analytics consent. Historical visits cannot be reconstructed.

The owner report is at `https://scautdom-crm-control.tutu5744.chatgpt.site/analytics`. Raw analytics history is retained for up to 400 days with bounded cleanup during activity. Source/campaign tags are allowlisted slugs. The Sites mirror and `?sd_analytics=off` do not collect events. Local code checks are separate from the live form/Telegram acceptance exercise explicitly deferred by the owner.

Local `scautdom:event` and `dataLayer` remain available for a later reporting integration. Events: page_view, application_viewed, application_started, application_step, message_prepared, message_copied, application_received, application_save_failed, telegram_handoff, direct_chat, calculator_used, application_cta. A receipt is distinct from a Telegram handoff.

## Release checks and deferred work

Check JS syntax, Python generation, valid local references and HTML structure before publishing. Rebuild `dist` after edits. Live form submissions, Telegram messages, native AI trials and purchases are deferred by the owner. Follow-up: run the real form → saved receipt → Telegram → linked amoCRM card → assistant/human test after explicit go-ahead. Check failure recovery and mobile presentation then. No live submission was performed in this release.
