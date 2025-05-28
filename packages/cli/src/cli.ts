
#!/usr/bin/env node



import { Command } from 'commander';

import chalk from 'chalk';

import { ReactWebAnalyzer } from '@rta/analyzer-web';



const program = new Command();



program

  .name('rta')

  .description('React TypeScript Arsenal - AI-powered code analysis tools')

  .version('0.1.0');



program

  .command('analyze')

  .description('Analyze a React/TypeScript project')

  .argument('<project-path>', 'Path to the project to analyze')

  .action(async (projectPath: string) => {

    console.log(chalk.blue('🔍 Analyzing project:'), projectPath);

    

    const analyzer = new ReactWebAnalyzer();

    

    try {

      const result = await analyzer.analyzeProject(projectPath);

      

      console.log(chalk.green('✅ Analysis complete!'));

      console.log(chalk.blue('Health Score:'), `${result.metrics.overallHealth}/10`);

      console.log(chalk.blue('Files Analyzed:'), result.metrics.analyzedFiles);

      

    } catch (error) {

      console.error(chalk.red('❌ Analysis failed:'), error);

      process.exit(1);

    }

  });



program.parse();

