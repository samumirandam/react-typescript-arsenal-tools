// packages/core/src/types.ts - Add these extensions to existing types

/**
 * Enhanced AnalysisResult with AI integration fields
 */
export interface AnalysisResult {
  /** Overall health score 0-10 */
  healthScore: number;

  /** Human-readable summary of the analysis */
  summary: string;

  /** List of issues found */
  findings: Finding[];

  /** Project metadata */
  metadata: ProjectMetadata;

  /** AI Enhancement fields */
  aiEnhanced?: boolean;
  aiModel?: string;
  aiError?: string;

  /** Performance metrics */
  performance?: {
    analysisTimeMs: number;
    filesScanned: number;
    rulesExecuted: number;
  };

  /** Configuration used for analysis */
  config?: {
    platform: Platform;
    rulesEnabled: string[];
    aiEnabled: boolean;
  };
}

/**
 * Enhanced Finding with AI suggestions
 */
export interface Finding {
  /** Unique rule identifier */
  ruleId: string;

  /** Human-readable description */
  message: string;

  /** Severity level */
  severity: 'error' | 'warning' | 'info';

  /** File path relative to project root */
  file: string;

  /** Line number (1-indexed) */
  line: number;

  /** Column number (1-indexed) */
  column: number;

  /** Issue category */
  category: string;

  /** AI-generated suggestion (optional) */
  suggestion?: string;

  /** Code snippet context (optional) */
  snippet?: {
    code: string;
    startLine: number;
    endLine: number;
  };

  /** Fix information (future feature) */
  fix?: {
    description: string;
    automated: boolean;
    changes: Array<{
      file: string;
      oldText: string;
      newText: string;
      line: number;
      column: number;
    }>;
  };
}

/**
 * AI Service interface for different providers
 */
export interface AIService {
  /** Enhance analysis with AI insights */
  enhanceAnalysis(analysis: AnalysisResult): Promise<AnalysisResult>;

  /** Generate insights from findings */
  generateInsights(findings: Finding[]): Promise<{
    summary: string;
    suggestions: string[];
  }>;

  /** Analyze specific code snippet */
  analyzeCodeSnippet(
    code: string,
    filePath: string,
    context?: string
  ): Promise<{
    insights: string[];
    suggestions: string[];
  }>;

  /** Test service connection */
  testConnection(): Promise<{
    success: boolean;
    model?: string;
    error?: string;
  }>;
}

/**
 * Configuration for AI analysis
 */
export interface AIConfig {
  /** Enable AI enhancement */
  enabled: boolean;

  /** AI service provider */
  provider: 'claude' | 'openai' | 'custom';

  /** Service-specific configuration */
  config: Record<string, any>;

  /** Cost limits */
  limits?: {
    maxTokensPerRequest?: number;
    maxRequestsPerHour?: number;
    maxCostPerDay?: number; // in USD
  };

  /** Caching settings */
  cache?: {
    enabled: boolean;
    ttlHours: number;
    maxSizeMB: number;
  };
}

/**
 * Analysis options with AI support
 */
export interface AnalysisOptions {
  /** Project path to analyze */
  projectPath: string;

  /** Platform to analyze for */
  platform: Platform;

  /** Rules to enable/disable */
  rules?: {
    include?: string[];
    exclude?: string[];
  };

  /** Output configuration */
  output?: {
    format: 'json' | 'table' | 'markdown';
    file?: string;
    verbose?: boolean;
  };

  /** AI configuration */
  ai?: AIConfig;

  /** Performance options */
  performance?: {
    parallel?: boolean;
    maxWorkers?: number;
    timeout?: number;
  };
}

/**
 * Enhanced project metadata with AI insights
 */
export interface ProjectMetadata {
  /** Project name */
  projectName: string;

  /** Detected framework */
  framework: string;

  /** TypeScript usage */
  hasTypeScript: boolean;

  /** Number of files analyzed */
  filesAnalyzed: number;

  /** Estimated lines of code */
  linesOfCode?: number;

  /** Analysis timestamp */
  analyzedAt: string;

  /** Package.json data */
  packageInfo?: {
    version: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  /** Build configuration detected */
  buildConfig?: {
    bundler: 'webpack' | 'vite' | 'parcel' | 'rollup' | 'unknown';
    hasESLint: boolean;
    hasPrettier: boolean;
    hasJest: boolean;
    hasStorybook: boolean;
  };

  /** AI analysis metadata */
  aiAnalysis?: {
    model: string;
    tokensUsed: number;
    estimatedCost: number;
    enhancementTime: number;
  };
}
