#!/usr/bin/env node

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
 * Analyze command
 */
program
  .command('analyze')
  .description('Analyze a React TypeScript project')
  .argument('<path>', 'Path to the project directory')
  .option('-f, --format <format>', 'Output format (json|table|markdown)', 'table')
  .option('-o, --output <file>', 'Save results to file')
  .option('--no-ai', 'Disable AI enhancement')
  .action(async (projectPath: string, options) => {
    try {
      console.log(`🔍 Analyzing React project at: ${projectPath}`);

      if (!existsSync(projectPath)) {
        console.error('❌ Project path does not exist');
        process.exit(1);
      }

      // Initialize analyzer
      const analyzer = new ReactWebAnalyzer();
      let result = await analyzer.analyzeProject(projectPath);

      // AI Enhancement (if enabled and API key available)
      if (options.ai && process.env.CLAUDE_API_KEY) {
        console.log('🤖 Enhancing analysis with AI...');
        const claudeService = new ClaudeService({
          apiKey: process.env.CLAUDE_API_KEY,
        });
        result = await claudeService.enhanceAnalysis(result);
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
      console.log(`\n✨ Analysis complete! Health Score: ${result.healthScore}/10`);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  });

/**
 * Info command
 */
program
  .command('info')
  .description('Display project information and supported patterns')
  .action(() => {
    console.log('🚀 React TypeScript Arsenal Tools v0.1.0\n');
    console.log('Supported Platforms:');
    console.log('  • React Web (Next.js, Vite, CRA)');
    console.log('  • React Native (coming soon)\n');

    const analyzer = new ReactWebAnalyzer();
    const patterns = analyzer.getSupportedPatterns();

    console.log('📋 Analysis Rules:');
    patterns.forEach(pattern => {
      console.log(`  • ${pattern.name} (${pattern.severity})`);
      console.log(`    ${pattern.description}`);
    });

    console.log('\n🤖 AI Enhancement:');
    console.log('  Set CLAUDE_API_KEY environment variable to enable AI insights');
  });

/**
 * Init command
 */
program
  .command('init')
  .description('Initialize RTA configuration in current project')
  .action(() => {
    const configPath = join(process.cwd(), '.rta.json');

    if (existsSync(configPath)) {
      console.log('⚠️  Configuration file already exists');
      return;
    }

    const config = {
      version: '0.1.0',
      rules: {
        'react-anonymous-function': 'warning',
        'react-missing-key': 'error',
        'typescript-any-usage': 'warning',
        'react-missing-props-interface': 'warning',
      },
      ignorePatterns: ['node_modules/**', 'dist/**', 'build/**', '*.test.ts', '*.spec.ts'],
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Created .rta.json configuration file');
  });

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
  if (errorCount > 0) output += `  ❌ Errors: ${errorCount}\n`;
  if (warningCount > 0) output += `  ⚠️  Warnings: ${warningCount}\n`;
  if (infoCount > 0) output += `  ℹ️  Info: ${infoCount}\n`;
  output += '\n';

  output += '🎯 Issues Detail:\n';
  output += '-'.repeat(80) + '\n';

  result.findings.forEach((finding, index) => {
    const icon =
      finding.severity === 'error' ? '❌' : finding.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';

    output += `${index + 1}. ${icon} ${finding.message}\n`;
    output += `   📁 ${finding.file}:${finding.line}:${finding.column}\n`;
    output += `   🏷️  Rule: ${finding.ruleId}\n\n`;
  });

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
  let output = `# Analysis Results\n\n`;

  output += `**Project:** ${result.metadata.projectName}\n`;
  output += `**Framework:** ${result.metadata.framework}\n`;
  output += `**Health Score:** ${result.healthScore}/10\n`;
  output += `**Issues Found:** ${result.findings.length}\n\n`;

  if (result.findings.length === 0) {
    output += '✅ No issues found!\n';
    return output;
  }

  output += '## Issues\n\n';

  result.findings.forEach((finding, index) => {
    const severity = finding.severity.toUpperCase();
    output += `### ${index + 1}. [${severity}] ${finding.message}\n\n`;
    output += `**File:** \`${finding.file}:${finding.line}:${finding.column}\`\n`;
    output += `**Rule:** \`${finding.ruleId}\`\n\n`;
  });

  if (
    result.summary &&
    result.summary !== `Found ${result.findings.length} issues in React project`
  ) {
    output += '## AI Summary\n\n';
    output += result.summary + '\n\n';
  }

  return output;
}

// Execute CLI
program.parse();

export default program;
