# Verdict Court — VC-01

Production-architecture baseline recovered from the canonical `VERDICT_COURT_V2_COMPLETE_REVAMP` package.

## Product boundary
Verdict Court is structured community deliberation and entertainment. It is not a court, arbitration service, law firm, legal-advice product, or fact-finding authority.

## VC-01 includes
- Next.js App Router + TypeScript shell preserving the recovered luxury courtroom design.
- Adult entry gate for the MVP pilot.
- Case state machine with a non-bypassable Bench Review gate.
- Named two-sided cases require respondent consent before record lock/public deliberation.
- Hypothetical mode is the route for non-consenting absent parties and requires de-identification.
- Evidence Locker UI and moderated/public record separation rules.
- Admin Bench baseline for case eligibility and consent gates.
- Supabase browser/server helpers and Next.js `proxy.ts` session refresh.
- Recovered Supabase/Postgres schema and recovered AI Clerk edge-function reference.
- No secrets committed. The historic exposed OpenAI key must remain revoked.

## Environment
Copy `.env.example` to `.env.local` and fill in only the public Supabase URL/publishable key. `OPENAI_API_KEY` must be server-side only.

## Local run
```bash
npm install
npm run dev
```

## Release status
VC-01 is an engineering baseline, not production approval. Before any public release, satisfy the canonical release gate: tested RLS, moderation, consent, prohibited-case taxonomy, takedown controls, abuse/rate limits, privacy/terms/community standards, account deletion, evidence media restrictions and human legal review.

<!-- Vercel production deployment trigger: 2026-10-01 -->
