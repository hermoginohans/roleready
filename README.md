# RoleReady

A resume and cover letter editor with resume and job-description inputs, text import, truthful AI tailoring, a change summary, requirements to review, manual editing, original comparison, text download, and print/PDF export.

**Generate resume & cover letter** creates both drafts for the pasted job description. The cover letter uses only supported experience, stays editable, and has a dedicated **Copy cover letter** button. If clipboard access is blocked, the letter is selected for manual copying. Cover letters stay in the current tab with the resume and are cleared by **Clear all** or a page refresh. Resume PDF and text exports contain only the resume.

## Run locally

Requires Node.js 24. No installation is needed; document readers are bundled in `vendor/`.

Import PDF, Word (.docx), or TXT resumes up to 10 MB. Extraction happens in the browser. Scanned PDFs need OCR outside this app; password-protected PDFs need an unlocked copy. Older .doc files must be saved as .docx. Imports extract text rather than preserving document styling. Review extracted text before tailoring. The limit is 40,000 characters and 50 PDF pages.

Run `npm run dev` and open http://localhost:3000.

Tailored drafts open in a styled resume preview. Use **Edit text** to revise content and **Preview** to see the result. Choose navy, forest, or charcoal accents and comfortable or compact spacing. **Download PDF** saves an A4 PDF directly on the device with embedded fonts, selectable text, and automatic page breaks. It uses the resume's accent color and spacing and excludes recruiter notes and app controls. **Print** remains available for the browser print layout. The screen preview is continuous; PDF line wrapping and page breaks depend on content length and font metrics. Text downloads remain plain text.

For AI tailoring, copy `.env.example` to `.env` and configure `OPENAI_API_KEY` on your own machine. Never commit keys. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Hosted deployments use a server-side Site environment secret. Enabling the OpenAI Developers plugin allows the connection to be configured through its API-key workflow; installing the plugin alone does not configure a key.

Without a key, manual editing, exports, and copying a prompt for ChatGPT work. The app does not simulate AI results.

## Verification

Run `npm test`, `npm run build`, and `npm run validate`. Tests mock the external AI service. A real API call requires configured credentials and has not been verified without them.

## Data

Inputs are kept in the current tab, not local storage or a database. Refreshing loses drafts. Download before closing. Tailoring sends the resume and job description to OpenAI, with API response storage disabled. Do not assume that disabling response storage changes the provider's other data-retention policies.

API integration follows the [official Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
