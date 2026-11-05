param(
    [switch]$IncludeExtras = $true,
    [switch]$Force = $true
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeSkills = Join-Path $HOME ".claude\skills"
$AgentsSkills = Join-Path $HOME ".agents\skills"
$ClaudeAgents = Join-Path $HOME ".claude\agents"

New-Item -ItemType Directory -Force -Path $ClaudeSkills | Out-Null

Write-Host "Installing primary Claude skills to $ClaudeSkills ..."
Get-ChildItem -Path (Join-Path $RepoRoot "skills") -Directory | ForEach-Object {
    $dest = Join-Path $ClaudeSkills $_.Name
    if ($Force -or -not (Test-Path $dest)) {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
    }
}

if ($IncludeExtras -and (Test-Path (Join-Path $RepoRoot "agents-skills"))) {
    New-Item -ItemType Directory -Force -Path $AgentsSkills | Out-Null
    Write-Host "Installing extra agent skills to $AgentsSkills ..."
    Get-ChildItem -Path (Join-Path $RepoRoot "agents-skills") -Directory | ForEach-Object {
        $dest = Join-Path $AgentsSkills $_.Name
        if ($Force -or -not (Test-Path $dest)) {
            Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
        }
    }
}

if (Test-Path (Join-Path $RepoRoot "agents")) {
    New-Item -ItemType Directory -Force -Path $ClaudeAgents | Out-Null
    Write-Host "Installing custom agent definitions to $ClaudeAgents ..."
    Get-ChildItem -Path (Join-Path $RepoRoot "agents") -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination (Join-Path $ClaudeAgents $_.Name) -Force
    }
}

Write-Host "Done! Installed skills into ~/.claude/skills."
