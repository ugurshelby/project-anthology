/**
 * Playwright Markdown Reporter
 * 
 * Generates markdown report from Playwright test results
 */

import type { FullResult } from '@playwright/test/reporter';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readdir } from 'fs/promises';

interface TestCaseResult {
  title: string;
  file: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  error?: string;
  retries: number;
  project: string;
}

interface TestSuiteResult {
  file: string;
  tests: TestCaseResult[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface PlaywrightReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  suites: TestSuiteResult[];
  projects: Record<string, {
    passed: number;
    failed: number;
    skipped: number;
  }>;
}

export default class PlaywrightMarkdownReporter {
  async onEnd(result: FullResult) {
    // Find latest JSON report
    const outputDir = join(process.cwd(), 'test-results');
    
    let jsonFiles: string[] = [];
    try {
      const files = await readdir(outputDir);
      jsonFiles = files
        .filter(f => f.match(/^playwright-report-.*\.json$/))
        .map(f => join(outputDir, f))
        .filter(f => existsSync(f));
    } catch (e) {
      // Directory might not exist
    }
    
    if (jsonFiles.length === 0) {
      console.warn('⚠️  No JSON report found. Run tests with JSON reporter first.');
      return result;
    }

    const latestJson = jsonFiles.sort().reverse()[0];
    const report: PlaywrightReport = JSON.parse(readFileSync(latestJson, 'utf-8'));

    // Generate markdown
    const markdown = this.generateMarkdown(report);

    // Save markdown report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `playwright-report-${timestamp}.md`);
    
    writeFileSync(reportPath, markdown, 'utf-8');
    
    console.log(`📝 Playwright Markdown report saved: ${reportPath}`);
    
    return result;
  }

  private generateMarkdown(report: PlaywrightReport): string {
    const { summary, suites, projects } = report;
    const passRate = summary.total > 0 
      ? Math.round((summary.passed / summary.total) * 100) 
      : 0;

    let md = `# Playwright E2E Test Report\n\n`;
    md += `**Generated**: ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    // Summary
    md += `## 📊 Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Tests | ${summary.total} |\n`;
    md += `| ✅ Passed | ${summary.passed} (${passRate}%) |\n`;
    md += `| ❌ Failed | ${summary.failed} |\n`;
    md += `| ⏭️  Skipped | ${summary.skipped} |\n`;
    md += `| ⏱️  Duration | ${Math.round(summary.duration / 1000)}s |\n\n`;

    // Projects breakdown
    if (Object.keys(projects).length > 0) {
      md += `## 🌐 Projects Breakdown\n\n`;
      md += `| Project | Passed | Failed | Skipped |\n`;
      md += `|---------|--------|--------|---------|\n`;
      Object.entries(projects).forEach(([project, stats]) => {
        md += `| ${project} | ${stats.passed} | ${stats.failed} | ${stats.skipped} |\n`;
      });
      md += `\n`;
    }

    // Failed tests
    const failedSuites = suites.filter(s => s.failed > 0);
    if (failedSuites.length > 0) {
      md += `## ❌ Failed Tests\n\n`;
      failedSuites.forEach((suite) => {
        const failedTests = suite.tests.filter(t => t.status === 'failed' || t.status === 'timedOut');
        if (failedTests.length > 0) {
          const fileName = suite.file.split('/').pop() || suite.file;
          md += `### ${fileName}\n\n`;
          failedTests.forEach((test) => {
            md += `- **${test.title}** (${test.project})\n`;
            md += `  - Duration: ${Math.round(test.duration)}ms\n`;
            md += `  - Retries: ${test.retries}\n`;
            if (test.error) {
              md += `  - Error: \`${test.error.substring(0, 200)}${test.error.length > 200 ? '...' : ''}\`\n`;
            }
            md += `\n`;
          });
        }
      });
    }

    // All suites
    md += `## 📁 Test Suites\n\n`;
    suites.forEach((suite) => {
      const suitePassRate = suite.tests.length > 0
        ? Math.round((suite.passed / suite.tests.length) * 100)
        : 0;
      
      const fileName = suite.file.split('/').pop() || suite.file;
      md += `### ${fileName}\n\n`;
      md += `- **Total**: ${suite.tests.length} tests\n`;
      md += `- **Passed**: ${suite.passed} (${suitePassRate}%)\n`;
      md += `- **Failed**: ${suite.failed}\n`;
      md += `- **Skipped**: ${suite.skipped}\n`;
      md += `- **Duration**: ${Math.round(suite.duration / 1000)}s\n\n`;
    });

    return md;
  }
}

