# RoleReady

A resume and cover letter editor with resume and job-description inputs, text import, truthful AI tailoring, a change summary, requirements to review, manual editing, original comparison, text download, and print/PDF export.

**Generate resume & cover letter** creates both drafts for the pasted job description. The cover letter uses only supported experience, stays editable, and has a dedicated **Copy cover letter** button. If clipboard access is blocked, the letter is selected for manual copying. Cover letters stay in the current tab with the resume and are cleared by **Clear all** or a page refresh. Resume PDF and text exports contain only the resume.

## Deploy from GitHub to Render

[Deploy to Render](https://render.com/deploy?repo=https://github.com/hermoginohans/roleready)

1. Open the deployment link, sign in to Render, and connect your GitHub account. Grant Render access to `hermoginohans/roleready` if requested.
2. Render reads `render.yaml` and creates a Node web service. Enter your OpenAI API key in the prompted `OPENAI_API_KEY` secret field, then deploy. Do not put the key in GitHub source files.
3. Open the HTTPS URL Render provides. Look for **AI connection ready**, then load the sample inputs and generate a resume and cover letter to verify the live AI connection.

Render deploys updates from the linked branch. GitHub Actions runs the tests, build, and artifact validation on pushes to `main` and pull requests. The workflow does not need an API key; its AI tests use mocks. The initial health check confirms the server responds, not that the API key has credits or is valid.

The Blueprint selects Render's free instance. See [Render's free service limitations](https://render.com/docs/free), including idle spin-down. AI API usage is billed separately by your provider. The app's AI endpoint is available to visitors of the deployed URL.

For manual Render setup, select **New → Web Service**, connect the repository, use Node 24, set build command `npm run build && npm run validate`, start command `npm start`, health check path `/api/status`, and add `OPENAI_API_KEY` as a secret. `OPENAI_MODEL` is optional. The server binds to Render's assigned `PORT` on `0.0.0.0` and supports Render's HTTPS proxy. `PUBLIC_URL` can optionally fix the expected public origin (for example, `https://your-app.onrender.com`).

GitHub Pages alone cannot run the AI backend. GitHub stores the source and Render runs the website and server-side AI calls.

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
