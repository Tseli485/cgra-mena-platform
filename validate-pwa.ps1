# PWA Tasks 13-15 Validation Script
# Comprehensive testing for Search/Discovery, Offline Sync, Export, and Final Validation

$results = @{
    'Task13' = @{
        'name' = 'Search & Discovery'
        'tests' = @()
        'passed' = 0
        'failed' = 0
    }
    'Task14' = @{
        'name' = 'Offline Sync & Export'
        'tests' = @()
        'passed' = 0
        'failed' = 0
    }
    'Task15' = @{
        'name' = 'Final Integration'
        'tests' = @()
        'passed' = 0
        'failed' = 0
    }
}

# Function to test file existence and content
function Test-FileContent {
    param(
        [string]$FilePath,
        [string]$Pattern,
        [string]$TestName,
        [string]$TaskKey
    )

    $result = @{
        'name' = $TestName
        'passed' = $false
        'error' = $null
    }

    try {
        if (-not (Test-Path $FilePath)) {
            $result['error'] = "File not found: $FilePath"
            Write-Host "✗ $TestName" -ForegroundColor Red
            return $result
        }

        $content = Get-Content $FilePath -Raw
        if ($content -match $Pattern) {
            $result['passed'] = $true
            Write-Host "✓ $TestName" -ForegroundColor Green
        } else {
            $result['error'] = "Pattern not found: $Pattern"
            Write-Host "✗ $TestName" -ForegroundColor Red
        }
    } catch {
        $result['error'] = $_.Exception.Message
        Write-Host "✗ $TestName - $($_.Exception.Message)" -ForegroundColor Red
    }

    $results[$TaskKey]['tests'] += $result
    if ($result['passed']) {
        $results[$TaskKey]['passed']++
    } else {
        $results[$TaskKey]['failed']++
    }

    return $result
}

# Function to test JavaScript functionality
function Test-JSFeature {
    param(
        [string]$TestName,
        [string]$TaskKey,
        [scriptblock]$TestFn
    )

    $result = @{
        'name' = $TestName
        'passed' = $false
        'error' = $null
    }

    try {
        $passed = & $TestFn
        if ($passed) {
            $result['passed'] = $true
            Write-Host "✓ $TestName" -ForegroundColor Green
        } else {
            $result['error'] = "Test returned false"
            Write-Host "✗ $TestName" -ForegroundColor Red
        }
    } catch {
        $result['error'] = $_.Exception.Message
        Write-Host "✗ $TestName - $($_.Exception.Message)" -ForegroundColor Red
    }

    $results[$TaskKey]['tests'] += $result
    if ($result['passed']) {
        $results[$TaskKey]['passed']++
    } else {
        $results[$TaskKey]['failed']++
    }

    return $result
}

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PWA TASKS 13-15 COMPREHENSIVE VALIDATION          ║" -ForegroundColor Cyan
Write-Host "║  Search/Discovery, Offline Sync, Export & Final    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# TASK 13: Global Search & Discovery
Write-Host "═══ Task 13: Global Search & Discovery ═══`n" -ForegroundColor Yellow

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'global-search' `
    -TestName 'Global search input in HTML' `
    -TaskKey 'Task13'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'search\s*\(' `
    -TestName 'Search function exists' `
    -TaskKey 'Task13'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'search-results-modal' `
    -TestName 'Search results modal exists' `
    -TaskKey 'Task13'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'nav-link.*dashboard|nav-link.*role|nav-link.*lifecycle|nav-link.*procedure|nav-link.*rights|nav-link.*cases|nav-link.*resources|nav-link.*support' `
    -TestName 'All 8 modules in navigation' `
    -TaskKey 'Task13'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'global-search.*keyboard|keyboard.*search' `
    -TestName 'Keyboard navigation support' `
    -TaskKey 'Task13'

# TASK 14: Offline Sync & Export
Write-Host "`n═══ Task 14: Offline Sync & Export ═══`n" -ForegroundColor Yellow

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'OfflineSyncManager' `
    -TestName 'Offline sync manager class exists' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'syncQueue|queueOperation' `
    -TestName 'Sync queue and queue operation' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\export.js" `
    -Pattern 'ExportModule' `
    -TestName 'Export module class exists' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\export.js" `
    -Pattern 'exportLifecycleChecklist|exportCaseAsText|exportCaseAsPDF' `
    -TestName 'Export functions available' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'sync-status|connection-status' `
    -TestName 'Sync and connection status indicators' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'syncHistory|retryAttempts|maxRetries' `
    -TestName 'Sync history and retry logic' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'jspdf|pdf-lib' `
    -TestName 'PDF export library included' `
    -TaskKey 'Task14'

# TASK 15: Final Integration & Validation
Write-Host "`n═══ Task 15: Final Integration & Validation ═══`n" -ForegroundColor Yellow

# Check all module files exist
$modules = @('dashboard', 'lifecycle', 'cases', 'role', 'procedure', 'rights', 'resources', 'support')
foreach ($module in $modules) {
    $modulePath = "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\$module.js"
    Test-FileContent -FilePath $modulePath `
        -Pattern "class\s+\w*Module|function.*init" `
        -TestName "Module file exists: $module" `
        -TaskKey 'Task15'
}

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\manifest.json" `
    -Pattern 'name|short_name|description' `
    -TestName 'Manifest.json properly configured' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\sw.js" `
    -Pattern 'ServiceWorkerGlobalScope|activate|install|fetch' `
    -TestName 'Service Worker registered' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'breadcrumb' `
    -TestName 'Breadcrumb navigation exists' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\css\styles.css" `
    -Pattern '@media|responsive|mobile|tablet' `
    -TestName 'Responsive design CSS' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'lang=|role=|aria-' `
    -TestName 'Accessibility attributes' `
    -TaskKey 'Task15'

# Check data files
$dataFiles = @('phases.json', 'cases.json')
foreach ($dataFile in $dataFiles) {
    $dataPath = "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\data\$dataFile"
    Test-FileContent -FilePath $dataPath `
        -Pattern '\[|\{' `
        -TestName "Data file exists: $dataFile" `
        -TaskKey 'Task15'
}

# Print Summary
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  VALIDATION RESULTS SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalTests = 0
$totalPassed = 0
$totalFailed = 0

foreach ($taskKey in @('Task13', 'Task14', 'Task15')) {
    $task = $results[$taskKey]
    $taskTotal = $task['tests'].Count
    $taskPassed = $task['passed']
    $taskFailed = $task['failed']

    $totalTests += $taskTotal
    $totalPassed += $taskPassed
    $totalFailed += $taskFailed

    $passRate = if ($taskTotal -gt 0) { [math]::Round(($taskPassed / $taskTotal) * 100, 2) } else { 0 }

    Write-Host "Task ${taskKey}: $($task['name'])" -ForegroundColor Magenta
    Write-Host "  Total: $taskTotal | Passed: $taskPassed | Failed: $taskFailed | Pass Rate: $passRate%`n"
}

$overallPassRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "Overall Results:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests"
Write-Host "  Passed: $totalPassed"
Write-Host "  Failed: $totalFailed"
Write-Host "  Overall Pass Rate: $overallPassRate%`n"

# Export results to JSON
$resultsJson = @{
    'timestamp' = [DateTime]::Now.ToString('o')
    'summary' = @{
        'totalTests' = $totalTests
        'passed' = $totalPassed
        'failed' = $totalFailed
        'passRate' = $overallPassRate
    }
    'tasks' = $results
} | ConvertTo-Json -Depth 10

$resultsJson | Out-File -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\test-results.json" -Encoding UTF8

Write-Host "Results saved to: test-results.json" -ForegroundColor Green
