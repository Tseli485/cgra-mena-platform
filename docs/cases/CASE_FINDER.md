# CGRA Case Finder Guide
## Comprehensive Case Navigation, Indexing & Cross-Reference System

**Version:** 1.0  
**Last Updated:** June 2, 2026  
**Purpose:** Help practitioners locate, analyze, and apply case lessons across the CGRA case library.

---

## Table of Contents

1. [Quick Start: Decision Tree](#quick-start-decision-tree)
2. [Index Guide: How to Navigate](#index-guide-how-to-navigate)
3. [Case Type Index](#case-type-index)
4. [Age Group Index](#age-group-index)
5. [Domain Index](#domain-index)
6. [Cross-Reference Examples](#cross-reference-examples)
7. [Using Cases for Training](#using-cases-for-training)
8. [Adding New Cases](#adding-new-cases)
9. [JSON Structure & PWA Integration](#json-structure--pwa-integration)

---

## Quick Start: Decision Tree

**Choose your starting point:**

### "I have a specific child situation right now"

**Step 1:** Identify the **primary characteristic** of the child's situation:
- **Age?** → Use [Age Group Index](#age-group-index)
- **Case Type?** (trauma, work, family conflict, etc.) → Use [Case Type Index](#case-type-index)
- **Main Domain?** (asylum, health, employment) → Use [Domain Index](#domain-index)

**Step 2:** Read 2-3 matching cases to understand different approaches.

**Step 3:** Look at "Lessons Learned" section in each case to extract transferable strategies.

### "I'm preparing training materials"

→ Jump to [Using Cases for Training](#using-cases-for-training)

### "I need to add a new case"

→ Jump to [Adding New Cases](#adding-new-cases)

### "I'm building a PWA feature"

→ Jump to [JSON Structure & PWA Integration](#json-structure--pwa-integration)

---

## Index Guide: How to Navigate

The CGRA case library includes **15 documented cases** organized by three primary indexes:

| Index Type | Purpose | Use When | Output |
|------------|---------|----------|--------|
| **Case Type Index** | Organize cases by problem classification | You know the problem type (e.g., trauma, unaccompanied) | 1-4 cases per type |
| **Age Group Index** | Organize cases by child's age | You need developmental/age-appropriate approaches | 3-8 cases per group |
| **Domain Index** | Organize cases by service area | You need expertise in one domain (asylum, health) | 6-12 cases per domain |

### How the Indexes Relate

Many cases appear in **multiple indexes** because real situations are complex. For example:

**CASE_003 (Congolese Minor with Trauma)** appears in:
- Case Type Index: **trauma**
- Age Group Index: **12-18**
- Domain Index: **health-medical**, **documents-asylum**

This means if you're working on:
- A trauma case with a teen → Case 003 is highly relevant
- A health crisis in an asylum context → Case 003 shows integration
- A 16-year-old with multiple domains → Case 003 demonstrates coordination

---

## Case Type Index

The CGRA framework identifies **10 case types**. Each addresses a distinct primary problem:

### Single-Domain Case Types (8 types)

#### **Unaccompanied** (CASE_001)
- **Definition:** Child arrives or is present without a parent or legal guardian
- **Focus:** Border intake, identification, guardianship appointment, initial stabilization
- **Key Tuteur Role:** Legal representation liaison, documenting identity
- **Sample Situation:** "A 14-year-old Syrian arrives at the border alone with no documents"
- **Cases:** 1 core case
- **Read for:** Border procedures, guardianship assignment, trauma-informed intake

#### **Family Conflict** (CASE_002)
- **Definition:** Primary issue is conflict within the family unit (domestic violence, forced marriage, abuse)
- **Focus:** Safety assessment, family mediation, trauma recovery, balancing protection vs. restoration
- **Key Tuteur Role:** Safety advocacy, family meetings coordination, behavioral support
- **Sample Situation:** "An Afghan teen faces domestic violence and forced marriage threats from a parent"
- **Cases:** 1 core case
- **Read for:** Family assessment, mediation frameworks, safety planning

#### **Trauma/PTSD** (CASE_003)
- **Definition:** Child presents acute or complex PTSD from witnessed violence, abuse, or disaster
- **Focus:** Trauma assessment, specialized mental health treatment, stabilization, trust-building
- **Key Tuteur Role:** Emotional support, therapeutic coordination, safe environment maintenance
- **Sample Situation:** "A Congolese teen exhibits severe PTSD after witnessing armed conflict"
- **Cases:** 1 core case
- **Read for:** Trauma screening tools, mental health integration, stabilization phases

#### **Shelter Runaway** (CASE_004)
- **Definition:** Child repeatedly leaves or avoids formal shelter/institutional care
- **Focus:** Understanding flight triggers, individualized care, trauma-sensitive housing, risk reduction
- **Key Tuteur Role:** Trust-building, care plan customization, communication with shelter staff
- **Sample Situation:** "A Moroccan teen runs from shelters due to trauma triggers and institutional distrust"
- **Cases:** 1 core case
- **Read for:** Institutional trauma, individualization, alternative housing models

#### **Work/Child Labor** (CASE_005)
- **Definition:** Child is engaged in exploitative labor or economic survival strategies
- **Focus:** Labor law enforcement, remediation, skills transition, economic reintegration
- **Key Tuteur Role:** Labor rights advocacy, alternative pathways, skills training coordination
- **Sample Situation:** "A Bengali teen works in sweatshop conditions to survive; needs education pathway"
- **Cases:** 1 core case
- **Read for:** Labor law, ILO standards, vocational transition, economic empowerment

#### **Justice-Involved** (CASE_006)
- **Definition:** Child has police contact, arrest, or involvement in justice system
- **Focus:** Diversion programs, rehabilitation, legal defense, trauma-informed juvenile justice
- **Key Tuteur Role:** Legal advocacy, system navigation, reintegration support, protective factors
- **Sample Situation:** "A Nigerian teen has police contact; needs diversion from formal justice involvement"
- **Cases:** 1 core case
- **Read for:** Diversion frameworks, juvenile justice alternatives, trauma and offense connection

#### **Health/Medical Crisis** (CASE_007)
- **Definition:** Child has acute or chronic illness requiring urgent or ongoing medical management
- **Focus:** Medical assessment, disease management, medication access, health system integration
- **Key Tuteur Role:** Medical appointment attendance, treatment adherence, system coordination
- **Sample Situation:** "A Pakistani child with undiagnosed diabetes faces life-threatening complications"
- **Cases:** 1 core case
- **Read for:** Health screening protocols, chronic disease in migration, medication access

#### **Reunification** (CASE_008)
- **Definition:** Primary goal is restoring family unity after separation
- **Focus:** Family tracing, documentation, emotional preparation, post-reunion adjustment
- **Key Tuteur Role:** Family contact facilitation, preparation coaching, long-term adjustment support
- **Sample Situation:** "An Iraqi teen separated from parents; working toward family reunion"
- **Cases:** 1 core case
- **Read for:** Family tracing procedures, reunification timelines, psychological preparation

#### **Readmission/Safe Third Country** (CASE_009)
- **Definition:** Child faces readmission claims or safe third country determinations
- **Focus:** Procedural safeguards, vulnerability assessment, appeals, protection gaps
- **Key Tuteur Role:** Legal representation, evidence gathering, appeal support
- **Sample Situation:** "An Ethiopian teen faces readmission to a neighboring country; needs appeal support"
- **Cases:** 1 core case
- **Read for:** Readmission law, safe third country assessments, legal strategies

### Complex/Mixed Case Types (1 type; 6 cases)

#### **Mixed Vulnerabilities** (CASES_010, 011, 012, 013, 014, 015)
- **Definition:** Multiple primary issues requiring integrated, simultaneous intervention
- **Focus:** Prioritization, coordination across domains, sequencing of interventions
- **Key Tuteur Role:** Case coordination, cross-domain liaison, holistic planning
- **Sample Situations:**
  - "An 11-year-old Somali child with trauma, family conflict, AND health conditions"
  - "A 7-year-old trafficking survivor with psychological delays AND health vulnerabilities"
  - "A 15-year-old Venezuelan navigating asylum, family separation, AND employment pressure"
- **Cases:** 6 core cases covering different age groups and vulnerability combinations
- **Read for:** Prioritization frameworks, integrated service delivery, holistic case planning

---

## Age Group Index

Child development affects both vulnerability and intervention approach. The CGRA framework uses **3 age bands**:

### **Ages 2-6: Early Childhood**
**Cases:** CASE_011 (7-year-old trafficking survivor)

**Characteristics:**
- Limited verbal articulation of needs
- Attachment and stability paramount
- Play-based assessment and intervention
- Physical developmental delays common post-trauma
- Foundation for all future development

**Tuteur Focus:**
- Consistent, nurturing presence
- Non-verbal communication skills
- Connection with family/trusted caregivers
- Play observation for assessment
- Early intervention services coordination

**Key Lessons from This Age Group:**
- Small consistent contacts build trust faster than formal procedures
- Stabilization comes before complex cognitive interventions
- Family connection (even limited) is healing for young children
- Chronic health issues in this age group require intensive coordination

---

### **Ages 6-12: Middle Childhood**
**Cases:** CASE_010 (11-year-old), CASE_014 (9-year-old)

**Characteristics:**
- Can articulate needs but may hide emotional distress
- Peer relationships becoming important
- School is primary social environment
- Concrete thinking (less abstract reasoning)
- Identity formation beginning but flexible

**Tuteur Focus:**
- School coordination and advocacy
- Peer relationship support
- Concrete, step-by-step explanation of processes
- Supervision and structure
- Skill-building and competence support

**Key Lessons from This Age Group:**
- School enrollment provides structure and normalcy
- Peer relationships are therapeutic
- Cultural/spiritual practices provide identity continuity
- Concrete problem-solving works better than abstract planning
- Age-appropriate honesty about processes builds trust

---

### **Ages 12-18: Adolescence**
**Cases:** CASE_001 (14), CASE_002 (13), CASE_003 (16), CASE_004 (16), CASE_005 (15), CASE_006 (14), CASE_007 (12), CASE_008 (15), CASE_009 (16), CASE_012 (15), CASE_013 (17), CASE_015 (13)

**Characteristics:**
- Identity formation central to development
- Peer relationships critical
- Abstract thinking emerges; questioning authority normal
- Biological/sexual maturation; sexual vulnerability
- Future planning becoming possible
- Legal capacity varying by jurisdiction (14-18 often threshold)

**Tuteur Focus:**
- Education & future planning
- Identity/cultural affirmation
- Legal capacity & informed consent
- Sexual health & protection
- Independence skill-building
- Peer support networks
- Future transition planning (18+)

**Key Lessons from This Age Group:**
- Involving teens in decision-making improves outcomes
- Identity affirmation (cultural, religious) supports stability
- Legal status uncertainty causes significant stress; clarity is crucial
- Employment/education pathways provide hope and structure
- Transitional planning needed 12+ months before age of majority
- Peer networks often more influential than adults

---

## Domain Index

The CGRA framework identifies **4 primary service domains**. These represent areas where children need support and where laws/procedures apply.

### **Domain 1: Documents & Asylum** (9 cases)
Cases: 001, 003, 004, 006, 007, 009, 010, 013, 014

**Issues Addressed:**
- Identity documentation (birth certificate, passport, national ID)
- Travel document validity and fraud detection
- Asylum application procedures
- Refugee status determination
- Safe third country claims
- Readmission procedures
- Immigration detention and release
- Legal representation in immigration proceedings
- Documentation barriers to other services (school, work, health)

**Typical Tuteur Actions:**
- Gathering identity documents (or explaining lack thereof)
- Liaison with immigration counsel
- Appointment attendance and interpretation
- Preparation for asylum interviews
- Advocating for legal representation
- Appealing negative decisions

**Cross-Domain Impact:**
- Lack of documents blocks school enrollment (education domain)
- Immigration uncertainty blocks employment (work domain)
- Asylum status affects health coverage (health domain)
- Family reunification requires proof of relationship (family domain)

**Key Laws/Frameworks:** CRC, 1951 Refugee Convention, EU Directive 2011/95/EU, national asylum laws, safe third country protocols

---

### **Domain 2: Health & Medical** (11 cases)
Cases: 001, 003, 004, 006, 007, 010, 011, 014, plus multiple mixed cases

**Issues Addressed:**
- Medical screening and assessment
- Infectious disease (TB, COVID, etc.)
- Malnutrition and food security
- Chronic disease management (diabetes, asthma, etc.)
- Mental health and trauma assessment
- Psychological counseling and therapy
- Medication access and adherence
- Reproductive health and contraception
- Sexual violence response
- Disability assessment
- Health insurance/coverage

**Typical Tuteur Actions:**
- Arranging medical appointments
- Accompanying to health visits
- Interpretation and explanation of diagnoses
- Monitoring medication adherence
- Food security advocacy
- Mental health referrals
- School-based health coordination
- Advocating for free/subsidized care

**Cross-Domain Impact:**
- Untreated trauma blocks learning (education)
- Malnutrition affects concentration and school performance
- Health insurance linked to immigration status
- Health providers may encounter trafficking/abuse and must report
- Chronic disease affects employment capacity

**Key Laws/Frameworks:** CRC, WHO health standards, national health insurance, mandatory reporting laws, occupational health standards

---

### **Domain 3: Family Reunion & Contact** (9 cases)
Cases: 002, 008, 010, 011, 012, 013, 014, 015, plus CASE_001

**Issues Addressed:**
- Family tracing and location
- Safe communication channels
- Emotional preparation for reunion
- Documentation of family relationships
- Sponsorship and legal family reunification
- Post-reunion adjustment and support
- Long-distance family relationships
- Family mediation and conflict resolution
- Parental contact when safety unclear
- Sibling reunion and separation

**Typical Tuteur Actions:**
- Initiating family tracing through Red Crescent/official channels
- Facilitating safe communication (letters, calls, video)
- Preparing child emotionally for reunion
- Gathering documentation of family relationships
- Advocating for expedited reunification
- Supporting post-reunion adjustment
- Managing expectations and realities
- Mediation when family relationships are conflicted

**Cross-Domain Impact:**
- Family contact restores emotional well-being and hope
- Family separation drives some survival strategies (work, risk-taking)
- Family reunification may require immigration/legal processes
- Family culture affects health beliefs and practices
- Family pressure may affect school/work engagement

**Key Laws/Frameworks:** CRC (Article 9, 10), Family reunification laws, Red Crescent protocols, safe passage agreements, family mediation standards

---

### **Domain 4: Work & Employment** (5 cases)
Cases: 005, 012, 013, 015, plus CASE_001 (internship)

**Issues Addressed:**
- Child labor identification and prevention
- Exploitative labor conditions
- Legal work authorization and age requirements
- Vocational training and skills development
- Apprenticeship and internship pathways
- Employment documentation and contracts
- Workplace safety and rights
- Wage theft and payment issues
- Work-study balance
- Transition from informal to formal employment

**Typical Tuteur Actions:**
- Assessing work situation and safety
- Advocating for labor standards enforcement
- Exploring education/training alternatives
- Coordinating with vocational programs
- Supporting work permit applications
- Monitoring working conditions
- Supporting wage claims
- Building employment confidence

**Cross-Domain Impact:**
- Work obligations block school attendance
- Employment income may be family survival strategy
- Work provides identity and social connection
- Exploitative work causes trauma and health issues
- Work experience supports independence and future planning
- Legal work authorization requires immigration status clarity

**Key Laws/Frameworks:** ILO Conventions 182 & 138, national child labor laws, national employment standards, minimum wage laws, workplace safety regulations, vocational training programs

---

## Cross-Reference Examples

### Scenario: "I have a 14-year-old with trauma and family conflict"

**Using the indexes:**

| Index | Match | Cases |
|-------|-------|-------|
| **Age Group** | 12-18 adolescent | 12 cases available |
| **Case Type** | Trauma AND Family Conflict | 1 case directly (CASE_003 trauma) + 1 case directly (CASE_002 family conflict) + 2 mixed cases |
| **Domain** | Health/Medical (trauma) + Family Reunion (conflict) | Cases 001, 002, 003, 010, 012, 014, 015 |

**Recommended reading order:**

1. **CASE_002** (Family Conflict, Afghan 13-yo) → Shows family mediation and safety planning
2. **CASE_003** (Trauma/PTSD, Congolese 16-yo) → Shows trauma assessment and mental health integration
3. **CASE_010** (Mixed: 11-yo with trauma, conflict, health) → Shows how to coordinate multiple domains
4. **CASE_015** (Mixed: 13-yo with work, health, family) → Shows how trauma affects work/family intersection

**Key Lessons to Extract:**
- From CASE_002: Family mediation requires safety-first approach; both parent safety and child safety
- From CASE_003: Trauma work must be trauma-informed; trust takes months
- From CASE_010: Addressing one domain (e.g., family) affects others (e.g., trauma recovery)
- From CASE_015: Cultural context affects both trauma and family relationships

---

### Scenario: "I need to help a 7-year-old trafficking survivor"

**Using the indexes:**

| Index | Match | Cases |
|-------|-------|-------|
| **Age Group** | 2-6 early childhood | 1 case available (CASE_011) |
| **Case Type** | Mixed (trafficking + trauma + development delay) | CASE_011 directly |
| **Domain** | Health/Medical + Documents/Asylum + Work/Employment | CASE_011 + context from others |

**Recommended reading order:**

1. **CASE_011** (Mixed: 7-year-old trafficking survivor) → Directly applicable
2. **CASE_003** (Trauma, 16-yo) → Shows trauma assessment depth; apply age-appropriately
3. **CASE_001** (Unaccompanied, 14-yo) → Shows guardian appointment and stabilization

**Key Lessons to Extract:**
- From CASE_011: Very young children need consistent, safe relationships more than procedures
- From CASE_003: Trauma assessment takes time; trust is prerequisite
- From CASE_001: Guardian (tuteur) becomes the anchor for safety

**Special Considerations for This Age:**
- Play-based communication preferred over direct questioning
- Attachment figures critical; stabilization before investigation
- Short-term, concrete plans more effective than long-term
- Family connection (if safe) is healing

---

### Scenario: "A 16-year-old needs work authorization but faces immigration uncertainty"

**Using the indexes:**

| Index | Match | Cases |
|-------|-------|-------|
| **Age Group** | 12-18 adolescent | 12 cases available |
| **Case Type** | Work (primary) + Readmission/Asylum (secondary) | CASE_005 (work) + CASE_009 (readmission) |
| **Domain** | Work/Employment + Documents/Asylum | CASE_005, 009, 012, 013 |

**Recommended reading order:**

1. **CASE_005** (Work, Bengali 15-yo) → Shows transition from exploitative to legal work
2. **CASE_009** (Readmission, Ethiopian 16-yo) → Shows asylum uncertainty complications
3. **CASE_013** (Mixed: Afghan 17-yo, approaching majority) → Shows future planning under uncertainty
4. **CASE_001** (Unaccompanied, 14-yo) → Shows successful work permit after asylum granted

**Key Lessons to Extract:**
- From CASE_005: Work authorization often requires immigration clarity first
- From CASE_009: Readmission threat paralyzes planning; legal certainty needed
- From CASE_013: Approaching age 18; immediate action required
- From CASE_001: Work can be empowering; internships build confidence

**Critical Action:** Resolve immigration status FIRST before job training/placement

---

## Using Cases for Training

### Practitioner Training Modules

The CGRA case library can structure training across **5 competency areas**:

#### **Module 1: Intake & Initial Assessment** (3 hours)
**Primary Cases:** CASE_001 (border intake), CASE_003 (trauma screening), CASE_011 (early child assessment)

**Learning Objectives:**
- Conduct trauma-informed intake
- Identify immediate needs vs. long-term issues
- Recognize trafficking and exploitation signs
- Assign appropriate guardianship

**Activities:**
- Read Case 001 narrative; discuss: "What would you assess in first 24 hours?"
- Watch video or role-play: Initial interview with CASE_011 child (7-year-old)
- Review CASE_003 trauma screening; identify key indicators
- Debrief: How does age affect intake approach?

**Competency Check:**
- Can you explain why Case 001 required 2-week detention assessment vs. immediate release?
- Why did Case 011 require play-based assessment rather than direct questioning?

---

#### **Module 2: Domain-Specific Intervention** (4 hours × 4 domains = 16 hours)

**Domain 2A: Documents & Asylum** (4 hours)
- **Primary Cases:** CASE_001, 009
- **Learning Objectives:** Asylum procedures, safe third country claims, document procurement
- **Activities:** Case 001 walk-through timeline; debate Case 009 readmission assessment
- **Role-Play:** "Your client faces readmission; how do you build the appeal?"

**Domain 2B: Health & Medical** (4 hours)
- **Primary Cases:** CASE_007 (chronic disease), CASE_003 (trauma/mental health)
- **Learning Objectives:** Health screening, disease management, mental health integration
- **Activities:** Case 007 case conference; Case 003 trauma treatment planning
- **Role-Play:** "Your client won't take insulin; what do you do?"

**Domain 2C: Family & Reunion** (4 hours)
- **Primary Cases:** CASE_008 (reunification), CASE_002 (family conflict)
- **Learning Objectives:** Family tracing, reunion preparation, conflict mediation
- **Activities:** Case 008 timeline analysis; Case 002 mediation role-play
- **Role-Play:** "Parents want to arrange forced marriage; how do you intervene?"

**Domain 2D: Work & Employment** (4 hours)
- **Primary Cases:** CASE_005 (child labor), CASE_013 (approaching majority)
- **Learning Objectives:** Labor standards, vocational pathways, work authorization
- **Activities:** Case 005 labor rights analysis; Case 013 transition planning
- **Role-Play:** "Client is 17.5 and must work; how do you create safety?"

---

#### **Module 3: Complex Case Coordination** (6 hours)
**Primary Cases:** CASE_010 (11-yo), CASE_012 (15-yo), CASE_015 (13-yo)

**Learning Objectives:**
- Prioritize when multiple domains need attention
- Coordinate across services
- Sequence interventions logically
- Manage trade-offs and conflicts

**Activities:**
1. **Case 010 Prioritization:** "Trauma, family conflict, AND health crisis. What's first? Why?"
   - Individual ranking (5 min)
   - Small group discussion (15 min)
   - Full group debrief with expert input (10 min)

2. **Case 012 Cross-Domain Mapping:** "Map all the services this Venezuelan 15-yo needs"
   - Visual diagram: Draw connections between domains
   - Identify bottlenecks and dependencies
   - Discuss coordination mechanisms

3. **Case 015 Conflict Resolution:** "If work interferes with school; family pressure exists; health is fragile—what wins?"
   - Debate format: two groups propose different prioritization
   - Present research evidence from cases
   - Synthesize child-centered approach

**Competency Check:**
- Can you create a 6-month action plan for a multi-domain case?
- Can you explain why one intervention might need to wait for another?

---

#### **Module 4: Tuteur/Guardian Roles & Responsibilities** (3 hours)
**Primary Cases:** CASE_001 (Hélène's role), CASE_003, CASE_008

**Learning Objectives:**
- Understand guardian legal obligations
- Balance advocacy with support
- Build effective relationships
- Maintain appropriate boundaries

**Activities:**
1. **Case 001 Deep Dive:** Read "Tuteur Obligations" section
   - What are Hélène's 9 key responsibilities?
   - Which are legal vs. relational?
   - How did she prioritize?

2. **Guardian Scenarios:** Present 3 real dilemmas
   - "The 14-year-old wants to drop out of school to work; her mother pressures this. What's your role?"
   - "Your 16-year-old client is in love with an inappropriate person. How do you respond?"
   - "You discover the family wants to marry off your 13-year-old. What steps do you take?"

3. **Relationship Building Discussion:**
   - How did Hélène (CASE_001) build trust?
   - How does trauma (CASE_003) affect relationship development?
   - What are professional boundaries?

---

#### **Module 5: Age-Specific Development & Approaches** (3 hours)
**Primary Cases:** CASE_011 (age 7), CASE_010 (age 11), CASE_013 (age 17)

**Learning Objectives:**
- Understand how age shapes needs and intervention
- Adapt communication and planning by developmental stage
- Support healthy development despite adversity

**Activities:**
1. **Age Band Comparison:**
   - Watch/read 3 client interactions (early child, middle child, teen)
   - Small groups: "How would YOU communicate differently with each?"
   - Discuss: What's the same? What changes?

2. **Development Disruption Analysis:**
   - Case 011: How does trafficking affect a 7-year-old's development?
   - Case 010: How do multiple adversities affect an 11-year-old?
   - Case 013: How does age-of-majority timeline pressure a 17-year-old?

3. **Future Planning by Age:**
   - For a 7-year-old: What does "future planning" even mean?
   - For an 11-year-old: What can you realistically plan?
   - For a 17-year-old: What MUST you plan before age 18?

---

### Train-the-Trainer Application

**For supervisors/program directors:**

1. **Case Assignment by Experience Level:**
   - **Novice practitioners:** Start with CASE_001 or CASE_011 (clear narratives, actionable lessons)
   - **Intermediate:** CASE_002, 003, 007 (more complex, require clinical judgment)
   - **Advanced:** CASE_010, 012, 015 (multi-domain coordination, competing priorities)

2. **Case Study Questions (for written/oral exam):**

   **Basic Level (Novice):**
   - "What are the 9 core responsibilities of Amira's tuteur in CASE_001?"
   - "List 5 problems identified in CASE_003. Rank by severity."
   - "In CASE_007, why was the diabetes diagnosis delayed?"

   **Intermediate Level:**
   - "Compare the family involvement in CASE_002 and CASE_008. What's different?"
   - "Create a timeline for CASE_009. Where is the critical decision point?"
   - "In CASE_005, what legal frameworks protect this child's rights?"

   **Advanced Level:**
   - "Design a 12-month intervention for a case like CASE_012. Justify your sequencing."
   - "Analyze CASE_015: If domains conflict, which takes priority? Defend your answer."
   - "Create a policy brief on lessons from CASE_010 for a ministry of child protection."

3. **Case Discussion Prompts:**
   - "What would you do differently in this case?"
   - "What early warning signs might you have missed?"
   - "What resources are missing from this practitioner's toolkit?"
   - "How did culture/religion affect outcomes in this case?"

---

### Self-Directed Learning Pathway

**For practitioners working independently:**

**Week 1: Foundation**
- Read: CASE_001 (clear, successful case)
- Reflect: "What made this case work?"
- Journal: "How is my current case similar/different?"

**Week 2: Complexity**
- Read: CASE_003 (trauma) OR CASE_002 (family)—choose your weak area
- Study: Compare with CASE_001
- Reflect: "What new strategies would I try?"

**Week 3: Integration**
- Read: One mixed case (CASE_010, 012, or 015)
- Study: How multiple domains interact
- Journal: "What's my biggest challenge in coordinating domains?"

**Week 4: Application**
- Review your current caseload through lens of CGRA cases
- Select one case; develop new intervention plan
- Share with supervisor/peer group

---

## Adding New Cases

The CGRA case library is **living documentation**. As practitioners implement the framework, new cases should be added to strengthen collective learning.

### When to Document a New Case

Document a case when:

1. **It represents a new problem type or variation** not well-covered in the 15 existing cases
2. **It achieved unusual success** or navigated significant obstacles effectively
3. **It combines domains in a new way** (e.g., disability + gender-based violence + asylum)
4. **It's culturally or geographically specific** and enriches the library's diversity
5. **It includes at least 6-12 months of data** for longitudinal insight

**Do NOT document:**
- Active/ongoing cases (wait until closure or 12+ months in)
- Cases without informed consent from the child and guardians
- Cases where outcome is unknown

### Case Documentation Template

**File Naming Convention:**
```
CASE_[NUMBER]_[DESCRIPTOR].md
Example: CASE_016_deaf_minor_asylum.md
```

**Minimum Content Required:**

```markdown
# CASE [NUMBER]: [Title]

## Story/Narrative
[200+ word narrative of the child's journey, as per CASE_001 example]

## Timeline of Events
[Table with dates and key events]

## Problems Identified
[Table with Problem, Description, Severity, Domain, Urgency]

## Legal Framework Applied
[Table with Law/Regulation, Application, Responsible Party, Status]

## Solutions Implemented
[Table with Solution, Description, Timeline, Outcomes, Metrics]

## Tuteur Obligations
[If applicable: numbered list of guardian's specific responsibilities]

## Lessons Learned
[Numbered list with lesson, context, and application to similar cases]

## Resources Utilized
[Documents, organizations, references that were critical]

## Metadata
[Created date, author, status, version, tags, related cases]
```

### Submission Process

1. **Draft the case** using the template above
2. **Anonymize thoroughly:**
   - Change all names (child, family, tuteur, organizations unless fictional)
   - Change specific locations to region/country level
   - Change specific dates to relative timeframes (e.g., "6 months after arrival")
   - Change identifying details (scars, unique family structures, etc.)
3. **Get informed consent** from:
   - The child (age-appropriate conversation)
   - Parent/guardian
   - Tuteur (if applicable)
   - Your organization's legal/ethics team
4. **Peer review:**
   - Submit to 2 experienced practitioners
   - Incorporate feedback
   - Verify legal framework accuracy
5. **Submit to case library manager** with consent forms and peer review
6. **Integrate into** cases_index.json once approved

### Integration Checklist

Once approved, the new case must be:

- [ ] Added to docs/cases/ folder
- [ ] Added to cases_index.json with full metadata
- [ ] Cross-referenced in relevant section of CASE_FINDER.md
- [ ] Summarized in a GitHub issue (if repo-tracked)
- [ ] Announced to training coordinator for curriculum updates
- [ ] Indexed for PWA search/filter feature

---

## JSON Structure & PWA Integration

The **cases_index.json** file is the central data source for:
- Case search and filtering in the PWA
- Dynamic case list generation
- Cross-reference lookups
- Training module assembly

### JSON Schema

```json
{
  "cases": [
    {
      "case_id": "CASE_001",
      "title": "Unaccompanied Minor - Syrian Refugee",
      "case_type": "unaccompanied",
      "age_at_case": 14,
      "age_group": "12-18",
      "origin_country": "Syria",
      "domains": ["documents-asylum", "health-medical"],
      "summary": "[150-300 word overview]",
      "file_path": "CASE_001_unaccompanied.md"
    },
    ...
  ],
  "case_types": [
    "unaccompanied",
    "family-conflict",
    "trauma",
    "shelter-runaway",
    "work",
    "justice-involved",
    "health",
    "reunification",
    "readmission",
    "mixed"
  ],
  "age_groups": ["2-6", "6-12", "12-18"],
  "domains": [
    "documents-asylum",
    "family-reunion",
    "health-medical",
    "work-employment"
  ],
  "origin_countries": [
    "Afghanistan",
    "Bangladesh",
    "Burkina Faso",
    "Congo",
    "Eritrea",
    "Ethiopia",
    "Iraq",
    "Morocco",
    "Myanmar",
    "Nigeria",
    "Pakistan",
    "Somalia",
    "Syria",
    "Venezuela"
  ],
  "metadata": {
    "total_cases": 15,
    "last_updated": "2026-06-02",
    "version": "1.0"
  }
}
```

### PWA Integration Features

The JSON structure enables these PWA capabilities:

#### **1. Case Search & Filter**
```
User selects:
- Age: "12-18"
- Case Type: "trauma"
- Domains: ["health-medical"]

PWA queries JSON:
  → Returns CASE_003 (matches all 3)
  → Returns CASE_010, 013, 014, 015 (match age + domain)
```

#### **2. Related Cases Lookup**
```
User opens CASE_001.
PWA checks JSON metadata:
  → Find all cases with overlapping domains/types
  → Display: "You may also be interested in..." [links]
```

#### **3. Index Navigation**
```
User views "Case Type Index"
PWA generates from JSON:
  → Groups cases by case_type
  → Shows count, age range, primary domains
  → Links to full case details
```

#### **4. Training Module Assembly**
```
Trainer creates "Module 2B: Health & Medical"
PWA pulls from JSON:
  → case_type: includes "health"
  → domains: includes "health-medical"
  → Populates "Recommended Cases:" section
```

#### **5. Cross-Reference Export**
```
User selects 3 cases for comparison
PWA exports JSON subset:
  → Case IDs, titles, domains, age groups
  → Side-by-side comparison table
  → Downloadable as CSV or PDF
```

### Data Validation Rules

When adding cases to JSON, enforce:

1. **case_id**: Unique, format CASE_NNN (zero-padded)
2. **age_at_case**: Integer 0-18
3. **age_group**: Must be one of: "0-2", "2-6", "6-12", "12-18"
4. **case_type**: Must be one of the 10 defined types OR "mixed"
5. **domains**: Array of 1-4 values from defined domain list
6. **origin_country**: Standard country name (not abbreviation)
7. **summary**: 100-300 words
8. **file_path**: Must match actual filename in docs/cases/

### Maintenance & Updates

**Monthly:**
- Verify all case files exist and are linked correctly
- Check that metadata matches file content
- Update `last_updated` timestamp

**When new case added:**
1. Add object to `cases` array
2. Add any new case_type to `case_types` array
3. Add any new origin_country to `origin_countries` array
4. Increment version number
5. Regenerate PWA indexes

**Version Control:**
```json
"metadata": {
  "version": "1.1",
  "change_log": [
    {
      "version": "1.1",
      "date": "2026-06-15",
      "change": "Added CASE_016"
    },
    {
      "version": "1.0",
      "date": "2026-06-02",
      "change": "Initial 15-case library"
    }
  ]
}
```

---

## Summary & Quick Links

| Need | Go To | Time |
|------|-------|------|
| Find a case for my situation | [Quick Start Decision Tree](#quick-start-decision-tree) | 5 min |
| Understand case types | [Case Type Index](#case-type-index) | 15 min |
| Design training program | [Training Modules](#using-cases-for-training) | 2+ hours |
| Add new case | [Adding New Cases](#adding-new-cases) | 4+ hours |
| Integrate into PWA | [JSON Structure](#json-structure--pwa-integration) | Technical |

---

**Document Version:** 1.0  
**Last Updated:** June 2, 2026  
**Maintained By:** CGRA Case Library Team  
**Questions?** Consult your program coordinator or CGRA documentation lead.
