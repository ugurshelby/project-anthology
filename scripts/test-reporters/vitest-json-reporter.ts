/**
 * Vitest JSON Reporter
 * 
 * Saves test results to JSON file for analysis and reporting
 */

import type { Reporter, File, TaskResultPack } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export default class VitestJSONReporter implements Reporter {
  private results: TestResult[] = [];
  private startTime = Date.now();

  onFinished(files: File[] = [], errors: unknown[] = []) {
    const suites = new Map<string, TestSuite>();
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    // Process test files
    files.forEach((file) => {
      const suiteName = file.name || 'Unknown';
      const suite: TestSuite = {
        name: suiteName,
        tests: [],
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      };

      const processTask = (task: any) => {
        if (task.type === 'test') {
          const result: TestResult = {
            file: file.name || '',
            name: task.name || '',
            duration: task.result?.duration || 0,
            status: task.mode === 'skip' ? 'skipped' : 
                   task.result?.state === 'pass' ? 'passed' : 'failed',
            suite: suiteName,
            error: task.result?.errors?.[0]?.message || undefined,
          };

          suite.tests.push(result);
          suite.duration += result.duration;

          if (result.status === 'passed') {
            suite.passed++;
            totalPassed++;
          } else if (result.status === 'failed') {
            suite.failed++;
            totalFailed++;
          } else {
            suite.skipped++;
            totalSkipped++;
          }

          totalDuration += result.duration;
        }

        if (task.tasks) {
          task.tasks.forEach(processTask);
        }
      };

      file.tasks.forEach(processTask);
      suites.set(suiteName, suite);
    });

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalPassed + totalFailed + totalSkipped,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        duration: Date.now() - this.startTime,
      },
      suites: Array.from(suites.values()),
    };

    // Save report
    const outputDir = join(process.cwd(), 'test-results');
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(outputDir, `vitest-report-${timestamp}.json`);
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(`\n📊 Vitest JSON report saved: ${reportPath}`);
    
    return report;
  }
}

