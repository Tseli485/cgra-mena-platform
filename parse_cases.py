#!/usr/bin/env python3
import json
import re
from pathlib import Path
from collections import defaultdict

cases_dir = Path(r"C:\Users\trian\OneDrive\Desktop\CGRA\docs\cases")
output_dir = Path(r"C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\data")
output_dir.mkdir(parents=True, exist_ok=True)

def extract_text_between(content, start_marker, end_marker):
    """Extract text between two markers"""
    if not content or not start_marker:
        return None
    start = content.find(start_marker)
    if start == -1:
        return None
    start += len(start_marker)
    if end_marker:
        end = content.find(end_marker, start)
        if end == -1:
            end = len(content)
    else:
        end = len(content)
    return content[start:end].strip()

def parse_markdown_table(content, table_header):
    """Parse a markdown table"""
    rows = []
    start = content.find(table_header)
    if start == -1:
        return rows

    start = content.find('\n|', start)
    if start == -1:
        return rows

    # Find end of table
    end = content.find('\n## ', start)
    if end == -1:
        end = content.find('\n\n', start)
    if end == -1:
        end = len(content)

    table_content = content[start:end]
    lines = table_content.split('\n')

    headers = None
    for line in lines:
        if not line.strip().startswith('|'):
            continue

        # Skip separator line
        if '---' in line:
            continue

        # Parse cells
        cells = [c.strip() for c in line.split('|') if c.strip()]

        if headers is None:
            headers = cells
        else:
            if len(cells) > 0:
                row = {}
                for i, header in enumerate(headers):
                    row[header] = cells[i] if i < len(cells) else ""
                rows.append(row)

    return rows

def extract_age_and_group(narrative):
    """Extract age and age group from narrative"""
    age = None
    age_group = "unknown"

    if not narrative:
        return age, age_group

    # Look for age patterns like "14 years old" or "aged 12" or "was 9 years old"
    age_patterns = [
        r'was\s+(\d+)\s+years?\s+old',
        r'(\d+)\s+years?\s+old',
        r'aged\s+(\d+)',
        r'age\s+(\d+)',
        r'age\s+of\s+(\d+)',
    ]

    for pattern in age_patterns:
        age_match = re.search(pattern, narrative, re.IGNORECASE)
        if age_match:
            age = int(age_match.group(1))
            break

    if age is not None:
        if age <= 2:
            age_group = "0-2"
        elif age <= 6:
            age_group = "2-6"
        elif age <= 12:
            age_group = "6-12"
        else:
            age_group = "12-18"

    return age, age_group

def extract_gender(narrative):
    """Extract gender from pronouns"""
    she_count = len(re.findall(r'\bshe\b|\bher\b|\bhers\b', narrative, re.IGNORECASE))
    he_count = len(re.findall(r'\bhe\b|\bhim\b|\bhis\b', narrative, re.IGNORECASE))

    if she_count > he_count:
        return "female"
    elif he_count > she_count:
        return "male"
    return "unknown"

def extract_country(narrative, title):
    """Extract country from narrative and title"""
    # List of country/location patterns
    locations = {
        'Syria': ['Syria', 'Syrian', 'Aleppo', 'Damascus'],
        'Lebanon': ['Lebanon', 'Lebanese'],
        'Afghanistan': ['Afghanistan', 'Afghan', 'Kabul'],
        'Belgium': ['Belgium', 'Belgian', 'Brussels', 'Flemish'],
        'Democratic Republic of Congo': ['Congo', 'DRC', 'Bukavu'],
        'Pakistan': ['Pakistan'],
        'Germany': ['Germany', 'German'],
        'Iran': ['Iran'],
        'Turkey': ['Turkey'],
        'Greece': ['Greece'],
    }

    combined = narrative + " " + title
    for country, keywords in locations.items():
        for keyword in keywords:
            if keyword.lower() in combined.lower():
                return country

    return "Unknown"

def extract_vulnerability_flags(narrative, problems):
    """Extract vulnerability flags"""
    flags = set()

    if re.search(r'trauma|violence|abuse|PTSD|torture', narrative, re.IGNORECASE):
        flags.add('trauma')
    if re.search(r'separated|alone|unaccompanied|orphan|missing family', narrative, re.IGNORECASE):
        flags.add('separated_family')
    if re.search(r'traffick|smuggl|exploit', narrative, re.IGNORECASE):
        flags.add('trafficking_risk')
    if re.search(r'health|medical|disease|malnutrition|infected|ill', narrative, re.IGNORECASE):
        flags.add('health_issues')
    if re.search(r'language|communication|Arabic|French|English', narrative, re.IGNORECASE):
        flags.add('language_barrier')
    if re.search(r'document|identity|passport|birth certificate|papers', narrative, re.IGNORECASE):
        flags.add('documentation_gaps')
    if re.search(r'school|education|learning|academic', narrative, re.IGNORECASE):
        flags.add('education_interrupted')
    if re.search(r'housing|shelter|home|accommodation', narrative, re.IGNORECASE):
        flags.add('housing_instability')

    return sorted(list(flags))

def extract_domains(problems):
    """Extract unique domains from problems"""
    domains = set()
    for problem in problems:
        if 'domain' in problem and problem['domain']:
            domains.add(problem['domain'])
    return sorted(list(domains)) if domains else ["general"]

def case_type_from_filename(filename):
    """Extract case type from filename"""
    type_map = {
        'unaccompanied': 'unaccompanied',
        'family_conflict': 'family_conflict',
        'trauma': 'trauma',
        'runaway': 'runaway',
        'work_situation': 'child_labor',
        'justice': 'justice_system',
        'health': 'health',
        'reunification': 'reunification',
        'readmission': 'readmission',
        'mixed': 'mixed',
        'mixed2': 'mixed',
        'additional': 'additional',
        'complex': 'complex',
        'complex2': 'complex',
        'complex3': 'complex',
    }

    for key, value in type_map.items():
        if key in filename.lower():
            return value
    return "general"

def parse_case_file(filepath):
    """Parse a single case markdown file"""
    filename = filepath.name

    # Extract case ID from filename
    match = re.search(r'CASE_(\d+)', filename)
    if not match:
        return None

    case_id = f"CASE_{int(match.group(1)):03d}"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title
    title_match = re.search(r'# CASE \d+: (.+)', content)
    title = title_match.group(1) if title_match else "Unknown"

    # Extract narrative
    narrative = extract_text_between(content, "## Story/Narrative", "## Timeline")
    if not narrative:
        narrative = ""

    # Extract age and group
    age, age_group = extract_age_and_group(narrative)

    # Extract gender
    gender = extract_gender(narrative)

    # Extract country
    country = extract_country(narrative, title)

    # Extract case type
    case_type = case_type_from_filename(filename)

    # Parse timeline table
    timeline_rows = parse_markdown_table(content, "## Timeline of Events")
    timeline = []
    for row in timeline_rows:
        if 'Date' in row and 'Event' in row:
            timeline.append({
                'date': row['Date'],
                'event': row['Event']
            })

    # Parse problems table
    problems_rows = parse_markdown_table(content, "## Problems Identified")
    problems = []
    for row in problems_rows:
        if 'Problem' in row:
            problems.append({
                'problem': row.get('Problem', ''),
                'severity': row.get('Severity', 'medium').lower(),
                'domain': row.get('Domain', 'other'),
                'urgency': row.get('Urgency', 'medium').lower()
            })

    # Parse legal framework table
    legal_rows = parse_markdown_table(content, "## Legal Framework Applied")
    legal_framework = []
    for row in legal_rows:
        # Handle various column name variations
        law_key = next((k for k in ['Law/Regulation', 'Law/regulation', 'Law / Regulation'] if k in row), None)
        app_key = next((k for k in ['How It Applies', 'How it applies', 'How It Applies'] if k in row), None)
        party_key = next((k for k in ['Responsible Party', 'Responsible party'] if k in row), None)

        if law_key:
            legal_framework.append({
                'law_or_regulation': row[law_key],
                'application': row.get(app_key, 'Applied') if app_key else 'Applied',
                'responsible_party': row.get(party_key, 'Government') if party_key else 'Government'
            })

    # Parse solutions table
    solutions_rows = parse_markdown_table(content, "## Solutions Implemented")
    solutions = []
    for row in solutions_rows:
        sol_key = next((k for k in ['Solution', 'Description'] if k in row), None)
        if sol_key:
            solutions.append({
                'solution': row[sol_key],
                'timeline': row.get('Timeline', 'ongoing'),
                'outcomes': row.get('Outcomes', 'positive'),
                'success_metrics': row.get('Metrics', row.get('Success Metrics', 'achieved'))
            })

    # Extract tuteur obligations
    tuteur_section = extract_text_between(content, "## Tuteur Obligations", "## Lessons Learned")
    tuteur_obligations = []
    if tuteur_section:
        # Find numbered items
        items = re.findall(r'^\d+\.\s+\*\*(.+?)\*\*\s*-\s*(.+?)$', tuteur_section, re.MULTILINE)
        for title_txt, desc_txt in items:
            tuteur_obligations.append({
                'responsibility': title_txt,
                'description': desc_txt
            })

    # Extract lessons learned
    lessons_section = extract_text_between(content, "## Lessons Learned", "## Related Resources")
    lessons_learned = []
    if lessons_section:
        items = re.findall(r'^\d+\.\s+(.+?)$', lessons_section, re.MULTILINE)
        lessons_learned = items

    # Extract related resources
    resources_section = extract_text_between(content, "## Related Resources", None)
    related_resources = []
    if resources_section:
        items = re.findall(r'^-\s+\*\*(.+?)\*\*\s*-\s*(.+?)$', resources_section, re.MULTILINE)
        for name, desc in items:
            related_resources.append({
                'name': name,
                'description': desc
            })

    # Extract key events from timeline (first 5)
    key_events = []
    for event in timeline[:5]:
        key_events.append({
            'description': event['event'],
            'impact': 'documented'
        })

    # Extract vulnerability flags
    vulnerability_flags = extract_vulnerability_flags(narrative, problems)

    # Extract domains
    domains = extract_domains(problems)

    return {
        'case_id': case_id,
        'title': title,
        'case_type': case_type,
        'age_at_case': age,
        'age_group': age_group,
        'country': country,
        'gender': gender,
        'vulnerability_flags': vulnerability_flags,
        'story': {
            'situation': (narrative.split('\n')[0] if narrative else "")[:200] + "...",
            'timeline': timeline,
            'key_events': key_events
        },
        'problems_identified': problems,
        'legal_framework': legal_framework,
        'solutions_implemented': solutions,
        'tuteur_obligations': tuteur_obligations,
        'lessons_learned': lessons_learned,
        'related_resources': related_resources,
        'domains': domains,
        'case_status': 'documented'
    }

# Main execution
print("Parsing case files...")
case_files = sorted(cases_dir.glob("CASE_*.md"))
all_cases = []

# Indexing structures
by_type = defaultdict(list)
by_age = defaultdict(list)
by_domain = defaultdict(list)

for case_file in case_files:
    print(f"Processing {case_file.name}...", end=" ")
    try:
        case = parse_case_file(case_file)
        if case:
            all_cases.append(case)

            # Index by type
            by_type[case['case_type']].append(case['case_id'])

            # Index by age
            if case['age_group'] != 'unknown':
                by_age[case['age_group']].append(case['case_id'])

            # Index by domain
            for domain in case['domains']:
                by_domain[domain].append(case['case_id'])

            print("OK")
        else:
            print("FAILED (no case data)")
    except Exception as e:
        print(f"ERROR: {e}")

print(f"\nGenerated {len(all_cases)} cases")

# Save cases data
cases_output = output_dir / "cases-data.json"
with open(cases_output, 'w', encoding='utf-8') as f:
    json.dump(all_cases, f, indent=2, ensure_ascii=False)
print(f"Saved: {cases_output}")

# Save indexes
indexes = {
    'by_type': dict(by_type),
    'by_age': {
        '0-2': sorted(set(by_age.get('0-2', []))),
        '2-6': sorted(set(by_age.get('2-6', []))),
        '6-12': sorted(set(by_age.get('6-12', []))),
        '12-18': sorted(set(by_age.get('12-18', [])))
    },
    'by_domain': {k: sorted(set(v)) for k, v in by_domain.items()}
}

indexes_output = output_dir / "cases-indexes.json"
with open(indexes_output, 'w', encoding='utf-8') as f:
    json.dump(indexes, f, indent=2, ensure_ascii=False)
print(f"Saved: {indexes_output}")

# Validation report
print("\n=== Validation Report ===")
print(f"Total cases parsed: {len(all_cases)}/15")
print(f"\nCase types ({len(by_type)}):")
for case_type in sorted(by_type.keys()):
    print(f"  - {case_type}: {len(set(by_type[case_type]))} case(s)")

print(f"\nAge groups:")
for age_group in ['0-2', '2-6', '6-12', '12-18']:
    count = len(set(by_age.get(age_group, [])))
    print(f"  - {age_group}: {count} case(s)")

print(f"\nDomains ({len(by_domain)}):")
for domain in sorted(by_domain.keys()):
    print(f"  - {domain}: {len(set(by_domain[domain]))} case(s)")

print("\nTask complete!")
