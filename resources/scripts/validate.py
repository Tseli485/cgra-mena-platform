import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
from jsonschema import validate, ValidationError, Draft7Validator

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


class LawyerValidator:
    """Validates lawyer records against schema."""

    def __init__(self, schema_path: str):
        """Initialize validator with schema file."""
        with open(schema_path, 'r', encoding='utf-8') as f:
            self.schema = json.load(f)
        self.validator = Draft7Validator(self.schema)
        self.errors = []
        self.warnings = []

    def validate_record(self, record: Dict[str, Any], record_index: int) -> bool:
        """Validate a single lawyer record."""
        try:
            validate(instance=record, schema=self.schema)
            self._check_custom_validations(record, record_index)
            return len(self.errors) == 0
        except ValidationError as e:
            self.errors.append(f"Record {record_index}: {e.message}")
            return False

    def _check_custom_validations(self, record: Dict[str, Any], record_index: int):
        """Check custom validation rules beyond JSON Schema."""

        # Email validation
        if 'email' in record and record['email']:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, record['email']):
                self.errors.append(f"Record {record_index}: Invalid email format: {record['email']}")

        # Phone validation (basic)
        if 'phone' in record and record['phone']:
            phone_cleaned = re.sub(r'[\s\-\(\).]', '', record['phone'])
            if not re.match(r'^\+?[0-9]{9,15}$', phone_cleaned):
                self.warnings.append(f"Record {record_index}: Phone format unusual: {record['phone']}")

        # Postal code validation (Belgium)
        if 'postal_code' in record and record['postal_code']:
            if not re.match(r'^[0-9]{4}$', record['postal_code']):
                self.warnings.append(f"Record {record_index}: Invalid Belgian postal code: {record['postal_code']}")

        # Rating validation
        if 'reviews' in record and record['reviews']:
            if 'rating' in record['reviews'] and record['reviews']['rating']:
                rating = record['reviews']['rating']
                if not (1 <= rating <= 5):
                    self.errors.append(f"Record {record_index}: Rating out of range: {rating}")

        # Capacity consistency
        if 'capacity' in record and record['capacity'] not in ['accepting_clients', 'limited_availability', 'not_accepting']:
            self.errors.append(f"Record {record_index}: Invalid capacity status: {record['capacity']}")

        # Specialty should not be empty
        if 'specialty' in record:
            if isinstance(record['specialty'], list) and len(record['specialty']) == 0:
                self.errors.append(f"Record {record_index}: Specialty list cannot be empty")

    def validate_batch(self, records: List[Dict[str, Any]]) -> Tuple[int, int, int]:
        """
        Validate a batch of records.
        Returns: (total, valid, invalid)
        """
        self.errors = []
        self.warnings = []
        valid_count = 0

        for i, record in enumerate(records):
            if self.validate_record(record, i):
                valid_count += 1

        invalid_count = len(records) - valid_count
        return len(records), valid_count, invalid_count

    def print_report(self):
        """Print validation report."""
        if self.errors:
            print("\nERRORS:")
            for error in self.errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(self.errors) > 10:
                print(f"  ... and {len(self.errors) - 10} more errors")

        if self.warnings:
            print("\nWARNINGS:")
            for warning in self.warnings[:5]:  # Show first 5 warnings
                print(f"  - {warning}")
            if len(self.warnings) > 5:
                print(f"  ... and {len(self.warnings) - 5} more warnings")


def validate_lawyers_file(data_file: str, schema_file: str) -> bool:
    """Main validation function."""
    print(f"Loading schema from {schema_file}...")
    validator = LawyerValidator(schema_file)

    print(f"Loading lawyer records from {data_file}...")
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict) and 'lawyers' in data:
        records = data['lawyers']
    else:
        records = data if isinstance(data, list) else []

    print(f"Validating {len(records)} records...")
    total, valid, invalid = validator.validate_batch(records)

    print(f"\nVALIDATION RESULTS")
    print(f"  Total records: {total}")
    print(f"  Valid: {valid}")
    print(f"  Invalid: {invalid}")
    print(f"  Success rate: {(valid/total*100):.1f}%" if total > 0 else "  Success rate: N/A")

    validator.print_report()

    return invalid == 0


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python validate.py <data_file> <schema_file>")
        sys.exit(1)

    data_file = sys.argv[1]
    schema_file = sys.argv[2]

    success = validate_lawyers_file(data_file, schema_file)
    sys.exit(0 if success else 1)
