/**
 * Playwright JSON Reporter
 * 
 * Custom reporter that saves test results to JSON
 */

import type { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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

class PlaywrightJSONReporter {
  private results: TestCaseResult[] = [];
  private startTime = Date.now();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const file = test.location.file || 'unknown';
    const project = test.titlePath()[0] || 'unknown';

    this.results.push({
      title: test.title,
      file,
      duration: result.duration,
      status: result.status,
      error: result.error?.message || undefined,
      retries: result.retry,
      project,
    });
  }

  onEnd(result: FullResult) {
    const suites = new Map<string, TestSuiteResult>();
    const projects: Record<string, { passed: number; failed: number; skipped: number }> = {};

    // Group by file
    this.results.forEach((testResult) => {
      const suiteName = testResult.file;
      
      if (!suites.has(suiteName)) {
        suites.set(suiteName, {
          file: suiteName,
          tests: [],
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        });
      }

      const suite = suites.get(suiteName)!;
      suite.tests.push(testResult);
      suite.duration += testResult.duration;

      if (testResult.status === 'passed') {
        suite.passed++;
      } else if (testResult.status === 'failed' || testResult.status === 'timedOut') {
        suite.failed++;
      } else {
        suite.skipped++;
      }

      // Track by project
      if (!projects[testResult.project]) {
        projects[testResult.project] = { passed: 0, failed: 0, skipped: 0 };
      }

      if (testResult.status === 'passed') {
        projects[testResult.project].passed++;
      } else if (testResult.status === 'failed' || testResult.status === 'timedOut') {
        projects[testResult.project].failed++;
      } else {
        projects[testResult.project].skipped++;
      }
    });

    const totalPassed = this.results.filter(r => r.status === 'passed').length;
    const totalFailed = this.results.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
    const totalSkipped = this.results.filter(r => r.status === 'skipped').length;

    const report: PlaywrightReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        duration: Date.now() - this.startTime,
      },
      suites: Array.from(suites.values()),
      projects,
    };

    // Save report
    const outputDir = join(process.cwd(), 'test-results');
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `playwright-report-${timestamp}.json`);
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`\n📊 Playwright JSON report saved: ${reportPath}`);
    
    return result;
  }
}

export default PlaywrightJSONReporter;
