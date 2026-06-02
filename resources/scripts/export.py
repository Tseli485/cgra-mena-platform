"""
ResourceExporter: Load 116 resources from JSON and export to JSON, CSV, and PDF formats.
"""

import json
import csv
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors


class ResourceExporter:
    """Export resources to multiple formats (JSON, CSV, PDF)."""

    def __init__(self, data_dir: str = None, output_dir: str = None):
        """Initialize exporter with data and output directories."""
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent / "data"
        self.output_dir = Path(output_dir) if output_dir else Path(__file__).parent.parent
        self.resources: List[Dict[str, Any]] = []
        self.load_resources()

    def load_resources(self) -> None:
        """Load 116 resources from search-results.json."""
        search_results_file = self.data_dir / "search-results.json"
        if not search_results_file.exists():
            raise FileNotFoundError(f"Resource file not found: {search_results_file}")

        with open(search_results_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.resources = data.get("results", [])

        print(f"Loaded {len(self.resources)} resources from {search_results_file.name}")

    def export_json(self, filename: str = "pwa_resources.json") -> str:
        """Export resources to JSON format with metadata."""
        output_path = self.output_dir / filename
        output_data = {
            "metadata": {
                "total_resources": len(self.resources),
                "export_date": datetime.now().isoformat(),
                "format_version": "1.0",
                "description": "Complete resource directory for PWA access"
            },
            "resources": self.resources
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        file_size = output_path.stat().st_size
        print(f"JSON export: {filename} ({file_size:,} bytes)")
        return str(output_path)

    def export_csv(self, filename: str = "resources.csv") -> str:
        """Export resources to CSV format."""
        output_path = self.output_dir / filename

        if not self.resources:
            raise ValueError("No resources loaded")

        # Get all unique keys from all resources
        all_keys = set()
        for resource in self.resources:
            all_keys.update(resource.keys())

        fieldnames = sorted(list(all_keys))

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for resource in self.resources:
                # Convert lists to pipe-delimited strings
                row = {}
                for key in fieldnames:
                    value = resource.get(key, "")
                    if isinstance(value, list):
                        row[key] = " | ".join(str(v) for v in value)
                    else:
                        row[key] = value
                writer.writerow(row)

        file_size = output_path.stat().st_size
        print(f"CSV export: {filename} ({file_size:,} bytes)")
        return str(output_path)

    def export_pdf_directory(self, filename: str = "resources_directory.pdf") -> str:
        """Export resources to PDF directory format."""
        output_path = self.output_dir / filename

        # Create PDF document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=0.5 * inch,
            leftMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch,
            title="CGRA Resource Directory"
        )

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=18,
            textColor=colors.HexColor("#1a1a1a"),
            spaceAfter=12,
            fontName="Helvetica-Bold"
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=11,
            textColor=colors.HexColor("#333333"),
            spaceAfter=6,
            fontName="Helvetica-Bold"
        )
        normal_style = ParagraphStyle(
            "CustomNormal",
            parent=styles["Normal"],
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#555555")
        )

        story = []

        # Add title page
        story.append(Paragraph("CGRA Resource Directory", title_style))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", normal_style))
        story.append(Paragraph(f"Total Resources: {len(self.resources)}", normal_style))
        story.append(Spacer(1, 0.3 * inch))

        # Add resources
        for idx, resource in enumerate(self.resources, 1):
            # Resource name/ID
            resource_name = resource.get("name", resource.get("id", f"Resource {idx}"))
            story.append(Paragraph(f"{idx}. {resource_name}", heading_style))

            # Create resource details table
            details = []
            key_order = [
                "id", "type", "address", "postal_code", "city", "region",
                "phone", "email", "website", "specialty", "hours", "languages",
                "fees", "accessibility", "capacity", "staff", "accreditation",
                "founding_date", "regions_served", "case_types", "referral_contacts",
                "notes", "source"
            ]

            for key in key_order:
                if key in resource:
                    value = resource[key]
                    if isinstance(value, list):
                        value = ", ".join(str(v) for v in value)
                    else:
                        value = str(value)

                    details.append([
                        Paragraph(f"<b>{key.replace('_', ' ').title()}:</b>", normal_style),
                        Paragraph(value, normal_style)
                    ])

            if details:
                details_table = Table(details, colWidths=[1.5 * inch, 4 * inch])
                details_table.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f5f5f5")),
                ]))
                story.append(details_table)

            story.append(Spacer(1, 0.15 * inch))

            # Add page break every 5 resources
            if idx % 5 == 0 and idx < len(self.resources):
                story.append(PageBreak())

        # Build PDF
        doc.build(story)

        file_size = output_path.stat().st_size
        print(f"PDF export: {filename} ({file_size:,} bytes)")
        return str(output_path)


def main():
    """Run all exports."""
    try:
        exporter = ResourceExporter()

        # Export to all formats
        json_path = exporter.export_json()
        csv_path = exporter.export_csv()
        pdf_path = exporter.export_pdf_directory()

        print("\nAll exports completed successfully:")
        print(f"  - {Path(json_path).name}")
        print(f"  - {Path(csv_path).name}")
        print(f"  - {Path(pdf_path).name}")

    except Exception as e:
        print(f"Export failed: {e}")
        raise


if __name__ == "__main__":
    main()
