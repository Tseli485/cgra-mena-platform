#!/usr/bin/env python3
import json
import re
from pathlib import Path

# Case metadata extracted from file headers and content
cases_data = [
    {
        "case_id": "CASE_001",
        "title": "Unaccompanied Minor - Syrian Refugee",
        "case_type": "unaccompanied",
        "age_at_case": 14,
        "age_group": "12-18",
        "origin_country": "Syria",
        "domains": ["documents-asylum", "health-medical"],
        "summary": "Amira, a 14-year-old Syrian minor, arrives alone at a border crossing after eight months of harrowing travel following her family home's destruction. With no documents and no family contact, she is detained, then appointed a tuteur who facilitates asylum, medical care, education, and eventual successful integration with family reconnection.",
        "file_path": "CASE_001_unaccompanied.md"
    },
    {
        "case_id": "CASE_002",
        "title": "Family Conflict and Child Welfare - Afghan Minor",
        "case_type": "family-conflict",
        "age_at_case": 13,
        "age_group": "12-18",
        "origin_country": "Afghanistan",
        "domains": ["family-reunion", "health-medical"],
        "summary": "An Afghan minor faces severe family conflict involving domestic violence, forced marriage attempts, and welfare concerns. The case explores safeguarding, family mediation, trauma recovery, and balancing protection with family restoration.",
        "file_path": "CASE_002_family_conflict.md"
    },
    {
        "case_id": "CASE_003",
        "title": "Severe Trauma and PTSD - Congolese Minor",
        "case_type": "trauma",
        "age_at_case": 16,
        "age_group": "12-18",
        "origin_country": "Congo",
        "domains": ["health-medical", "documents-asylum"],
        "summary": "A 16-year-old Congolese refugee presents with severe PTSD from witnessed violence and sexual abuse. The case emphasizes trauma-informed assessment, specialized mental health treatment, stabilization, and long-term recovery pathways.",
        "file_path": "CASE_003_trauma.md"
    },
    {
        "case_id": "CASE_004",
        "title": "Shelter Runaway - Moroccan Youth",
        "case_type": "shelter-runaway",
        "age_at_case": 16,
        "age_group": "12-18",
        "origin_country": "Morocco",
        "domains": ["documents-asylum", "health-medical"],
        "summary": "A 16-year-old Moroccan youth repeatedly runs from shelters due to trauma triggers and distrust of systems. The case addresses trust-building, individualized care plans, trauma-sensitive housing, and harm reduction.",
        "file_path": "CASE_004_runaway.md"
    },
    {
        "case_id": "CASE_005",
        "title": "Work Situation and Child Labor - Bengali Youth",
        "case_type": "work",
        "age_at_case": 15,
        "age_group": "12-18",
        "origin_country": "Bangladesh",
        "domains": ["work-employment", "health-medical"],
        "summary": "A 15-year-old Bengali youth engaged in exploitative labor to survive must transition from child labor to legitimate education and work pathways. The case covers labor law, remediation, skills training, and economic reintegration.",
        "file_path": "CASE_005_work_situation.md"
    },
    {
        "case_id": "CASE_006",
        "title": "Justice-Involved Youth - Nigerian Minor",
        "case_type": "justice-involved",
        "age_at_case": 14,
        "age_group": "12-18",
        "origin_country": "Nigeria",
        "domains": ["documents-asylum", "health-medical"],
        "summary": "A 14-year-old Nigerian minor has police contact and faces justice system involvement. The case explores diversion programs, rehabilitation, asylum implications, and trauma-informed juvenile justice approaches.",
        "file_path": "CASE_006_justice.md"
    },
    {
        "case_id": "CASE_007",
        "title": "Health Crisis - Chronic Illness Management in Migration",
        "case_type": "health",
        "age_at_case": 12,
        "age_group": "12-18",
        "origin_country": "Pakistan",
        "domains": ["health-medical", "documents-asylum"],
        "summary": "A 12-year-old with undiagnosed diabetes faces life-threatening complications during migration. The case demonstrates urgent medical assessment, chronic disease management in displacement, medication access, and integration with legal/social services.",
        "file_path": "CASE_007_health.md"
    },
    {
        "case_id": "CASE_008",
        "title": "Family Reunification - Legal & Emotional Barriers",
        "case_type": "reunification",
        "age_at_case": 15,
        "age_group": "12-18",
        "origin_country": "Iraq",
        "domains": ["family-reunion", "documents-asylum"],
        "summary": "A 15-year-old separated Iraqi minor navigates complex family reunification processes, documentation barriers, emotional preparation, and the realities of family reunion after prolonged separation.",
        "file_path": "CASE_008_reunification.md"
    },
    {
        "case_id": "CASE_009",
        "title": "Readmission & Safe Third Country - Legal Borderlands",
        "case_type": "readmission",
        "age_at_case": 16,
        "age_group": "12-18",
        "origin_country": "Ethiopia",
        "domains": ["documents-asylum", "health-medical"],
        "summary": "A 16-year-old Ethiopian minor faces readmission claims and safe third country determinations. The case explores procedural safeguards, vulnerability assessments, appeals mechanisms, and protection gaps in bilateral agreements.",
        "file_path": "CASE_009_readmission.md"
    },
    {
        "case_id": "CASE_010",
        "title": "Mixed Vulnerabilities 1 - Trauma, Family Conflict & Health",
        "case_type": "mixed",
        "age_at_case": 11,
        "age_group": "6-12",
        "origin_country": "Somalia",
        "domains": ["health-medical", "family-reunion", "documents-asylum"],
        "summary": "An 11-year-old Somali child presents intersecting vulnerabilities: trauma from armed conflict, family conflict with a remaining guardian, and chronic health conditions. The case requires integrated, multi-domain coordination.",
        "file_path": "CASE_010_mixed.md"
    },
    {
        "case_id": "CASE_011",
        "title": "Mixed Vulnerabilities 2 - Trafficking, Trauma & Education",
        "case_type": "mixed",
        "age_at_case": 7,
        "age_group": "2-6",
        "origin_country": "Burkina Faso",
        "domains": ["health-medical", "documents-asylum", "work-employment"],
        "summary": "A 7-year-old trafficking survivor from Burkina Faso presents severe trauma, psychological delays, communication difficulties, and health vulnerabilities. The case emphasizes protection, stabilization, and foundational development.",
        "file_path": "CASE_011_mixed2.md"
    },
    {
        "case_id": "CASE_012",
        "title": "Complex Case - Legal, Employment & Family",
        "case_type": "mixed",
        "age_at_case": 15,
        "age_group": "12-18",
        "origin_country": "Venezuela",
        "domains": ["work-employment", "documents-asylum", "family-reunion"],
        "summary": "A 15-year-old Venezuelan minor navigates asylum uncertainty, family separation, employment pressures, and legal status questions. The case requires coordinated legal, social, and economic intervention.",
        "file_path": "CASE_012_additional.md"
    },
    {
        "case_id": "CASE_013",
        "title": "Complex Scenario 1 - Approaching Legal Adulthood",
        "case_type": "mixed",
        "age_at_case": 17,
        "age_group": "12-18",
        "origin_country": "Afghanistan",
        "domains": ["work-employment", "documents-asylum", "family-reunion"],
        "summary": "A 17-year-old Afghan youth approaching age of majority faces employment barriers, family separation, and uncertain asylum status. The case emphasizes transition planning and immediate legal/economic security.",
        "file_path": "CASE_013_complex.md"
    },
    {
        "case_id": "CASE_014",
        "title": "Complex Scenario 2 - Religious Persecution & Integration",
        "case_type": "mixed",
        "age_at_case": 9,
        "age_group": "6-12",
        "origin_country": "Eritrea",
        "domains": ["documents-asylum", "health-medical", "family-reunion"],
        "summary": "A 9-year-old Eritrean minor fleeing religious persecution faces education gaps, cultural integration challenges, family communication attempts, and asylum assessment. The case balances immediate protection with long-term integration.",
        "file_path": "CASE_014_complex2.md"
    },
    {
        "case_id": "CASE_015",
        "title": "Complex Scenario 3 - Ethnic Minority & Health Exploitation",
        "case_type": "mixed",
        "age_at_case": 13,
        "age_group": "12-18",
        "origin_country": "Myanmar",
        "domains": ["work-employment", "health-medical", "family-reunion"],
        "summary": "A 13-year-old Burmese Karen ethnic minority faces employment exploitation, chronic health issues, family reunification complexity, and language barriers. The case requires culturally-informed protection and integrated services.",
        "file_path": "CASE_015_complex3.md"
    }
]

# Extract unique values for indexes
case_types = sorted(list(set([c["case_type"] for c in cases_data])))
age_groups = sorted(list(set([c["age_group"] for c in cases_data])))
domains = sorted(list(set([d for c in cases_data for d in c["domains"]])))
countries = sorted(list(set([c["origin_country"] for c in cases_data])))

# Create the index structure
index = {
    "cases": cases_data,
    "case_types": case_types,
    "age_groups": age_groups,
    "domains": domains,
    "origin_countries": countries,
    "metadata": {
        "total_cases": len(cases_data),
        "last_updated": "2026-06-02",
        "version": "1.0"
    }
}

# Write to file
output_path = "C:\\Users\\trian\\OneDrive\\Desktop\\CGRA\\docs\\cases\\cases_index.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

print(f"Index created with {len(cases_data)} cases")
print(f"Case types: {len(case_types)}")
print(f"Age groups: {len(age_groups)}")
print(f"Domains: {len(domains)}")
print(f"Countries: {len(countries)}")
print(f"Output: {output_path}")
