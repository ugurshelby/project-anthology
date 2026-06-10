# Normalizes driver SVG filenames under public/drivers/{2000..2026}.
# Strips diacritics to ASCII slugs and collapses accidental double dots.

param(
  [string]$DriversRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\public\drivers")).Path
)

$ErrorActionPreference = "Stop"

function Get-NormalizedDriverFileName {
  param([string]$FileName)

  if (-not $FileName.EndsWith(".svg", [StringComparison]::OrdinalIgnoreCase)) {
    return $FileName
  }

  $base = $FileName.Substring(0, $FileName.Length - 4)

  $decomposed = $base.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object System.Text.StringBuilder
  foreach ($ch in $decomposed.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($ch)
    }
  }
  $ascii = $builder.ToString().Normalize([Text.NormalizationForm]::FormC)

  # Ligatures / letters that do not decompose with NFD
  $explicitPairs = @(
    @(0x00DF, "ss"), # eszett
    @(0x00E6, "ae"), @(0x00C6, "ae"), # ae ligature
    @(0x00F8, "o"), @(0x00D8, "o"),   # o slash
    @(0x0142, "l"), @(0x0141, "l"),   # l slash
    @(0x0111, "d"), @(0x0110, "d")    # d stroke
  )
  foreach ($pair in $explicitPairs) {
    $ascii = $ascii.Replace([string][char]$pair[0], $pair[1])
  }

  $ascii = $ascii.ToLowerInvariant()
  while ($ascii.Contains("..")) {
    $ascii = $ascii.Replace("..", ".")
  }
  $ascii = ($ascii -replace "\.+", ".")
  $ascii = $ascii.Trim(".")

  return "$ascii.svg"
}

function Test-ProblematicDriverFileName {
  param([string]$FileName)

  foreach ($ch in $FileName.ToCharArray()) {
    if ([int][char]$ch -gt 127) {
      return $true
    }
  }
  if ($FileName -match "\.\.") {
    return $true
  }
  return $false
}

$renamed = 0
$skipped = 0
$scanned = 0

Write-Host "Scanning driver SVGs in: $DriversRoot"

for ($year = 2000; $year -le 2026; $year++) {
  $seasonDir = Join-Path $DriversRoot ([string]$year)
  if (-not (Test-Path -LiteralPath $seasonDir)) {
    continue
  }

  Get-ChildItem -LiteralPath $seasonDir -Filter "*.svg" -File | ForEach-Object {
    $script:scanned++
    $oldName = $_.Name
    $newName = Get-NormalizedDriverFileName -FileName $oldName
    $needsWork = (Test-ProblematicDriverFileName -FileName $oldName) -or ($oldName -cne $newName)

    if (-not $needsWork) {
      return
    }

    $targetPath = Join-Path $seasonDir $newName
    if ((Test-Path -LiteralPath $targetPath) -and ($_.FullName -cne $targetPath)) {
      Write-Warning "SKIP (collision): $year\$oldName -> $newName"
      $script:skipped++
      return
    }

    Write-Host "RENAME: $year\$oldName -> $newName"
    Rename-Item -LiteralPath $_.FullName -NewName $newName
    $script:renamed++
  }
}

Write-Host ""
Write-Host "Scanned: $scanned file(s)"
Write-Host "Renamed: $renamed file(s)"
Write-Host "Skipped (collision): $skipped file(s)"
