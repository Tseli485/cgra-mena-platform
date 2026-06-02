import json
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher
from pathlib import Path


class LawyerDeduplicator:
    """Detects and removes duplicate lawyer records."""

    def __init__(self, similarity_threshold: float = 0.85):
        """Initialize deduplicator with similarity threshold."""
        self.similarity_threshold = similarity_threshold
        self.duplicates_found = []
        self.merged_records = []

    def string_similarity(self, a: str, b: str) -> float:
        """Calculate similarity between two strings (0-1)."""
        if not a or not b:
            return 1.0 if a == b else 0.0
        return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

    def are_duplicates(self, record1: Dict[str, Any], record2: Dict[str, Any]) -> float:
        """
        Determine if two records are likely duplicates.
        Returns similarity score (0-1).
        """
        # Name must be very similar
        name_sim = self.string_similarity(
            record1.get('name', ''),
            record2.get('name', '')
        )

        # Address should match (allowing for minor variations)
        address_sim = self.string_similarity(
            record1.get('address', ''),
            record2.get('address', '')
        )

        # Postal code should match exactly
        postal_match = record1.get('postal_code') == record2.get('postal_code')

        # Phone similarity (cleaned)
        phone1 = ''.join(c for c in record1.get('phone', '') if c.isdigit())
        phone2 = ''.join(c for c in record2.get('phone', '') if c.isdigit())
        phone_match = phone1 == phone2 if phone1 and phone2 else True

        # Weighted score
        score = (name_sim * 0.5) + (address_sim * 0.3) + (
            0.2 if postal_match and phone_match else 0
        )

        return score

    def deduplicate(self, records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
        """
        Remove duplicate records.
        Returns: (deduplicated_list, number_removed)
        """
        self.duplicates_found = []
        seen_indices = set()
        unique_records = []

        for i, record1 in enumerate(records):
            if i in seen_indices:
                continue

            unique_records.append(record1)

            # Find all duplicates of this record
            for j in range(i + 1, len(records)):
                if j in seen_indices:
                    continue

                record2 = records[j]
                similarity = self.are_duplicates(record1, record2)

                if similarity >= self.similarity_threshold:
                    self.duplicates_found.append({
                        'original': record1.get('name'),
                        'duplicate': record2.get('name'),
                        'similarity': similarity,
                        'removed_index': j
                    })
                    seen_indices.add(j)

        return unique_records, len(records) - len(unique_records)

    def merge_records(self, primary: Dict[str, Any], secondary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge two records, preferring primary but filling in missing fields from secondary.
        """
        merged = primary.copy()

        for key, value in secondary.items():
            if key not in merged or merged[key] is None or merged[key] == '':
                merged[key] = value
            elif isinstance(value, list) and isinstance(merged.get(key), list):
                # Merge lists, removing duplicates
                merged_list = list(set(merged[key] + value))
                merged[key] = merged_list

        return merged

    def print_report(self):
        """Print deduplication report."""
        if self.duplicates_found:
            print("\n🔍 DUPLICATES FOUND:")
            for dup in self.duplicates_found[:10]:
                print(f"  - {dup['original']} (similarity: {dup['similarity']:.2f})")
                print(f"    Duplicate: {dup['duplicate']}")
            if len(self.duplicates_found) > 10:
                print(f"  ... and {len(self.duplicates_found) - 10} more duplicates")
        else:
            print("\n✅ No duplicates found")


def deduplicate_lawyers_file(data_file: str, output_file: str = None, threshold: float = 0.85) -> bool:
    """Main deduplication function."""
    print(f"Loading lawyer records from {data_file}...")

    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict) and 'lawyers' in data:
        records = data['lawyers']
        is_wrapped = True
    else:
        records = data if isinstance(data, list) else []
        is_wrapped = False

    print(f"Processing {len(records)} records...")
    deduplicator = LawyerDeduplicator(similarity_threshold=threshold)
    unique_records, removed_count = deduplicator.deduplicate(records)

    print(f"\n✅ DEDUPLICATION RESULTS")
    print(f"  Original records: {len(records)}")
    print(f"  Removed: {removed_count}")
    print(f"  Unique records: {len(unique_records)}")

    deduplicator.print_report()

    # Save deduplicated data
    if output_file is None:
        output_file = data_file.replace('.json', '_dedup.json')

    output_data = {'lawyers': unique_records} if is_wrapped else unique_records

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Deduplicated data saved to {output_file}")
    return True


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python deduplicate.py <data_file> [output_file] [threshold]")
        sys.exit(1)

    data_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.85

    success = deduplicate_lawyers_file(data_file, output_file, threshold)
    sys.exit(0 if success else 1)
