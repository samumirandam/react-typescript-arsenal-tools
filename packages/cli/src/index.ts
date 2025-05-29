import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ReactWebAnalyzer } from '@rta/analyzer-web';
import { ClaudeService } from '@rta/claude-integration';
import type { AnalysisResult } from '@rta/core';

const program = new Command();

program
  .name('rta')
  .description('React TypeScript Arsenal - AI-powered code analysis')
  .version('0.1.0');

/**
 * Analyze command with enhanced options
 */
program
  .command('analyze')
  .description('Analyze a React TypeScript project')
  .argument('<path>', 'Path to the project directory')
  .option('-f, --format <format>', 'Output format (json|table|markdown)', 'table')
  .option('-o, --output <file>', 'Save results to file')
  .option('--no-ai', 'Disable AI enhancement')
  .option('--ai', 'Enable AI enhancement')
  .option(
    '-p, --preset <preset>',
    'Use preset configuration (minimal|recommended|strict)',
    'recommended'
  )
  .option(
    '-c, --category <categories>',
    'Filter by categories (comma-separated): react-hooks,performance,accessibility,type-safety,correctness'
  )
  .option('-r, --rules <rules>', 'Enable specific rules (comma-separated)')
  .option('--list-rules', 'List all available rules and exit')
  .option('--list-categories', 'List all available categories and exit')
  .action(async (projectPath: string, options) => {
    try {
      // Handle list options
      if (options.listRules) {
        listRules();
        return;
      }

      if (options.listCategories) {
        listCategories();
        return;
      }

      console.log(`🔍 Analyzing React project at: ${projectPath}`);
      console.log(`⚙️  Preset: ${options.preset}`);

      if (!existsSync(projectPath)) {
        console.error('❌ Project path does not exist');
        process.exit(1);
      }

      // Parse options
      const analyzerOptions: any = {
        preset: options.preset,
      };

      if (options.category) {
        analyzerOptions.categories = options.category.split(',').map((c: string) => c.trim());
        console.log(`🏷️  Categories: ${analyzerOptions.categories.join(', ')}`);
      }

      if (options.rules) {
        analyzerOptions.enabledRules = options.rules.split(',').map((r: string) => r.trim());
        console.log(`📋 Rules: ${analyzerOptions.enabledRules.join(', ')}`);
      }

      // Initialize analyzer
      const analyzer = new ReactWebAnalyzer();
      let result = await analyzer.analyzeProject(projectPath, analyzerOptions);

      // AI Enhancement (if enabled and API key available)
      if (options.ai && process.env.CLAUDE_API_KEY) {
        console.log('🤖 Enhancing analysis with AI...');
        const claudeService = new ClaudeService({
          apiKey: process.env.CLAUDE_API_KEY,
        });
        result = await claudeService.enhanceAnalysis(result);
      } else if (options.ai && !process.env.CLAUDE_API_KEY) {
        console.log('⚠️  AI enhancement requested but CLAUDE_API_KEY not found');
      }

      // Output results
      const output = formatOutput(result, options.format);

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`💾 Results saved to: ${options.output}`);
      } else {
        console.log(output);
      }

      // Summary
      const summary = generateSummary(result);
      console.log(summary);

      // Exit with appropriate code
      const hasErrors = result.findings.some(f => f.severity === 'error');
      process.exit(hasErrors ? 1 : 0);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  });

/**
 * Info command with enhanced rule information
 */
program
  .command('info')
  .description('Display project information and supported patterns')
  .option('--rules', 'Show detailed rule information')
  .action(options => {
    console.log('🚀 React TypeScript Arsenal Tools v0.1.0\n');

    if (options.rules) {
      showDetailedRules();
      return;
    }

    console.log('📋 Available Presets:');
    console.log('  • minimal    - Critical issues only (errors + key warnings)');
    console.log('  • recommended - Balanced analysis (default)');
    console.log('  • strict     - Comprehensive analysis with all rules\n');

    console.log('🏷️ Available Categories:');
    console.log('  • react-hooks     - React hooks best practices');
    console.log('  • performance     - Performance optimizations');
    console.log('  • accessibility   - Accessibility compliance');
    console.log('  • type-safety     - TypeScript type safety');
    console.log('  • correctness     - Code correctness');
    console.log('  • best-practices  - General best practices\n');

    console.log('🤖 AI Enhancement:');
    console.log('  Set CLAUDE_API_KEY environment variable to enable AI insights\n');

    console.log('💡 Examples:');
    console.log('  rta analyze ./my-project --preset=strict');
    console.log('  rta analyze ./my-project --category=accessibility,performance');
    console.log('  rta analyze ./my-project --rules=missing-alt-text,react-missing-key');
    console.log('  rta analyze ./my-project --ai --format=markdown -o report.md');
  });

/**
 * Init command
 */
program
  .command('init')
  .description('Initialize RTA configuration in current project')
  .option(
    '-p, --preset <preset>',
    'Initialize with preset (minimal|recommended|strict)',
    'recommended'
  )
  .action(options => {
    const configPath = join(process.cwd(), '.rta.json');

    if (existsSync(configPath)) {
      console.log('⚠️  Configuration file already exists');
      return;
    }

    const presetConfigs = {
      minimal: {
        version: '0.1.0',
        preset: 'minimal',
        categories: ['accessibility', 'correctness', 'type-safety'],
        ignorePatterns: ['node_modules/**', 'dist/**', 'build/**', '*.test.ts', '*.spec.ts'],
      },
      recommended: {
        version: '0.1.0',
        preset: 'recommended',
        categories: ['react-hooks', 'performance', 'accessibility', 'type-safety', 'correctness'],
        ignorePatterns: ['node_modules/**', 'dist/**', 'build/**', '*.test.ts', '*.spec.ts'],
      },
      strict: {
        version: '0.1.0',
        preset: 'strict',
        categories: [
          'react-hooks',
          'performance',
          'accessibility',
          'type-safety',
          'correctness',
          'best-practices',
        ],
        ignorePatterns: ['node_modules/**', 'dist/**', 'build/**'],
      },
    };

    const config =
      presetConfigs[options.preset as keyof typeof presetConfigs] || presetConfigs.recommended;

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Created .rta.json configuration file with ${options.preset} preset`);
  });

/**
 * List all available rules
 */
function listRules() {
  console.log('📋 Available Rules:\n');

  const analyzer = new ReactWebAnalyzer();
  const rules = analyzer.getSupportedPatterns();

  const rulesByCategory = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.category]) acc[rule.category] = [];
      acc[rule.category].push(rule);
      return acc;
    },
    {} as Record<string, typeof rules>
  );

  Object.entries(rulesByCategory).forEach(([category, categoryRules]) => {
    console.log(`🏷️ ${category.toUpperCase()}`);
    categoryRules.forEach(rule => {
      const severityIcon =
        rule.severity === 'error' ? '🚨' : rule.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${severityIcon} ${rule.id}`);
      console.log(`     ${rule.description}`);
    });
    console.log('');
  });
}

/**
 * List all available categories
 */
function listCategories() {
  console.log('🏷️ Available Categories:\n');

  const categories = {
    'react-hooks': 'React hooks best practices and dependency management',
    performance: 'Performance optimizations and anti-patterns',
    accessibility: 'Web accessibility (WCAG) compliance',
    'type-safety': 'TypeScript type safety and best practices',
    correctness: 'Code correctness and bug prevention',
    'best-practices': 'General React and JavaScript best practices',
  };

  Object.entries(categories).forEach(([category, description]) => {
    console.log(`• ${category}`);
    console.log(`  ${description}\n`);
  });
}

/**
 * Show detailed rule information
 */
function showDetailedRules() {
  const analyzer = new ReactWebAnalyzer();
  const rules = analyzer.getSupportedPatterns();

  console.log(`📋 Detailed Rules (${rules.length} total):\n`);

  rules.forEach((rule, index) => {
    const severityIcon =
      rule.severity === 'error' ? '🚨' : rule.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${index + 1}. ${severityIcon} ${rule.name}`);
    console.log(`   ID: ${rule.id}`);
    console.log(`   Category: ${rule.category}`);
    console.log(`   Severity: ${rule.severity}`);
    console.log(`   Description: ${rule.description}\n`);
  });
}

/**
 * Generate summary with enhanced metrics
 */
function generateSummary(result: AnalysisResult): string {
  let summary = '\n🎯 Analysis Summary\n';
  summary += '='.repeat(50) + '\n';

  summary += `✨ Health Score: ${result.healthScore}/10\n`;
  summary += `📊 Issues: ${result.findings.length} total\n`;

  if (result.metrics) {
    summary += `📁 Files: ${result.metrics.analyzedFiles} analyzed\n`;

    if (result.metrics.errorCount > 0) summary += `🚨 Errors: ${result.metrics.errorCount}\n`;
    if (result.metrics.warningCount > 0)
      summary += `⚠️  Warnings: ${result.metrics.warningCount}\n`;
    if (result.metrics.infoCount > 0) summary += `ℹ️  Info: ${result.metrics.infoCount}\n`;

    if (result.metrics.ruleBreakdown) {
      summary += '\n🏷️ Issues by Category:\n';
      Object.entries(result.metrics.ruleBreakdown)
        .sort(([, a], [, b]) => b.length - a.length)
        .forEach(([category, issues]) => {
          summary += `  • ${category}: ${issues.length} issues\n`;
        });
    }
  }

  if (result.findings.length === 0) {
    summary += '\n🎉 Excellent! No issues found!';
  } else {
    summary += '\n💡 Run with --ai flag for AI-powered insights';
  }

  return summary;
}

/**
 * Format analysis output
 */
function formatOutput(result: AnalysisResult, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);

    case 'markdown':
      return formatMarkdown(result);

    case 'table':
    default:
      return formatTable(result);
  }
}

function formatTable(result: AnalysisResult): string {
  let output = '\n🔍 Analysis Results\n';
  output += '=' + '='.repeat(50) + '\n\n';

  output += `📊 Project: ${result.metadata.projectName}\n`;
  output += `🏗️  Framework: ${result.metadata.framework}\n`;
  output += `💯 Health Score: ${result.healthScore}/10\n`;
  output += `🔍 Issues Found: ${result.findings.length}\n\n`;

  if (result.findings.length === 0) {
    output += '✅ No issues found! Great job!\n';
    return output;
  }

  const errorCount = result.findings.filter(f => f.severity === 'error').length;
  const warningCount = result.findings.filter(f => f.severity === 'warning').length;
  const infoCount = result.findings.filter(f => f.severity === 'info').length;

  output += `📈 Issue Breakdown:\n`;
  if (errorCount > 0) output += `  🚨 Errors: ${errorCount}\n`;
  if (warningCount > 0) output += `  ⚠️  Warnings: ${warningCount}\n`;
  if (infoCount > 0) output += `  ℹ️  Info: ${infoCount}\n`;
  output += '\n';

  // Group by category for better organization
  if (result.metrics?.ruleBreakdown) {
    output += '🏷️ Issues by Category:\n';
    Object.entries(result.metrics.ruleBreakdown)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([category, issues]) => {
        output += `\n📂 ${category.toUpperCase()} (${issues.length} issues)\n`;
        output += '-'.repeat(40) + '\n';

        issues.slice(0, 5).forEach((finding, index) => {
          const icon =
            finding.severity === 'error' ? '🚨' : finding.severity === 'warning' ? '⚠️' : 'ℹ️';
          output += `${index + 1}. ${icon} ${finding.message}\n`;
          output += `   📁 ${finding.file}:${finding.line}:${finding.column}\n`;
          if (finding.suggestion) {
            output += `   💡 ${finding.suggestion}\n`;
          }
          output += '\n';
        });

        if (issues.length > 5) {
          output += `   ... and ${issues.length - 5} more issues in this category\n\n`;
        }
      });
  } else {
    output += '🎯 Issues Detail:\n';
    output += '-'.repeat(80) + '\n';

    result.findings.slice(0, 10).forEach((finding, index) => {
      const icon =
        finding.severity === 'error' ? '🚨' : finding.severity === 'warning' ? '⚠️' : 'ℹ️';
      output += `${index + 1}. ${icon} ${finding.message}\n`;
      output += `   📁 ${finding.file}:${finding.line}:${finding.column}\n`;
      output += `   🏷️  Rule: ${finding.ruleId}\n`;
      if (finding.suggestion) {
        output += `   💡 ${finding.suggestion}\n`;
      }
      output += '\n';
    });

    if (result.findings.length > 10) {
      output += `... and ${result.findings.length - 10} more issues\n\n`;
    }
  }

  if (
    result.summary &&
    result.summary !== `Found ${result.findings.length} issues in React project`
  ) {
    output += '🤖 AI Summary:\n';
    output += result.summary + '\n\n';
  }

  return output;
}

function formatMarkdown(result: AnalysisResult): string {
  let output = `# React TypeScript Arsenal - Analysis Results\n\n`;

  output += `**Project:** ${result.metadata.projectName}\n`;
  output += `**Framework:** ${result.metadata.framework}\n`;
  output += `**Health Score:** ${result.healthScore}/10\n`;
  output += `**Issues Found:** ${result.findings.length}\n`;
  output += `**Analysis Date:** ${new Date(result.timestamp).toLocaleDateString()}\n\n`;

  if (result.findings.length === 0) {
    output += '## ✅ No Issues Found!\n\nYour React project looks great!\n';
    return output;
  }

  // Add metrics section
  if (result.metrics) {
    output += `## 📊 Metrics\n\n`;
    output += `- **Files Analyzed:** ${result.metrics.analyzedFiles}\n`;
    output += `- **Errors:** ${result.metrics.errorCount}\n`;
    output += `- **Warnings:** ${result.metrics.warningCount}\n`;
    output += `- **Info:** ${result.metrics.infoCount}\n\n`;
  }

  // Add issues by category
  if (result.metrics?.ruleBreakdown) {
    output += `## 🏷️ Issues by Category\n\n`;
    Object.entries(result.metrics.ruleBreakdown)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([category, issues]) => {
        output += `### ${category.replace('-', ' ').toUpperCase()} (${issues.length} issues)\n\n`;

        issues.forEach((finding, index) => {
          const severity = finding.severity.toUpperCase();
          output += `**${index + 1}. [${severity}] ${finding.message}**\n\n`;
          output += `- **File:** \`${finding.file}:${finding.line}:${finding.column}\`\n`;
          output += `- **Rule:** \`${finding.ruleId}\`\n`;
          if (finding.suggestion) {
            output += `- **Suggestion:** ${finding.suggestion}\n`;
          }
          output += '\n';
        });
      });
  }

  if (
    result.summary &&
    result.summary !== `Found ${result.findings.length} issues in React project`
  ) {
    output += '## 🤖 AI Summary\n\n';
    output += result.summary + '\n\n';
  }

  return output;
}

// Execute CLI
program.parse();

export default program;
