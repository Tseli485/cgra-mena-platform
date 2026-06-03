param(
    [string]$CasesDir = "C:\Users\trian\OneDrive\Desktop\CGRA\docs\cases",
    [string]$OutputDir = "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\data"
)

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Function to extract case ID and type from filename
function Get-CaseInfo {
    param([string]$Filename)
    if ($Filename -match 'CASE_(\d+)_(.+)\.md') {
        $caseId = "CASE_{0:D3}" -f [int]$matches[1]
        $caseType = $matches[2] -replace '_', '_'
        return @{ id = $caseId; type = $caseType }
    }
    return $null
}

# Function to parse markdown table
function Parse-Table {
    param([string[]]$lines, [int]$startIdx)

    $rows = @()
    $headers = @()
    $isHeader = $true

    for ($i = $startIdx; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()

        # Stop at next section
        if ($line.StartsWith('#') -and $i -gt $startIdx + 2) { break }
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        # Skip separator line
        if ($line -match '^\|[-\s|]+\|$') {
            $isHeader = $false
            continue
        }

        # Parse table rows
        if ($line.StartsWith('|') -and $line.EndsWith('|')) {
            $cells = @($line -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -ne '' })

            if ($isHeader) {
                $headers = $cells
            } else {
                $row = @{}
                for ($j = 0; $j -lt $headers.Count -and $j -lt $cells.Count; $j++) {
                    $row[$headers[$j]] = $cells[$j]
                }
                if ($row.Count -gt 0) { $rows += $row }
            }
        }
    }

    return $rows
}

# Function to extract age and age_group
function Get-AgeInfo {
    param([string]$narrative)

    # Try to find age in narrative
    $ageMatch = $narrative -match '(\d+)\s+years?\s+old'
    if ($ageMatch) {
        $age = [int]$matches[1]
    } else {
        $age = $null
    }

    # Determine age group
    $ageGroup = if ($age) {
        if ($age -le 2) { "0-2" }
        elseif ($age -le 6) { "2-6" }
        elseif ($age -le 12) { "6-12" }
        else { "12-18" }
    } else { "unknown" }

    return @{ age = $age; ageGroup = $ageGroup }
}

# Main parsing function
function Parse-CaseFile {
    param([string]$FilePath)

    $content = Get-Content -Path $FilePath -Raw
    $lines = @($content -split "`n")

    # Extract case info
    $filename = Split-Path -Leaf $FilePath
    $caseInfo = Get-CaseInfo $filename

    # Extract title (first heading)
    $titleMatch = $content -match '# CASE \d+: (.+)'
    $title = if ($titleMatch) { $matches[1] } else { "Unknown" }

    # Extract narrative
    $narrativeStart = $content.IndexOf("## Story/Narrative")
    $narrativeEnd = $content.IndexOf("## Timeline", $narrativeStart)
    $narrative = if ($narrativeStart -ge 0 -and $narrativeEnd -ge 0) {
        $content.Substring($narrativeStart + 18, $narrativeEnd - $narrativeStart - 18).Trim()
    } else { "" }

    # Get age info
    $ageInfo = Get-AgeInfo $narrative

    # Extract case type from filename (more accurate)
    $caseTypeFromFile = if ($filename -match 'CASE_\d+_(.+)\.md') { $matches[1] } else { "unknown" }

    # Map filename patterns to case types
    $caseTypeMap = @{
        'unaccompanied' = 'unaccompanied'
        'family_conflict' = 'family_conflict'
        'trauma' = 'trauma'
        'runaway' = 'runaway'
        'work_situation' = 'child_labor'
        'justice' = 'justice_system'
        'health' = 'health'
        'reunification' = 'reunification'
        'readmission' = 'readmission'
        'mixed' = 'mixed'
        'mixed2' = 'mixed'
        'additional' = 'additional'
        'complex' = 'complex'
        'complex2' = 'complex'
        'complex3' = 'complex'
    }

    $caseType = $caseTypeMap[$caseTypeFromFile]
    if (-not $caseType) { $caseType = $caseTypeFromFile }

    # Parse timeline
    $timelineStart = -1
    $timelineEnd = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Timeline of Events') { $timelineStart = $i }
        if ($timelineStart -ge 0 -and $i -gt $timelineStart -and $lines[$i] -match '^## ' -and $lines[$i] -notmatch 'Timeline') {
            $timelineEnd = $i
            break
        }
    }
    if ($timelineEnd -lt 0) { $timelineEnd = $lines.Count }

    $timelineRows = Parse-Table $lines $timelineStart
    $timeline = @()
    foreach ($row in $timelineRows) {
        if ($row['Date'] -and $row['Event']) {
            $timeline += @{
                date = $row['Date']
                event = $row['Event']
            }
        }
    }

    # Extract key events from narrative (simplified)
    $keyEvents = @()
    if ($narrative -match 'breakthrough|crisis|turning point|major|important') {
        $sentences = $narrative -split '\. '
        foreach ($sentence in $sentences) {
            if ($sentence -match '(breakthrough|crisis|turning point|major|important|placed|asylum|rescued|reunited)' -and $sentence.Length -gt 20) {
                $keyEvents += @{
                    description = $sentence.Trim() + "."
                    impact = "significant"
                }
            }
        }
    }

    # Ensure we have at least some key events
    if ($keyEvents.Count -eq 0 -and $timeline.Count -gt 0) {
        $keyEvents = @($timeline | Select-Object -First 5 | ForEach-Object {
            @{
                description = $_.event
                impact = "documented"
            }
        })
    }

    # Parse problems identified
    $problemsStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Problems Identified') { $problemsStart = $i; break }
    }

    $problemsRows = @()
    if ($problemsStart -ge 0) {
        $problemsRows = Parse-Table $lines $problemsStart
    }

    $problems = @()
    foreach ($row in $problemsRows) {
        if ($row['Problem'] -and $row['Severity']) {
            $problems += @{
                problem = $row['Problem']
                severity = $row['Severity'].ToLower()
                domain = if ($row['Domain']) { $row['Domain'] } else { "other" }
                urgency = if ($row['Urgency']) { $row['Urgency'].ToLower() } else { "medium" }
            }
        }
    }

    # Parse legal framework
    $legalStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Legal Framework Applied') { $legalStart = $i; break }
    }

    $legalRows = @()
    if ($legalStart -ge 0) {
        $legalRows = Parse-Table $lines $legalStart
    }

    $legalFramework = @()
    foreach ($row in $legalRows) {
        if ($row['Law/Regulation'] -or $row['Law/regulation']) {
            $lawKey = if ($row['Law/Regulation']) { 'Law/Regulation' } else { 'Law/regulation' }
            $applicationKey = if ($row['How It Applies']) { 'How It Applies' } else { 'How it applies' }
            $partyKey = if ($row['Responsible Party']) { 'Responsible Party' } else { 'Responsible party' }

            $legalFramework += @{
                law_or_regulation = $row[$lawKey]
                application = if ($row[$applicationKey]) { $row[$applicationKey] } else { "Applied" }
                responsible_party = if ($row[$partyKey]) { $row[$partyKey] } else { "Government" }
            }
        }
    }

    # Parse solutions implemented
    $solutionsStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Solutions Implemented') { $solutionsStart = $i; break }
    }

    $solutionsRows = @()
    if ($solutionsStart -ge 0) {
        $solutionsRows = Parse-Table $lines $solutionsStart
    }

    $solutions = @()
    foreach ($row in $solutionsRows) {
        $solutionKey = if ($row['Solution']) { 'Solution' } else { if ($row['Description']) { 'Description' } else { $null } }
        $descKey = if ($row['Description']) { 'Description' } else { $null }

        if ($row[$solutionKey]) {
            $successMetrics = if ($row['Metrics']) { $row['Metrics'] } elseif ($row['Success Metrics']) { $row['Success Metrics'] } else { "achieved" }
            $solutions += @{
                solution = if ($solutionKey) { $row[$solutionKey] } else { $row[$descKey] }
                timeline = if ($row['Timeline']) { $row['Timeline'] } else { "ongoing" }
                outcomes = if ($row['Outcomes']) { $row['Outcomes'] } else { "positive" }
                success_metrics = $successMetrics
            }
        }
    }

    # Parse tuteur obligations
    $tuteurStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Tuteur Obligations') { $tuteurStart = $i; break }
    }

    $tuteurObligations = @()
    if ($tuteurStart -ge 0) {
        # Extract numbered list
        for ($i = $tuteurStart + 1; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            if ($line -match '^## ') { break }
            if ($line -match '^\d+\.\s+\*\*(.+?)\*\*\s*-\s*(.+)') {
                $tuteurObligations += @{
                    responsibility = $matches[1]
                    description = $matches[2]
                }
            } elseif ($line -match '^\d+\.\s*(.+)') {
                $tuteurObligations += @{
                    responsibility = $matches[1]
                    description = ""
                }
            }
        }
    }

    # Parse lessons learned
    $lessonsStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Lessons Learned') { $lessonsStart = $i; break }
    }

    $lessonsLearned = @()
    if ($lessonsStart -ge 0) {
        # Extract numbered list
        for ($i = $lessonsStart + 1; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            if ($line -match '^## ') { break }
            if ($line -match '^\d+\.\s*(.+)') {
                $lessonsLearned += $matches[1]
            }
        }
    }

    # Parse related resources
    $resourcesStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '## Related Resources') { $resourcesStart = $i; break }
    }

    $relatedResources = @()
    if ($resourcesStart -ge 0) {
        for ($i = $resourcesStart + 1; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            if ($line -match '^## ') { break }
            if ($line -match '^-\s*\*\*(.+?)\*\*\s*-\s*(.+)') {
                $relatedResources += @{
                    name = $matches[1]
                    description = $matches[2]
                }
            }
        }
    }

    # Extract domains from problems
    $domains = @($problems | Select-Object -ExpandProperty domain -Unique | Where-Object { $_ })
    if ($domains.Count -eq 0) { $domains = @("general") }

    # Extract vulnerability flags from narrative and problems
    $vulnerabilityFlags = @()
    if ($narrative -match 'trauma|violence|abuse') { $vulnerabilityFlags += "trauma" }
    if ($narrative -match 'separated|alone|unaccompanied|orphan') { $vulnerabilityFlags += "separated_family" }
    if ($narrative -match 'traffick|smuggle') { $vulnerabilityFlags += "trafficking_risk" }
    if ($narrative -match 'health|medical|disease|malnutrition') { $vulnerabilityFlags += "health_issues" }
    if ($narrative -match 'language|communication') { $vulnerabilityFlags += "language_barrier" }
    if ($narrative -match 'document|identity|passport') { $vulnerabilityFlags += "documentation_gaps" }
    if ($narrative -match 'school|education') { $vulnerabilityFlags += "education_interrupted" }

    # Extract country from narrative
    $country = "Unknown"
    if ($narrative -match '(Syria|Lebanon|Afghanistan|Belgium|Congo|DRC|Bukavu|Kabul|Damascus|Aleppo|Brussels)') {
        $country = $matches[1]
    }

    # Extract gender from narrative
    $gender = "unknown"
    if ($narrative -match '\bshe\b|\bher\b') { $gender = "female" }
    elseif ($narrative -match '\bhe\b|\bhim\b|\bhis\b') { $gender = "male" }

    return @{
        case_id = $caseInfo.id
        title = $title
        case_type = $caseType
        age_at_case = $ageInfo.age
        age_group = $ageInfo.ageGroup
        country = $country
        gender = $gender
        vulnerability_flags = @($vulnerabilityFlags | Select-Object -Unique)
        story = @{
            situation = ($narrative -split "`n" | Select-Object -First 1).Trim()
            timeline = $timeline
            key_events = $keyEvents
        }
        problems_identified = $problems
        legal_framework = $legalFramework
        solutions_implemented = $solutions
        tuteur_obligations = $tuteurObligations
        lessons_learned = $lessonsLearned
        related_resources = $relatedResources
        domains = @($domains | Select-Object -Unique)
        case_status = "documented"
    }
}

# Parse all case files
Write-Host "Parsing case files..."
$caseFiles = Get-ChildItem -Path $CasesDir -Filter "CASE_*.md" | Where-Object { $_.Name -match 'CASE_\d{3}' } | Sort-Object Name

$allCases = @()
$casesByType = @{}
$casesByAge = @{ "0-2" = @(); "2-6" = @(); "6-12" = @(); "12-18" = @() }
$casesByDomain = @{}

foreach ($file in $caseFiles) {
    Write-Host "Processing $($file.Name)..." -ForegroundColor Cyan
    try {
        $case = Parse-CaseFile $file.FullName
        $allCases += $case

        # Index by type
        if (-not $casesByType.ContainsKey($case.case_type)) {
            $casesByType[$case.case_type] = @()
        }
        $casesByType[$case.case_type] += $case.case_id

        # Index by age
        if ($case.age_group -ne "unknown") {
            $casesByAge[$case.age_group] += $case.case_id
        }

        # Index by domain
        foreach ($domain in $case.domains) {
            if (-not $casesByDomain.ContainsKey($domain)) {
                $casesByDomain[$domain] = @()
            }
            $casesByDomain[$domain] += $case.case_id
        }

    } catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nGenerated $($allCases.Count) cases" -ForegroundColor Green

# Convert to JSON and save
$casesJson = $allCases | ConvertTo-Json -Depth 10
$casesOutputPath = Join-Path $OutputDir "cases-data.json"
$casesJson | Out-File -FilePath $casesOutputPath -Encoding UTF8

Write-Host "Saved cases data to: $casesOutputPath" -ForegroundColor Green

# Create indexes
$indexes = @{
    by_type = $casesByType
    by_age = $casesByAge
    by_domain = $casesByDomain
}

$indexesJson = $indexes | ConvertTo-Json -Depth 10
$indexesOutputPath = Join-Path $OutputDir "cases-indexes.json"
$indexesJson | Out-File -FilePath $indexesOutputPath -Encoding UTF8

Write-Host "Saved indexes to: $indexesOutputPath" -ForegroundColor Green

# Validation
Write-Host "`nValidation Report:" -ForegroundColor Cyan
Write-Host "Total cases parsed: $($allCases.Count) / 15"
Write-Host "Case types: $($casesByType.Keys.Count)"
foreach ($type in ($casesByType.Keys | Sort-Object)) {
    Write-Host "  - $type`: $($casesByType[$type].Count) case(s)"
}
Write-Host "Age groups covered: $($casesByAge.Keys.Count)"
foreach ($age in ("0-2", "2-6", "6-12", "12-18")) {
    Write-Host "  - $age`: $($casesByAge[$age].Count) case(s)"
}
Write-Host "Domains covered: $($casesByDomain.Keys.Count)"
foreach ($domain in ($casesByDomain.Keys | Sort-Object)) {
    Write-Host "  - $domain`: $($casesByDomain[$domain].Count) case(s)"
}
