# PDF GENERATION NOTES

## File Composition

The SYLLABUS_COMPLETE workbook consists of:

**Master Markdown Components:**
- `content-complete/PART_1_FOUNDATIONS.md` (8,108 words) - Chapters 1-4
- `content-complete/PART_2_LIFECYCLE.md` (9,593 words) - Chapters 5-8  
- `content-complete/PART_3_CASES.md` (10,433 words) - 6 detailed case studies
- `content-complete/PART_4_RESOURCES.md` (2,395 words) - Resources, templates, tools
- `content-complete/PART_5_BACKMATTER.md` (4,408 words) - Glossary, references, index

**Total Content:** 34,937 words

**Professional HTML Template:**
- `SYLLABUS_COMPLETE.html` - Master template with CSS styling, cover page, TOC, section headers

## PDF Generation Methods

### Option 1: Using wkhtmltopdf (Recommended)
If you have wkhtmltopdf installed:

```bash
wkhtmltopdf --dpi 300 \
  --page-size Letter \
  --margin-top 1in \
  --margin-bottom 1in \
  --margin-left 1in \
  --margin-right 1in \
  --disable-smart-shrinking \
  --print-media-type \
  --enable-toc \
  --toc-text-size-shrink 0.8 \
  "docs/syllabus/SYLLABUS_COMPLETE.html" \
  "docs/syllabus/SYLLABUS_COMPLETE.pdf"
```

### Option 2: Using Microsoft Edge (Windows)
```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless `
  --disable-gpu `
  --print-to-pdf="C:\Users\trian\OneDrive\Desktop\CGRA\docs\syllabus\SYLLABUS_COMPLETE.pdf" `
  "file:///C:/Users/trian/OneDrive/Desktop/CGRA/docs/syllabus/SYLLABUS_COMPLETE.html"
```

### Option 3: Using Google Chrome/Chromium
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless `
  --disable-gpu `
  --print-to-pdf="C:\Users\trian\OneDrive\Desktop\CGRA\docs\syllabus\SYLLABUS_COMPLETE.pdf" `
  "file:///C:/Users/trian/OneDrive/Desktop/CGRA/docs/syllabus/SYLLABUS_COMPLETE.html"
```

### Option 4: Using Pandoc (if installed)
```bash
pandoc -f html -t pdf \
  --css=style.css \
  --pdf-engine=xelatex \
  -V papersize:letter \
  -V margin-left:1in \
  -V margin-right:1in \
  -V margin-top:1in \
  -V margin-bottom:1in \
  "docs/syllabus/SYLLABUS_COMPLETE.html" \
  -o "docs/syllabus/SYLLABUS_COMPLETE.pdf"
```

### Option 5: Using Python with weasyprint
```python
from weasyprint import HTML
HTML("docs/syllabus/SYLLABUS_COMPLETE.html").write_pdf(
    "docs/syllabus/SYLLABUS_COMPLETE.pdf",
    optimize_size=['fonts', 'images', 'hinting']
)
```

## Expected PDF Characteristics

### Specifications
- **File Format:** PDF/A-1b (archival format recommended)
- **Page Size:** 8.5" × 11" (US Letter)
- **Margins:** 1" all sides
- **Page Count:** 80 pages (estimated based on 34,937 words at professional density)
- **Font:** Readable serif (body) and sans-serif (headers)
- **Color:** Full color with professional palette

### Content Structure
- Cover page with title and metadata
- Table of Contents (2 pages)
- Part 1: Foundations & Framework (~10 pages)
- Part 2: Lifecycle of Intervention (~10 pages)
- Part 3: Practical Cases & Analysis (~15 pages)
  - 6 detailed cases with timelines, legal frameworks, solutions, lessons
  - Cross-case learning summary
- Part 4: Resources & Implementation (~15 pages)
  - 34 resource contacts
  - 5 detailed templates with examples
  - 3 decision trees
  - Implementation guidance
- Part 5: Back Matter (~5 pages)
  - Glossary (130+ terms)
  - References (30+ sources)
  - Subject index
  - Quick reference matrices
- Closing page

## Quality Assurance

### Before Conversion
1. Verify all markdown files are complete
2. Check HTML template structure
3. Validate CSS styling
4. Test hyperlinks and cross-references

### After Conversion
1. Verify PDF file is created and readable
2. Check total page count (target: 80)
3. Spot-check page numbers and headers
4. Verify hyperlinked table of contents works
5. Confirm all images/diagrams render correctly
6. Test print preview and actual printing
7. Validate file size is reasonable (expect 3-8 MB)

## Installation of PDF Tools

### wkhtmltopdf (Windows)
```powershell
choco install wkhtmltopdf
# or download from https://wkhtmltopdf.org/downloads.html
```

### Python weasyprint
```bash
pip install weasyprint
```

### Pandoc
```powershell
choco install pandoc
# or https://pandoc.org/installing.html
```

## File Locations

```
C:\Users\trian\OneDrive\Desktop\CGRA\
├── docs\
│   └── syllabus\
│       ├── SYLLABUS_COMPLETE.html          [Source - Master template]
│       ├── SYLLABUS_COMPLETE.pdf           [Output - Generated PDF]
│       ├── PDF_GENERATION_NOTES.md         [This file]
│       └── content-complete\
│           ├── PART_1_FOUNDATIONS.md       
│           ├── PART_2_LIFECYCLE.md
│           ├── PART_3_CASES.md
│           ├── PART_4_RESOURCES.md
│           └── PART_5_BACKMATTER.md
```

## Troubleshooting

### PDF too small (margins too large)
- Reduce margin values in wkhtmltopdf command
- Check CSS margin/padding settings in HTML

### Page breaks in wrong places
- Add `page-break-before: always` to relevant CSS classes
- Manually adjust section structure

### Missing content
- Verify all markdown files are included in HTML
- Check for encoding issues in HTML file
- Ensure all parts are properly embedded

### Performance issues
- Reduce DPI from 300 to 150 or 96 if file size too large
- Remove high-res images if not essential
- Compress PDF after generation using: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf`

## Verification Commands

### Check file exists and size
```bash
ls -lh docs/syllabus/SYLLABUS_COMPLETE.pdf
```

### Count pages (if pdfinfo available)
```bash
pdfinfo docs/syllabus/SYLLABUS_COMPLETE.pdf | grep Pages
```

### Validate PDF
```bash
file docs/syllabus/SYLLABUS_COMPLETE.pdf
```

---

**Note:** PDF generation is not yet automated in this deployment. Manual generation using one of the methods above is required. Future versions will include automated PDF build pipeline.

Generated: June 3, 2026
