"""
Resource Search and Filter Engine for CGRA

Provides full-text search, filtering, and indexing capabilities for lawyers,
organizations, and centers. Exports search indexes for PWA embedding.
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Set
from collections import defaultdict
import unicodedata


class ResourceSearchEngine:
    """Comprehensive search engine for legal resources."""

    def __init__(self, data_dir: str = None):
        """Initialize search engine.

        Args:
            data_dir: Path to resources/data directory. Defaults to script directory parent.
        """
        if data_dir is None:
            script_dir = Path(__file__).parent
            data_dir = script_dir.parent / "data"

        self.data_dir = Path(data_dir)
        self.resources = {
            "lawyers": [],
            "organizations": [],
            "centers": []
        }
        self.indexes = {
            "name": defaultdict(set),
            "specialty": defaultdict(set),
            "region": defaultdict(set),
            "language": defaultdict(set),
            "postal_code": defaultdict(set),
            "case_type": defaultdict(set)
        }
        self.all_resources = []  # Flat list of all resources with type

    def _normalize_text(self, text: str) -> str:
        """Normalize text for indexing and search.

        Args:
            text: Text to normalize

        Returns:
            Normalized text (lowercase, accents removed)
        """
        if not text:
            return ""
        # Convert to lowercase
        text = text.lower()
        # Remove accents
        text = ''.join(
            c for c in unicodedata.normalize('NFD', text)
            if unicodedata.category(c) != 'Mn'
        )
        return text.strip()

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words.

        Args:
            text: Text to tokenize

        Returns:
            List of normalized word tokens
        """
        normalized = self._normalize_text(text)
        # Split on whitespace and punctuation
        tokens = re.findall(r'\b\w+\b', normalized)
        return [t for t in tokens if len(t) > 1]  # Skip single-char tokens

    def load_resources(self) -> int:
        """Load all resources from JSON files.

        Returns:
            Total number of resources loaded
        """
        total = 0

        # Load lawyers
        lawyers_file = self.data_dir / "raw" / "lawyers.json"
        if lawyers_file.exists():
            with open(lawyers_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.resources["lawyers"] = data.get("lawyers", [])
                for lawyer in self.resources["lawyers"]:
                    lawyer['_type'] = 'lawyer'
                    self.all_resources.append(lawyer)
                total += len(self.resources["lawyers"])

        # Load organizations
        orgs_file = self.data_dir / "raw" / "organizations.json"
        if orgs_file.exists():
            with open(orgs_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.resources["organizations"] = data.get("organizations", [])
                for org in self.resources["organizations"]:
                    org['_type'] = 'organization'
                    self.all_resources.append(org)
                total += len(self.resources["organizations"])

        # Load centers
        centers_file = self.data_dir / "raw" / "centers.json"
        if centers_file.exists():
            with open(centers_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Centers is a direct array, not wrapped in object
                centers_data = data if isinstance(data, list) else data.get("centers", [])
                self.resources["centers"] = centers_data
                for center in self.resources["centers"]:
                    center['_type'] = 'center'
                    self.all_resources.append(center)
                total += len(self.resources["centers"])

        return total

    def build_index(self) -> None:
        """Build inverted indexes for all searchable fields."""
        for resource in self.all_resources:
            resource_id = resource.get("id")

            # Index name (word by word)
            if "name" in resource:
                name_tokens = self._tokenize(resource["name"])
                for token in name_tokens:
                    self.indexes["name"][token].add(resource_id)

            # Index specialty/specialties
            specialties = resource.get("specialty", resource.get("specialties", []))
            if isinstance(specialties, list):
                for specialty in specialties:
                    spec_tokens = self._tokenize(specialty)
                    for token in spec_tokens:
                        self.indexes["specialty"][token].add(resource_id)

            # Index region
            region = resource.get("region")
            if region:
                region_normalized = self._normalize_text(region)
                self.indexes["region"][region_normalized].add(resource_id)

            # Index languages
            languages = resource.get("languages", [])
            for lang in languages:
                lang_normalized = self._normalize_text(lang)
                self.indexes["language"][lang_normalized].add(resource_id)

            # Index postal code
            postal_code = resource.get("postal_code")
            if postal_code:
                self.indexes["postal_code"][postal_code].add(resource_id)

            # Index case types
            case_types = resource.get("case_types", [])
            for case_type in case_types:
                ct_tokens = self._tokenize(case_type)
                for token in ct_tokens:
                    self.indexes["case_type"][token].add(resource_id)

    def _get_resource_by_id(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """Get resource by ID from the flat list.

        Args:
            resource_id: The resource ID

        Returns:
            Resource object or None
        """
        for resource in self.all_resources:
            if resource.get("id") == resource_id:
                return resource
        return None

    def search(
        self,
        query: Optional[str] = None,
        region: Optional[str] = None,
        specialty: Optional[str] = None,
        language: Optional[str] = None,
        postal_code: Optional[str] = None,
        case_type: Optional[str] = None,
        resource_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Perform search with optional filters.

        Args:
            query: Full-text search query
            region: Filter by region (Brussels, Wallonia, Flanders)
            specialty: Filter by specialty
            language: Filter by language
            postal_code: Filter by postal code
            case_type: Filter by case type
            resource_type: Filter by type (lawyer, organization, center)

        Returns:
            List of matching resource objects
        """
        result_ids = None

        # Full-text search
        if query:
            query_tokens = self._tokenize(query)
            query_ids = None

            for token in query_tokens:
                # Search in all indexes
                token_results = set()
                token_results.update(self.indexes["name"].get(token, set()))
                token_results.update(self.indexes["specialty"].get(token, set()))
                token_results.update(self.indexes["case_type"].get(token, set()))

                if query_ids is None:
                    query_ids = token_results
                else:
                    query_ids = query_ids.intersection(token_results)

            result_ids = query_ids if query_ids else set()

        # Filter by region
        if region:
            region_normalized = self._normalize_text(region)
            region_ids = self.indexes["region"].get(region_normalized, set())

            if result_ids is None:
                result_ids = region_ids
            else:
                result_ids = result_ids.intersection(region_ids)

        # Filter by specialty
        if specialty:
            spec_tokens = self._tokenize(specialty)
            specialty_ids = set()

            for token in spec_tokens:
                specialty_ids.update(self.indexes["specialty"].get(token, set()))

            if result_ids is None:
                result_ids = specialty_ids
            else:
                result_ids = result_ids.intersection(specialty_ids)

        # Filter by language
        if language:
            lang_normalized = self._normalize_text(language)
            language_ids = self.indexes["language"].get(lang_normalized, set())

            if result_ids is None:
                result_ids = language_ids
            else:
                result_ids = result_ids.intersection(language_ids)

        # Filter by postal code
        if postal_code:
            postal_ids = self.indexes["postal_code"].get(postal_code, set())

            if result_ids is None:
                result_ids = postal_ids
            else:
                result_ids = result_ids.intersection(postal_ids)

        # Filter by case type
        if case_type:
            ct_tokens = self._tokenize(case_type)
            case_ids = set()

            for token in ct_tokens:
                case_ids.update(self.indexes["case_type"].get(token, set()))

            if result_ids is None:
                result_ids = case_ids
            else:
                result_ids = result_ids.intersection(case_ids)

        # If no filters applied, return all resources
        if result_ids is None:
            result_ids = {r.get("id") for r in self.all_resources}

        # Build result list
        results = []
        for resource_id in result_ids:
            resource = self._get_resource_by_id(resource_id)
            if resource:
                # Filter by resource type if specified
                if resource_type is None or resource.get("_type") == resource_type:
                    results.append(resource)

        # Sort by name
        results.sort(key=lambda r: r.get("name", ""))
        return results

    def export_search_index(self, output_path: str = None) -> str:
        """Export search index for client-side use.

        Args:
            output_path: Path to save the index. Defaults to resources/data/search-index.json

        Returns:
            Path to the exported index file
        """
        if output_path is None:
            output_path = self.data_dir / "search-index.json"

        # Build exportable index
        index_export = {
            "name": {},
            "specialty": {},
            "region": {},
            "language": {},
            "postal_code": {},
            "case_type": {}
        }

        for idx_name, idx_dict in self.indexes.items():
            for token, ids in idx_dict.items():
                index_export[idx_name][token] = list(ids)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(index_export, f, ensure_ascii=False, indent=2)

        return str(output_path)

    def export_results_json(self, results: List[Dict[str, Any]], output_path: str = None) -> str:
        """Export search results to JSON.

        Args:
            results: List of resource objects to export
            output_path: Path to save results. Defaults to resources/data/search-results.json

        Returns:
            Path to the exported results file
        """
        if output_path is None:
            output_path = self.data_dir / "search-results.json"

        # Remove internal type field for export
        export_results = []
        for resource in results:
            clean_resource = {k: v for k, v in resource.items() if not k.startswith("_")}
            export_results.append(clean_resource)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                "results": export_results,
                "count": len(export_results),
                "timestamp": None  # Can be set by caller
            }, f, ensure_ascii=False, indent=2)

        return str(output_path)

    def export_for_pwa(self, output_path: str = None) -> str:
        """Export complete resource data and index for PWA embedding.

        Args:
            output_path: Path to save PWA data. Defaults to pwa/data/resources.json

        Returns:
            Path to the exported PWA data file
        """
        if output_path is None:
            pwa_data_dir = Path(self.data_dir).parent.parent / "pwa" / "data"
            pwa_data_dir.mkdir(parents=True, exist_ok=True)
            output_path = pwa_data_dir / "resources.json"

        # Build comprehensive PWA export
        clean_resources = []
        for resource in self.all_resources:
            clean_resource = {k: v for k, v in resource.items() if not k.startswith("_")}
            clean_resources.append(clean_resource)

        pwa_export = {
            "version": "1.0",
            "resources": clean_resources,
            "metadata": {
                "total_count": len(clean_resources),
                "types": {
                    "lawyer": len([r for r in clean_resources if r.get("_type") == "lawyer"]),
                    "organization": len([r for r in clean_resources if r.get("_type") == "organization"]),
                    "center": len([r for r in clean_resources if r.get("_type") == "center"])
                },
                "regions": list(set(r.get("region") for r in clean_resources if r.get("region")))
            }
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(pwa_export, f, ensure_ascii=False, indent=2)

        return str(output_path)

    def get_index_stats(self) -> Dict[str, int]:
        """Get statistics about the search index.

        Returns:
            Dictionary with index statistics
        """
        stats = {}
        for idx_name, idx_dict in self.indexes.items():
            stats[idx_name] = len(idx_dict)

        stats["total_resources"] = len(self.all_resources)
        stats["index_size_bytes"] = len(json.dumps(self.indexes, default=list))

        return stats


def main():
    """Run search engine with test queries."""
    import sys

    # Initialize engine
    engine = ResourceSearchEngine()

    print("Loading resources...")
    total = engine.load_resources()
    print(f"Loaded {total} resources")

    print("\nBuilding search index...")
    engine.build_index()

    # Print index statistics
    stats = engine.get_index_stats()
    print(f"\nIndex Statistics:")
    print(f"  Total resources: {stats['total_resources']}")
    print(f"  Name tokens: {stats['name']}")
    print(f"  Specialty tokens: {stats['specialty']}")
    print(f"  Region tokens: {stats['region']}")
    print(f"  Language tokens: {stats['language']}")
    print(f"  Postal codes: {stats['postal_code']}")
    print(f"  Case type tokens: {stats['case_type']}")
    print(f"  Index size: {stats['index_size_bytes']:,} bytes")

    # Test Query 1: "asylum" specialists in Bruxelles
    print("\n" + "="*60)
    print("Test Query 1: Asylum specialists in Bruxelles")
    results = engine.search(query="asylum", region="Bruxelles")
    print(f"Found {len(results)} results")
    for r in results[:3]:
        print(f"  - {r.get('name')} ({r.get('_type')})")

    # Test Query 2: MENA centers
    print("\n" + "="*60)
    print("Test Query 2: MENA medical centers")
    results = engine.search(query="MENA")
    print(f"Found {len(results)} results")
    for r in results[:3]:
        print(f"  - {r.get('name')} ({r.get('_type')})")

    # Test Query 3: Arabic-speaking resources in Bruxelles
    print("\n" + "="*60)
    print("Test Query 3: Arabic-speaking resources in Bruxelles")
    results = engine.search(language="ar", region="Bruxelles")
    print(f"Found {len(results)} results")
    for r in results[:3]:
        print(f"  - {r.get('name')} ({r.get('_type')})")

    # Export indexes and results
    print("\n" + "="*60)
    print("Exporting data...")

    index_path = engine.export_search_index()
    print(f"Search index exported to: {index_path}")

    # Export sample results
    all_results = engine.search()
    results_path = engine.export_results_json(all_results)
    print(f"All results exported to: {results_path}")

    pwa_path = engine.export_for_pwa()
    print(f"PWA data exported to: {pwa_path}")

    print("\nDone!")
    return 0


if __name__ == "__main__":
    exit(main())
