import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { parse } from '@typescript-eslint/parser';
import {
  type AnalysisResult,
  type Finding,
  type Rule,
  type PlatformAnalyzer,
  type RuleContext,
  type ProjectMetadata,
  calculateHealthScore,
} from '@rta/core';
import { EnhancedReactRules } from './rules/index.js';
import { loadConfig, applyPreset, isRuleEnabled, type AnalyzerConfig } from './config/rules.js';

/**
 * Enhanced React Web analyzer with comprehensive rule set
 */
export class ReactWebAnalyzer implements PlatformAnalyzer {
  readonly platform = 'web' as const;
  private config: AnalyzerConfig;

  constructor(configPath?: string) {
    this.config = loadConfig(configPath);
  }

  /**
   * Analyze React web project with enhanced rules
   */
  async analyzeProject(
    projectPath: string,
    options?: {
      preset?: 'strict' | 'recommended' | 'minimal';
      categories?: string[];
      enabledRules?: string[];
    }
  ): Promise<AnalysisResult> {
    // Apply options to config
    if (options?.preset) {
      this.config = applyPreset(options.preset);
    }

    const metadata = await this.detectProjectMetadata(projectPath);
    const findings = await this.analyzeFiles(projectPath, options);
    const healthScore = calculateHealthScore(findings);

    return {
      platform: this.platform,
      metadata,
      findings,
      healthScore,
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(findings),
      metrics: {
        totalFiles: this.getReactFiles(projectPath).length,
        analyzedFiles: this.getReactFiles(projectPath).length,
        errorCount: findings.filter(f => f.severity === 'error').length,
        warningCount: findings.filter(f => f.severity === 'warning').length,
        infoCount: findings.filter(f => f.severity === 'info').length,
        overallHealth: healthScore,
        ruleBreakdown: this.groupFindingsByCategory(findings),
      },
    };
  }

  /**
   * Get all supported rules (legacy + enhanced)
   */
  getSupportedPatterns(): Rule[] {
    const legacyRules: Rule[] = [
      {
        id: 'react-anonymous-function',
        name: 'Anonymous Function in JSX',
        description: 'Avoid anonymous functions in JSX props for better performance',
        severity: 'warning',
        category: 'performance',
      },
      {
        id: 'react-missing-key',
        name: 'Missing Key Prop',
        description: 'Add key prop to list items for better reconciliation',
        severity: 'error',
        category: 'correctness',
      },
      {
        id: 'typescript-any-usage',
        name: 'Any Type Usage',
        description: 'Avoid using any type, use specific types instead',
        severity: 'warning',
        category: 'type-safety',
      },
      {
        id: 'react-missing-props-interface',
        name: 'Missing Props Interface',
        description: 'Define TypeScript interfaces for component props',
        severity: 'warning',
        category: 'type-safety',
      },
    ];

    // Combine legacy rules with enhanced rules
    return [...legacyRules, ...EnhancedReactRules.getAllRules()];
  }

  /**
   * Get rules filtered by category
   */
  getRulesByCategory(categories: string[]): Rule[] {
    return this.getSupportedPatterns().filter(rule => categories.includes(rule.category));
  }

  /**
   * Generate analysis summary with category breakdown
   */
  private generateSummary(findings: Finding[]): string {
    const categories = this.groupFindingsByCategory(findings);
    const categoryCount = Object.keys(categories).length;

    if (findings.length === 0) {
      return '🎉 Excellent! No issues found in your React project';
    }

    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 3)
      .map(([cat, issues]) => `${cat} (${issues.length})`)
      .join(', ');

    return `Found ${findings.length} issues across ${categoryCount} categories. Top areas: ${topCategories}`;
  }

  /**
   * Group findings by category for better reporting
   */
  private groupFindingsByCategory(findings: Finding[]): Record<string, Finding[]> {
    return findings.reduce(
      (acc, finding) => {
        const rule = this.getSupportedPatterns().find(r => r.id === finding.ruleId);
        const category = rule?.category || 'other';

        if (!acc[category]) acc[category] = [];
        acc[category].push(finding);

        return acc;
      },
      {} as Record<string, Finding[]>
    );
  }

  private async detectProjectMetadata(projectPath: string): Promise<ProjectMetadata> {
    const packageJsonPath = join(projectPath, 'package.json');
    let packageJson: any = {};

    try {
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch (error) {
      console.warn('Could not read package.json');
    }

    const framework = this.detectFramework(packageJson);
    const reactVersion = this.detectReactVersion(packageJson);

    return {
      projectName: packageJson.name || 'Unknown Project',
      framework,
      version: packageJson.version || '0.0.0',
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      reactVersion,
      hasTypeScript: this.hasTypeScript(packageJson),
      hasTestingLibrary: this.hasTestingLibrary(packageJson),
    };
  }

  private detectFramework(packageJson: any): string {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps['next']) return 'Next.js';
    if (deps['vite']) return 'Vite';
    if (deps['react-scripts']) return 'Create React App';
    if (deps['@remix-run/react']) return 'Remix';
    if (deps['gatsby']) return 'Gatsby';
    if (deps['react']) return 'React';

    return 'Unknown';
  }

  private detectReactVersion(packageJson: any): string {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return deps['react']?.replace(/[\^~]/, '') || 'Unknown';
  }

  private hasTypeScript(packageJson: any): boolean {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return !!(deps['typescript'] || deps['@types/react']);
  }

  private hasTestingLibrary(packageJson: any): boolean {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return !!(deps['@testing-library/react'] || deps['@testing-library/jest-dom']);
  }

  private async analyzeFiles(
    projectPath: string,
    options?: {
      categories?: string[];
      enabledRules?: string[];
    }
  ): Promise<Finding[]> {
    const findings: Finding[] = [];
    const files = this.getReactFiles(projectPath);

    console.log(`🔍 Analyzing ${files.length} React files...`);

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const fileFindings = this.analyzeFile(file, content, projectPath, options);
        findings.push(...fileFindings);
      } catch (error) {
        console.warn(
          `Failed to analyze file ${file}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    return findings;
  }

  private getReactFiles(projectPath: string): string[] {
    const files: string[] = [];
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];
    const excludeDirs = ['node_modules', 'dist', 'build', '.next', '.git', 'coverage'];

    const traverse = (dir: string) => {
      try {
        const items = readdirSync(dir);

        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            if (!item.startsWith('.') && !excludeDirs.includes(item)) {
              traverse(fullPath);
            }
          } else if (extensions.includes(extname(item))) {
            // Only include React-related files
            if (this.isReactFile(fullPath)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to traverse directory ${dir}`);
      }
    };

    traverse(projectPath);
    return files;
  }

  private isReactFile(filePath: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf-8');
      // Check if file contains React-related imports or JSX
      return (
        content.includes('react') ||
        content.includes('React') ||
        content.includes('jsx') ||
        /<[A-Z]/.test(content) || // JSX component
        content.includes('useState') ||
        content.includes('useEffect') ||
        content.includes('export default') ||
        content.includes('export const')
      );
    } catch {
      return false;
    }
  }

  private analyzeFile(
    filePath: string,
    content: string,
    projectPath: string,
    options?: {
      categories?: string[];
      enabledRules?: string[];
    }
  ): Finding[] {
    const findings: Finding[] = [];
    const relativePath = relative(projectPath, filePath);

    try {
      // Parse the file to AST
      const ast = parse(content, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        range: true,
        loc: true,
      });

      const context: RuleContext = {
        filePath: relativePath,
        content,
        ast,
      };

      // Apply legacy rules (if enabled)
      if (this.shouldApplyRule('react-anonymous-function', options)) {
        findings.push(...this.checkAnonymousFunctions(context));
      }
      if (this.shouldApplyRule('react-missing-key', options)) {
        findings.push(...this.checkMissingKeys(context));
      }
      if (this.shouldApplyRule('typescript-any-usage', options)) {
        findings.push(...this.checkAnyUsage(context));
      }
      if (this.shouldApplyRule('react-missing-props-interface', options)) {
        findings.push(...this.checkMissingPropsInterface(context));
      }

      // Apply enhanced rules
      const enhancedFindings = EnhancedReactRules.analyzeWithEnhancedRules(context);
      findings.push(...this.filterFindingsByOptions(enhancedFindings, options));
    } catch (error) {
      console.warn(
        `Failed to parse ${filePath}:`,
        error instanceof Error ? error.message : 'Unknown parsing error'
      );

      // Fallback to regex-based analysis
      const context: RuleContext = {
        filePath: relativePath,
        content,
        ast: null,
      };

      if (this.shouldApplyRule('react-anonymous-function', options)) {
        findings.push(...this.checkAnonymousFunctions(context));
      }
      if (this.shouldApplyRule('react-missing-key', options)) {
        findings.push(...this.checkMissingKeys(context));
      }
      if (this.shouldApplyRule('typescript-any-usage', options)) {
        findings.push(...this.checkAnyUsage(context));
      }
      if (this.shouldApplyRule('react-missing-props-interface', options)) {
        findings.push(...this.checkMissingPropsInterface(context));
      }

      const enhancedFindings = EnhancedReactRules.analyzeWithEnhancedRules(context);
      findings.push(...this.filterFindingsByOptions(enhancedFindings, options));
    }

    return findings;
  }

  private shouldApplyRule(
    ruleId: string,
    options?: {
      categories?: string[];
      enabledRules?: string[];
    }
  ): boolean {
    // Check if rule is explicitly disabled
    if (options?.enabledRules && !options.enabledRules.includes(ruleId)) {
      return false;
    }

    // Check if rule's category is enabled
    if (options?.categories) {
      const rule = this.getSupportedPatterns().find(r => r.id === ruleId);
      if (rule && !options.categories.includes(rule.category)) {
        return false;
      }
    }

    // Check configuration
    return isRuleEnabled(ruleId, this.config);
  }

  private filterFindingsByOptions(
    findings: Finding[],
    options?: {
      categories?: string[];
      enabledRules?: string[];
    }
  ): Finding[] {
    return findings.filter(finding => {
      // Check if rule is explicitly disabled
      if (options?.enabledRules && !options.enabledRules.includes(finding.ruleId)) {
        return false;
      }

      // Check if rule's category is enabled
      if (options?.categories) {
        const rule = this.getSupportedPatterns().find(r => r.id === finding.ruleId);
        if (rule && !options.categories.includes(rule.category)) {
          return false;
        }
      }

      // Check configuration
      return isRuleEnabled(finding.ruleId, this.config);
    });
  }

  // ==================
  // LEGACY RULES (kept for compatibility)
  // ==================

  private checkAnonymousFunctions(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line: string, index: number) => {
      // Enhanced pattern matching for arrow functions in JSX
      const patterns = [
        /onClick\s*=\s*{\s*\(\)\s*=>/,
        /onChange\s*=\s*{\s*\(\)\s*=>/,
        /onSubmit\s*=\s*{\s*\(\)\s*=>/,
        /on\w+\s*=\s*{\s*\(\)\s*=>/,
      ];

      patterns.forEach(pattern => {
        if (pattern.test(line)) {
          findings.push({
            ruleId: 'react-anonymous-function',
            message: 'Avoid anonymous functions in JSX props for better performance',
            severity: 'warning',
            file: context.filePath,
            line: index + 1,
            column: line.search(pattern) + 1,
            suggestion: 'Extract function to useCallback or define outside render',
          });
        }
      });
    });

    return findings;
  }

  private checkMissingKeys(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line: string, index: number) => {
      // Enhanced key detection
      if (line.includes('.map(') && !line.includes('key=') && line.includes('<')) {
        const keywordPos = line.indexOf('.map(');
        findings.push({
          ruleId: 'react-missing-key',
          message: 'Add key prop to list items for better reconciliation',
          severity: 'error',
          file: context.filePath,
          line: index + 1,
          column: keywordPos + 1,
          suggestion: 'Add key={unique_identifier} to the JSX element',
        });
      }
    });

    return findings;
  }

  private checkAnyUsage(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line: string, index: number) => {
      const patterns = [/:\s*any\b/, /<any>/, /as\s+any\b/, /\(\w+\s*:\s*any\)/];

      patterns.forEach(pattern => {
        const match = line.match(pattern);
        if (match) {
          findings.push({
            ruleId: 'typescript-any-usage',
            message: 'Avoid using any type, use specific types instead',
            severity: 'warning',
            file: context.filePath,
            line: index + 1,
            column: (match.index || 0) + 1,
            suggestion: 'Replace any with specific TypeScript interface or type',
          });
        }
      });
    });

    return findings;
  }

  private checkMissingPropsInterface(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const content = context.content;

    // Enhanced component detection
    const componentPatterns = [
      /export\s+(?:default\s+)?function\s+([A-Z]\w*)\s*\(/,
      /(?:export\s+)?const\s+([A-Z]\w*)\s*[:=]\s*\([^)]*\)\s*=>/,
      /function\s+([A-Z]\w*)\s*\(/,
    ];

    const hasInterfaces = content.includes('interface') || content.includes('type ');

    if (!hasInterfaces) {
      componentPatterns.forEach(pattern => {
        const matches = content.matchAll(new RegExp(pattern.source, 'g'));
        for (const match of matches) {
          const componentName = match[1];
          if (componentName) {
            const lines = content.substring(0, match.index).split('\n');
            findings.push({
              ruleId: 'react-missing-props-interface',
              message: `Component ${componentName} should define TypeScript interface for props`,
              severity: 'warning',
              file: context.filePath,
              line: lines.length,
              column: 1,
              suggestion: `Create interface ${componentName}Props to define component props`,
            });
          }
        }
      });
    }

    return findings;
  }
}

/**
 * Extended project metadata interface
 */
declare module '@rta/core' {
  interface ProjectMetadata {
    reactVersion?: string;
    hasTypeScript?: boolean;
    hasTestingLibrary?: boolean;
  }

  interface AnalysisResult {
    metrics?: {
      totalFiles: number;
      analyzedFiles: number;
      errorCount: number;
      warningCount: number;
      infoCount: number;
      overallHealth: number;
      ruleBreakdown?: Record<string, Finding[]>;
    };
  }
}

/**
 * Default export
 */
export default ReactWebAnalyzer;
