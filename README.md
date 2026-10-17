# Resume Studio

A private resume editor with resume and job-description inputs, text import, truthful AI tailoring, a change summary, requirements to review, manual editing, original comparison, text download, and print/PDF export.

## Run locally

Requires Node.js 24. No dependencies are needed.

Run `npm run dev` and open http://localhost:3000.

For AI tailoring, copy `.env.example` to `.env` and configure `OPENAI_API_KEY` on your own machine. Never commit keys. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Hosted deployments use a server-side Site environment secret. Enabling the OpenAI Developers plugin allows the connection to be configured through its API-key workflow; installing the plugin alone does not configure a key.

Without a key, manual editing, exports, and copying a prompt for ChatGPT work. The app does not simulate AI results.

## Verification

Run `npm test`, `npm run build`, and `npm run validate`. Tests mock the external AI service. A real API call requires configured credentials and has not been verified without them.

## Data

Inputs are kept in the current tab, not local storage or a database. Refreshing loses drafts. Download before closing. Tailoring sends the resume and job description to OpenAI, with API response storage disabled. Do not assume that disabling response storage changes the provider's other data-retention policies.

API integration follows the [official Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
