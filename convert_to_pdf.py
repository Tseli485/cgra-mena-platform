#!/usr/bin/env python
import os
import sys
import subprocess

# Install weasyprint silently
subprocess.run([sys.executable, '-m', 'pip', 'install', 'weasyprint', '-q'],
               capture_output=True)

from weasyprint import HTML

# HTML file path
html_file = r"C:\Users\trian\OneDrive\Desktop\CGRA\docs\syllabus\SYLLABUS_COURTE.html"
pdf_file = r"C:\Users\trian\OneDrive\Desktop\CGRA\docs\syllabus\SYLLABUS_COURTE.pdf"

# Convert HTML to PDF
try:
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    HTML(string=html_content, base_url=os.path.dirname(html_file)).write_pdf(pdf_file)

    # Verify file exists and check size
    if os.path.exists(pdf_file):
        size = os.path.getsize(pdf_file)
        print(f"PDF created successfully: {pdf_file}")
        print(f"File size: {size / 1024:.1f} KB")
        print(f"Status: SUCCESS")
    else:
        print("Error: PDF file not created")
        sys.exit(1)

except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
