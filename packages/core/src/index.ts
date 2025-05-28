export const VERSION = '0.1.0';

/**
 * Platform types
 */
export interface Platform {
  name: 'web' | 'native' | 'shared';
}

/**
 * Analysis finding/issue
 */
export interface Finding {
  ruleId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  column: number;
  suggestion?: string;
}

/**
 * Analysis rule definition
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  platforms?: Platform['name'][];
}

/**
 * Project metadata information
 */
export interface ProjectMetadata {
  projectName: string;
  framework: string;
  version: string;
  dependencies: string[];
  devDependencies: string[];
}

/**
 * Rule execution context
 */
export interface RuleContext {
  filePath: string;
  content: string;
  ast?: any; // AST representation
}

/**
 * Analysis result structure
 */
export interface AnalysisResult {
  platform: string;
  timestamp: string;
  findings: Finding[];
  metadata: ProjectMetadata;
  healthScore: number;
  summary?: string;
  metrics?: {
    totalFiles: number;
    analyzedFiles: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    overallHealth: number;
  };
}

/**
 * Platform analyzer interface
 */
export interface PlatformAnalyzer {
  readonly platform: Platform['name'];
  analyzeProject(projectPath: string): Promise<AnalysisResult>;
  getSupportedPatterns(): Rule[];
}

/**
 * Calculate health score based on findings
 */
export function calculateHealthScore(findings: Finding[]): number {
  if (findings.length === 0) return 10;

  const errorCount = findings.filter(f => f.severity === 'error').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;

  const penalty = errorCount * 2 + warningCount * 1 + infoCount * 0.5;
  const score = Math.max(0, 10 - penalty);

  return Math.round(score * 10) / 10;
}

/**
 * Helper function to create default project metadata
 */
export function createDefaultMetadata(): ProjectMetadata {
  return {
    projectName: 'Unknown Project',
    framework: 'Unknown',
    version: '0.0.0',
    dependencies: [],
    devDependencies: [],
  };
}
