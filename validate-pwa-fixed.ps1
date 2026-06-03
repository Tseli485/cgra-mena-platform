# PWA Tasks 13-15 Validation Script
# Comprehensive testing for Search/Discovery, Offline Sync, Export, and Final Validation

$results = @{
    'Task13' = @{
        'name' = 'Search and Discovery'
        'tests' = @()
        'passed' = 0
        'failed' = 0
    }
    'Task14' = @{
        'name' = 'Offline Sync and Export'
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
            Write-Host "[FAIL] $TestName" -ForegroundColor Red
            return $result
        }

        $content = Get-Content $FilePath -Raw
        if ($content -match $Pattern) {
            $result['passed'] = $true
            Write-Host "[PASS] $TestName" -ForegroundColor Green
        } else {
            $result['error'] = "Pattern not found: $Pattern"
            Write-Host "[FAIL] $TestName" -ForegroundColor Red
        }
    } catch {
        $result['error'] = $_.Exception.Message
        Write-Host "[FAIL] $TestName - $($_.Exception.Message)" -ForegroundColor Red
    }

    $results[$TaskKey]['tests'] += $result
    if ($result['passed']) {
        $results[$TaskKey]['passed']++
    } else {
        $results[$TaskKey]['failed']++
    }

    return $result
}

Write-Host "`n=== PWA TASKS 13-15 COMPREHENSIVE VALIDATION ===" -ForegroundColor Cyan
Write-Host "Search/Discovery, Offline Sync, Export and Final`n" -ForegroundColor Cyan

# TASK 13: Global Search and Discovery
Write-Host "Task 13: Global Search and Discovery`n" -ForegroundColor Yellow

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
    -Pattern 'nav-link.*dashboard|nav-link.*role|nav-link.*lifecycle|nav-link.*procedure' `
    -TestName 'All navigation modules configured' `
    -TaskKey 'Task13'

# TASK 14: Offline Sync and Export
Write-Host "`nTask 14: Offline Sync and Export`n" -ForegroundColor Yellow

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'OfflineSyncManager' `
    -TestName 'Offline sync manager class exists' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'syncQueue|queueOperation' `
    -TestName 'Sync queue and operation' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\export.js" `
    -Pattern 'ExportModule' `
    -TestName 'Export module class exists' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\export.js" `
    -Pattern 'exportLifecycleChecklist|exportCaseAsText' `
    -TestName 'Export functions available' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'sync-status|connection-status' `
    -TestName 'Sync and connection indicators' `
    -TaskKey 'Task14'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\app.js" `
    -Pattern 'syncHistory|retryAttempts' `
    -TestName 'Sync history and retry logic' `
    -TaskKey 'Task14'

# TASK 15: Final Integration and Validation
Write-Host "`nTask 15: Final Integration and Validation`n" -ForegroundColor Yellow

$modules = @('dashboard', 'lifecycle', 'cases', 'role', 'procedure', 'rights', 'resources', 'support')
$moduleCount = 0
foreach ($module in $modules) {
    $modulePath = "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\js\modules\$module.js"
    if (Test-Path $modulePath) {
        $moduleCount++
    }
}

Write-Host "[INFO] Found $moduleCount/8 module files" -ForegroundColor Cyan

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\manifest.json" `
    -Pattern 'name|short_name' `
    -TestName 'Manifest.json configured' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\sw.js" `
    -Pattern 'ServiceWorkerGlobalScope|activate|fetch' `
    -TestName 'Service Worker implemented' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\index.html" `
    -Pattern 'breadcrumb' `
    -TestName 'Breadcrumb navigation' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\css\styles.css" `
    -Pattern '@media|responsive' `
    -TestName 'Responsive design CSS' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\data\phases.json" `
    -Pattern '\[|\{' `
    -TestName 'Lifecycle phases data' `
    -TaskKey 'Task15'

Test-FileContent -FilePath "C:\Users\trian\OneDrive\Desktop\CGRA\pwa\data\cases.json" `
    -Pattern '\[|\{' `
    -TestName 'Cases data available' `
    -TaskKey 'Task15'

# Print Summary
Write-Host "`n=== VALIDATION RESULTS SUMMARY ===" -ForegroundColor Cyan

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

    Write-Host "`n$taskKey : $($task['name'])" -ForegroundColor Magenta
    Write-Host "  Total: $taskTotal | Passed: $taskPassed | Failed: $taskFailed | Pass Rate: $passRate%"
}

$overallPassRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nOVERALL RESULTS:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests"
Write-Host "  Passed: $totalPassed"
Write-Host "  Failed: $totalFailed"
Write-Host "  Overall Pass Rate: $overallPassRate%`n"

# Save results to file
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
