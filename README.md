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

Direct form-to-CRM persistence is **not enabled**. The linked private CRM cabinet cannot serve as an anonymous form endpoint. The current Vercel connection exposes no projects/teams, so server credentials and a durable queue cannot be configured from it. Do not label browser drafts as server-saved applications or put CRM/private Site credentials in public JavaScript. Telegram delivery is the current operational submission path. Native assistant field visibility and real webhook delivery remain separate live verification items.

## Anonymous funnel events

On the public domain, `/api/events` accepts an allowlist of events via same-origin JSON POST and emits `scautdom_funnel` JSON in Vercel runtime logs. Fields: event, pathname, role, step, server timestamp. No answers, names, free text, visitor IDs or campaign tags are logged. Unknown fields are ignored by explicit projection; unsupported events, origins, methods and large payloads are rejected. Browser DNT/GPC disable collection. Client caps and de-duplicates events per page view. This is operational event logging, not a permanent reporting database or a count of accepted leads; retention and access follow the hosting account. Static Sites copies do not attempt the endpoint. Advertising tracking stays disabled.

Local `scautdom:event` and `dataLayer` remain available for a later reporting integration. Events: page_view, application_viewed, application_started, application_step, message_prepared, message_copied, telegram_handoff, direct_chat, calculator_used, application_cta.

## Release checks and deferred work

Check JS syntax, Python generation, valid local references and HTML structure before publishing. Rebuild `dist` after edits. Live form submissions, Telegram messages, native AI trials and purchases are deferred by the owner. Follow-up: connect Vercel project access, configure a server-side durable application intake, and run the real form → Telegram → CRM → assistant/human test after explicit go-ahead.
