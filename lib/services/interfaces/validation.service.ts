import { ValidationResult, ValidationCheck } from '../../types/code';

export interface ValidationService {
  runTypecheck(jobId: string): Promise<ValidationCheck>;
  runLint(jobId: string): Promise<ValidationCheck>;
  runTests(jobId: string): Promise<ValidationCheck>;
  runBuild(jobId: string): Promise<ValidationCheck>;
  runAll(jobId: string): Promise<ValidationResult>;
}
