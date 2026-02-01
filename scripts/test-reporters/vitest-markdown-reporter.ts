/**
 * Vitest Markdown Reporter
 * 
 * Generates markdown report from test results
 */

import type { Reporter, File } from 'vitest';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readdir } from 'fs/promises';

interface TestResult {
  file: string;
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  suite?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface TestReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  suites: TestSuite[];
}

class VitestMarkdownReporter implements Reporter {
  private startTime = Date.now();

  async onFinished(files: File[] = [], errors: unknown[] = []) {
    // Find latest JSON report
    const outputDir = join(process.cwd(), 'test-results');
    
    let jsonFiles: string[] = [];
    try {
      const files = await readdir(outputDir);
      jsonFiles = files
        .filter(f => f.match(/^vitest-report-.*\.json$/))
        .map(f => join(outputDir, f))
        .filter(f => existsSync(f));
    } catch (e) {
      // Directory might not exist
    }
    
    if (jsonFiles.length === 0) {
      console.warn('⚠️  No JSON report found. Run tests with JSON reporter first.');
      return;
    }

    const latestJson = jsonFiles.sort().reverse()[0];
    const report: TestReport = JSON.parse(readFileSync(latestJson, 'utf-8'));

    // Generate markdown
    const markdown = this.generateMarkdown(report);

    // Save markdown report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `vitest-report-${timestamp}.md`);
    
    writeFileSync(reportPath, markdown, 'utf-8');
    
    console.log(`📝 Vitest Markdown report saved: ${reportPath}`);
  }

  private generateMarkdown(report: TestReport): string {
    const { summary, suites } = report;
    const passRate = summary.total > 0 
      ? Math.round((summary.passed / summary.total) * 100) 
      : 0;

    let md = `# Vitest Test Report\n\n`;
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

    // Failed tests
    const failedSuites = suites.filter(s => s.failed > 0);
    if (failedSuites.length > 0) {
      md += `## ❌ Failed Tests\n\n`;
      failedSuites.forEach((suite) => {
        const failedTests = suite.tests.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
          md += `### ${suite.name}\n\n`;
          failedTests.forEach((test) => {
            md += `- **${test.name}**\n`;
            md += `  - Duration: ${test.duration}ms\n`;
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
      
      md += `### ${suite.name}\n\n`;
      md += `- **Total**: ${suite.tests.length} tests\n`;
      md += `- **Passed**: ${suite.passed} (${suitePassRate}%)\n`;
      md += `- **Failed**: ${suite.failed}\n`;
      md += `- **Skipped**: ${suite.skipped}\n`;
      md += `- **Duration**: ${Math.round(suite.duration)}ms\n\n`;
    });

    return md;
  }
}

export default VitestMarkdownReporter;
