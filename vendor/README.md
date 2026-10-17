# Document readers

These pinned browser distributions are served locally; resume files are parsed in the browser and are not uploaded for extraction.

- Mozilla PDF.js 5.4.624 compatibility build: https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/legacy/build/pdf.min.mjs and pdf.worker.min.mjs. Apache 2.0 license in PDFJS-LICENSE.
- Mammoth 1.11.0: https://cdn.jsdelivr.net/npm/mammoth@1.11.0/mammoth.browser.min.js. BSD license in MAMMOTH-LICENSE.
- jsPDF 4.2.1: https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js. MIT license in JSPDF-LICENSE. Used for direct selectable-text PDF downloads.
- Noto Sans Regular/Bold and Noto Serif Bold: https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf. SIL Open Font License in NOTO-LICENSE. Fonts are embedded in downloaded PDFs.

Only text extraction is used. PDF rendering/evaluation and Mammoth HTML conversion are not used.
