import { ValidationService } from '../interfaces/validation.service';
import { ValidationResult, ValidationCheck } from '../../types/code';

export class MockValidationService implements ValidationService {
  async runTypecheck(jobId: string): Promise<ValidationCheck> {
    return {
      id: `chk_tc_${Date.now()}`,
      type: 'typecheck',
      name: 'TypeScript Compiler (`tsc --noEmit`)',
      status: 'passed',
      durationMs: 2300,
    };
  }

  async runLint(jobId: string): Promise<ValidationCheck> {
    return {
      id: `chk_lint_${Date.now()}`,
      type: 'lint',
      name: 'ESLint Code Rules Check',
      status: 'passed',
      durationMs: 1400,
    };
  }

  async runTests(jobId: string): Promise<ValidationCheck> {
    return {
      id: `chk_test_${Date.now()}`,
      type: 'unit_tests',
      name: 'Jest Unit & Integration Test Suite (14 passed)',
      status: 'passed',
      durationMs: 4200,
    };
  }

  async runBuild(jobId: string): Promise<ValidationCheck> {
    return {
      id: `chk_bld_${Date.now()}`,
      type: 'build',
      name: 'Next.js Production Build Validation',
      status: 'passed',
      durationMs: 3800,
    };
  }

  async runAll(jobId: string): Promise<ValidationResult> {
    const tc = await this.runTypecheck(jobId);
    const lint = await this.runLint(jobId);
    const tests = await this.runTests(jobId);
    const build = await this.runBuild(jobId);

    return {
      status: 'passed',
      totalChecks: 4,
      passedChecks: 4,
      failedChecks: 0,
      checks: [tc, lint, tests, build],
    };
  }
}
