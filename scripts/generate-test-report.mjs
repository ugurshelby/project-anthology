#!/usr/bin/env node

/**
 * Test Report Generator
 * 
 * Combines Vitest and Playwright test results into a comprehensive report
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readdir } from 'fs/promises';

async function findLatestReport(pattern) {
  const outputDir = join(process.cwd(), 'test-results');
  if (!existsSync(outputDir)) {
    return null;
  }

  try {
    const files = await readdir(outputDir);
    const regex = new RegExp(pattern);
    const matchingFiles = files
      .filter(f => regex.test(f))
      .map(f => join(outputDir, f))
      .filter(f => existsSync(f));
    
    if (matchingFiles.length === 0) {
      return null;
    }

    return matchingFiles.sort().reverse()[0];
  } catch (e) {
    return null;
  }
}

async function generateCombinedReport() {
  const vitestJson = await findLatestReport(/^vitest-report-.*\.json$/);
  const playwrightJson = await findLatestReport(/^playwright-report-.*\.json$/);

  const report = {
    timestamp: new Date().toISOString(),
    overall: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      passRate: 0,
    },
  };

  // Load Vitest results
  if (vitestJson && existsSync(vitestJson)) {
    try {
      const vitestData = JSON.parse(readFileSync(vitestJson, 'utf-8'));
      report.vitest = vitestData;
      report.overall.total += vitestData.summary.total;
      report.overall.passed += vitestData.summary.passed;
      report.overall.failed += vitestData.summary.failed;
      report.overall.skipped += vitestData.summary.skipped;
      report.overall.duration += vitestData.summary.duration;
    } catch (e) {
      console.warn(`⚠️  Failed to load Vitest report: ${e.message}`);
    }
  }

  // Load Playwright results
  if (playwrightJson && existsSync(playwrightJson)) {
    try {
      const playwrightData = JSON.parse(readFileSync(playwrightJson, 'utf-8'));
      report.playwright = playwrightData;
      report.overall.total += playwrightData.summary.total;
      report.overall.passed += playwrightData.summary.passed;
      report.overall.failed += playwrightData.summary.failed;
      report.overall.skipped += playwrightData.summary.skipped;
      report.overall.duration += playwrightData.summary.duration;
    } catch (e) {
      console.warn(`⚠️  Failed to load Playwright report: ${e.message}`);
    }
  }

  // Calculate pass rate
  report.overall.passRate = report.overall.total > 0
    ? Math.round((report.overall.passed / report.overall.total) * 100)
    : 0;

  return report;
}

function generateMarkdownReport(report) {
  let md = `# Test Results Report\n\n`;
  md += `**Generated**: ${new Date(report.timestamp).toLocaleString()}\n\n`;

  // Overall summary
  md += `## 📊 Overall Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${report.overall.total} |\n`;
  md += `| ✅ Passed | ${report.overall.passed} (${report.overall.passRate}%) |\n`;
  md += `| ❌ Failed | ${report.overall.failed} |\n`;
  md += `| ⏭️  Skipped | ${report.overall.skipped} |\n`;
  md += `| ⏱️  Total Duration | ${Math.round(report.overall.duration / 1000)}s |\n\n`;

  // Vitest section
  if (report.vitest) {
    md += `## 🧪 Vitest (Unit Tests)\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total | ${report.vitest.summary.total} |\n`;
    md += `| Passed | ${report.vitest.summary.passed} |\n`;
    md += `| Failed | ${report.vitest.summary.failed} |\n`;
    md += `| Skipped | ${report.vitest.summary.skipped} |\n`;
    md += `| Duration | ${Math.round(report.vitest.summary.duration / 1000)}s |\n\n`;

    const failedSuites = report.vitest.suites.filter(s => s.failed > 0);
    if (failedSuites.length > 0) {
      md += `### ❌ Failed Tests\n\n`;
      failedSuites.forEach((suite) => {
        const failedTests = suite.tests.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
          md += `#### ${suite.name}\n\n`;
          failedTests.forEach((test) => {
            md += `- **${test.name}**\n`;
            if (test.error) {
              md += `  - Error: \`${test.error.substring(0, 150)}...\`\n`;
            }
            md += `\n`;
          });
        }
      });
    }
  }

  // Playwright section
  if (report.playwright) {
    md += `## 🎭 Playwright (E2E Tests)\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total | ${report.playwright.summary.total} |\n`;
    md += `| Passed | ${report.playwright.summary.passed} |\n`;
    md += `| Failed | ${report.playwright.summary.failed} |\n`;
    md += `| Skipped | ${report.playwright.summary.skipped} |\n`;
    md += `| Duration | ${Math.round(report.playwright.summary.duration / 1000)}s |\n\n`;

    if (Object.keys(report.playwright.projects).length > 0) {
      md += `### 🌐 Projects\n\n`;
      md += `| Project | Passed | Failed | Skipped |\n`;
      md += `|---------|--------|--------|---------|\n`;
      Object.entries(report.playwright.projects).forEach(([project, stats]) => {
        md += `| ${project} | ${stats.passed} | ${stats.failed} | ${stats.skipped} |\n`;
      });
      md += `\n`;
    }

    const failedSuites = report.playwright.suites.filter(s => s.failed > 0);
    if (failedSuites.length > 0) {
      md += `### ❌ Failed Tests\n\n`;
      failedSuites.forEach((suite) => {
        const failedTests = suite.tests.filter(t => 
          t.status === 'failed' || t.status === 'timedOut'
        );
        if (failedTests.length > 0) {
          const fileName = suite.file.split('/').pop() || suite.file;
          md += `#### ${fileName}\n\n`;
          failedTests.forEach((test) => {
            md += `- **${test.title}** (${test.project})\n`;
            if (test.error) {
              md += `  - Error: \`${test.error.substring(0, 150)}...\`\n`;
            }
            md += `\n`;
          });
        }
      });
    }
  }

  // Recommendations
  md += `## 💡 Recommendations\n\n`;
  if (report.overall.failed > 0) {
    md += `1. **Fix Failed Tests**: ${report.overall.failed} test(s) need attention\n`;
    md += `2. **Review Error Messages**: Check test logs for detailed error information\n`;
    md += `3. **Improve Stability**: Consider increasing timeouts for flaky tests\n`;
  } else {
    md += `✅ All tests passing! Great job!\n`;
  }
  md += `\n`;

  return md;
}

async function main() {
  console.log('📊 Generating combined test report...\n');

  const report = await generateCombinedReport();

  // Save JSON report
  const outputDir = join(process.cwd(), 'test-results');
  const { mkdirSync } = await import('fs');
  mkdirSync(outputDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = join(outputDir, `combined-report-${timestamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report saved: ${jsonPath}`);

  // Save Markdown report
  const markdown = generateMarkdownReport(report);
  const mdPath = join(outputDir, `combined-report-${timestamp}.md`);
  writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`✅ Markdown report saved: ${mdPath}`);

  // Also save as latest
  writeFileSync(join(outputDir, 'LATEST_REPORT.md'), markdown, 'utf-8');
  writeFileSync(join(outputDir, 'LATEST_REPORT.json'), JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ Latest report saved: test-results/LATEST_REPORT.{md,json}\n`);

  // Print summary
  console.log('📊 Summary:');
  console.log(`   Total: ${report.overall.total}`);
  console.log(`   ✅ Passed: ${report.overall.passed} (${report.overall.passRate}%)`);
  console.log(`   ❌ Failed: ${report.overall.failed}`);
  console.log(`   ⏭️  Skipped: ${report.overall.skipped}`);
  console.log(`   ⏱️  Duration: ${Math.round(report.overall.duration / 1000)}s\n`);
}

main().catch(console.error);
