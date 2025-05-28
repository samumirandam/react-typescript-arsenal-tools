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

/**
 * React Web specific analyzer implementation
 */
export class ReactWebAnalyzer implements PlatformAnalyzer {
  readonly platform = 'web' as const;

  /**
   * Analyze React web project
   */
  async analyzeProject(projectPath: string): Promise<AnalysisResult> {
    const metadata = await this.detectProjectMetadata(projectPath);
    const findings = await this.analyzeFiles(projectPath);
    const healthScore = calculateHealthScore(findings);

    return {
      platform: this.platform,
      metadata,
      findings,
      healthScore,
      timestamp: new Date().toISOString(),
      summary: `Found ${findings.length} issues in React project`,
      metrics: {
        totalFiles: this.getReactFiles(projectPath).length,
        analyzedFiles: this.getReactFiles(projectPath).length,
        errorCount: findings.filter(f => f.severity === 'error').length,
        warningCount: findings.filter(f => f.severity === 'warning').length,
        infoCount: findings.filter(f => f.severity === 'info').length,
        overallHealth: healthScore,
      },
    };
  }

  /**
   * Get supported analysis rules
   */
  getSupportedPatterns(): Rule[] {
    return [
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
        id: 'react-missing-memo',
        name: 'Missing React.memo',
        description: 'Consider using React.memo for performance optimization',
        severity: 'info',
        category: 'performance',
      },
      {
        id: 'react-missing-props-interface',
        name: 'Missing Props Interface',
        description: 'Define TypeScript interfaces for component props',
        severity: 'warning',
        category: 'type-safety',
      },
    ];
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

    return {
      projectName: packageJson.name || 'Unknown Project',
      framework,
      version: packageJson.version || '0.0.0',
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
    };
  }

  private detectFramework(packageJson: any): string {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps['next']) return 'Next.js';
    if (deps['vite']) return 'Vite';
    if (deps['react-scripts']) return 'Create React App';
    if (deps['react']) return 'React';

    return 'Unknown';
  }

  private async analyzeFiles(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const files = this.getReactFiles(projectPath);

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const fileFindings = this.analyzeFile(file, content, projectPath);
        findings.push(...fileFindings);
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    return findings;
  }

  private getReactFiles(projectPath: string): string[] {
    const files: string[] = [];
    const extensions = ['.tsx', '.ts', '.jsx', '.js'];

    const traverse = (dir: string) => {
      try {
        const items = readdirSync(dir);

        for (const item of items) {
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules and build directories
            if (!item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
              traverse(fullPath);
            }
          } else if (extensions.includes(extname(item))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Failed to traverse directory ${dir}`);
      }
    };

    traverse(projectPath);
    return files;
  }

  private analyzeFile(filePath: string, content: string, projectPath: string): Finding[] {
    const findings: Finding[] = [];
    const relativePath = relative(projectPath, filePath);

    try {
      // Parse the file to AST
      const ast = parse(content, {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      });

      const context: RuleContext = {
        filePath: relativePath,
        content,
        ast,
      };

      // Apply rules
      findings.push(...this.checkAnonymousFunctions(context));
      findings.push(...this.checkMissingKeys(context));
      findings.push(...this.checkAnyUsage(context));
      findings.push(...this.checkMissingPropsInterface(context));
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error);
    }

    return findings;
  }

  private checkAnonymousFunctions(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    // Simple regex-based check for demonstration
    const lines = context.content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (line.includes('onClick={() =>') || line.includes('onChange={() =>')) {
        findings.push({
          ruleId: 'react-anonymous-function',
          message: 'Avoid anonymous functions in JSX props for better performance',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('() =>') + 1,
        });
      }
    });

    return findings;
  }

  private checkMissingKeys(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    const lines = context.content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (line.includes('.map(') && !line.includes('key=')) {
        findings.push({
          ruleId: 'react-missing-key',
          message: 'Add key prop to list items for better reconciliation',
          severity: 'error',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('.map(') + 1,
        });
      }
    });

    return findings;
  }

  private checkAnyUsage(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    const lines = context.content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (line.includes(': any') || line.includes('<any>')) {
        findings.push({
          ruleId: 'typescript-any-usage',
          message: 'Avoid using any type, use specific types instead',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('any') + 1,
        });
      }
    });

    return findings;
  }

  private checkMissingPropsInterface(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    const lines = context.content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (
        line.includes('function ') &&
        line.includes('({') &&
        !context.content.includes('interface')
      ) {
        findings.push({
          ruleId: 'react-missing-props-interface',
          message: 'Define TypeScript interfaces for component props',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: 1,
        });
      }
    });

    return findings;
  }
}

/**
 * Default export
 */
export default ReactWebAnalyzer;
