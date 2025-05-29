// packages/claude-integration/example/test-integration.ts
import { ClaudeService } from '../src/index.js';
import type { AnalysisResult, Finding, ProjectMetadata } from '@rta/core';

async function testClaudeIntegration() {
  // Test with environment variable
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY environment variable not set');
    console.log('💡 Set it with: export CLAUDE_API_KEY="your-api-key"');
    process.exit(1);
  }

  console.log('🔄 Testing Claude integration...');

  try {
    const claude = new ClaudeService({
      apiKey,
      model: 'claude-3-5-haiku-latest', // Most economical for testing
      maxTokens: 2048,
      temperature: 0.3,
    });

    // Test 1: Connection test
    console.log('\n1️⃣ Testing API connection...');
    const connectionTest = await claude.testConnection();
    console.log(connectionTest.success ? '✅ Connection successful' : '❌ Connection failed');
    if (!connectionTest.success) {
      console.error('Error:', connectionTest.error);
      return;
    }

    // Test 2: Display available models
    console.log('\n📋 Available Claude Models:');
    const models = ClaudeService.getAvailableModels();
    models.forEach(model => {
      console.log(`• ${model.name} (${model.id})`);
      console.log(`  - ${model.description}`);
      console.log(`  - Cost: ${model.costLevel} | Recommended: ${model.recommended}`);
    });

    // Test 3: Generate insights from sample findings
    console.log('\n2️⃣ Testing insights generation...');
    const sampleFindings: Finding[] = [
      {
        ruleId: 'react-missing-key',
        message: 'Missing key prop in list item',
        severity: 'error',
        file: 'src/components/UserList.tsx',
        line: 15,
        column: 8,
      },
      {
        ruleId: 'typescript-any-usage',
        message: 'Usage of any type should be avoided',
        severity: 'warning',
        file: 'src/api/users.ts',
        line: 23,
        column: 12,
        suggestion: 'Define specific interface instead of any',
      },
      {
        ruleId: 'testing-missing-tests',
        message: 'Component is missing test coverage',
        severity: 'info',
        file: 'src/components/Button.tsx',
        line: 1,
        column: 1,
      },
    ];

    const insights = await claude.generateInsights(sampleFindings);
    console.log('✅ Insights generated:');
    console.log('📄 Summary:', insights.summary);
    console.log('💡 Suggestions:');
    insights.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });

    // Test 4: Enhance full analysis
    console.log('\n3️⃣ Testing analysis enhancement...');
    const sampleMetadata: ProjectMetadata = {
      projectName: 'sample-react-app',
      framework: 'React',
      version: '1.0.0',
      dependencies: ['react', 'react-dom', 'typescript'],
      devDependencies: ['@types/react', 'eslint', 'jest'],
    };

    const sampleAnalysis: AnalysisResult = {
      platform: 'web',
      timestamp: new Date().toISOString(),
      healthScore: 7.5,
      summary: 'Project shows good TypeScript practices with some issues to address',
      findings: sampleFindings,
      metadata: sampleMetadata,
      metrics: {
        totalFiles: 25,
        analyzedFiles: 25,
        errorCount: 1,
        warningCount: 1,
        infoCount: 1,
        overallHealth: 7.5,
      },
    };

    const enhancedAnalysis = await claude.enhanceAnalysis(sampleAnalysis);
    console.log('✅ Analysis enhanced:');
    console.log('📊 Health Score:', enhancedAnalysis.healthScore);
    console.log('📄 Enhanced Summary:', enhancedAnalysis.summary);
    console.log('🤖 AI Enhanced:', enhancedAnalysis.aiEnhanced ? 'Yes' : 'No');
    if (enhancedAnalysis.aiModel) {
      console.log('🧠 AI Model:', enhancedAnalysis.aiModel);
    }

    // Show enhanced findings with suggestions
    console.log('\n🔍 Enhanced Findings:');
    enhancedAnalysis.findings.slice(0, 2).forEach((finding, i) => {
      console.log(`${i + 1}. ${finding.ruleId} (${finding.severity})`);
      console.log(`   File: ${finding.file}:${finding.line}`);
      console.log(`   Issue: ${finding.message}`);
      if (finding.suggestion) {
        console.log(`   💡 Suggestion: ${finding.suggestion}`);
      }
    });

    // Test 5: Code snippet analysis
    console.log('\n4️⃣ Testing code snippet analysis...');
    const sampleCode = `
import React, { useState } from 'react';

const UserList = ({ users }) => {
  const [filter, setFilter] = useState('');
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
        placeholder="Filter users..."
      />
      {users
        .filter(user => user.name.toLowerCase().includes(filter.toLowerCase()))
        .map(user => (
          <div key={user.id}>{user.name}</div>
        ))
      }
    </div>
  );
};

export default UserList;
    `;

    const codeAnalysis = await claude.analyzeCodeSnippet(
      sampleCode,
      'src/components/UserList.tsx',
      'React functional component for displaying a filterable list of users'
    );

    console.log('✅ Code analysis completed:');
    console.log('🔍 Insights:');
    codeAnalysis.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    console.log('💡 Suggestions:');
    codeAnalysis.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });

    console.log('\n🎉 All tests completed successfully!');

    // Display usage info
    console.log('\n📊 Usage Summary:');
    console.log('• Model used:', connectionTest.model);
    console.log('• Estimated tokens used: ~1200-1800');
    console.log('• Estimated cost (Haiku): ~$0.001-0.002 USD');
    console.log('• Test duration: ~10-15 seconds');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Model comparison test
async function testModelComparison() {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY not set');
    return;
  }

  const models = ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'];
  const sampleFindings: Finding[] = [
    {
      ruleId: 'react-performance',
      message: 'Component re-renders unnecessarily',
      severity: 'warning',
      file: 'src/App.tsx',
      line: 10,
      column: 5,
    },
  ];

  console.log('\n🔬 Model Comparison Test:');

  for (const model of models) {
    try {
      console.log(`\n• Testing ${model}...`);
      const startTime = Date.now();

      const claude = new ClaudeService({ apiKey, model, maxTokens: 1024 });
      const insights = await claude.generateInsights(sampleFindings);

      const duration = Date.now() - startTime;
      console.log(`  ✅ Response time: ${duration}ms`);
      console.log(`  📄 Summary: ${insights.summary.substring(0, 100)}...`);
      console.log(`  💡 Suggestions: ${insights.suggestions.length} provided`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Cost estimation helper
function estimateCost() {
  console.log('\n💰 Cost Estimation (Claude 3.5 Models):');
  console.log('\n📊 Haiku (claude-3-5-haiku-latest):');
  console.log('• Input: $1.00 per 1M tokens');
  console.log('• Output: $5.00 per 1M tokens');
  console.log('• Typical analysis: 800-1200 input + 300-500 output tokens');
  console.log('• Cost per analysis: ~$0.002-0.003 USD');

  console.log('\n📊 Sonnet (claude-3-5-sonnet-latest):');
  console.log('• Input: $3.00 per 1M tokens');
  console.log('• Output: $15.00 per 1M tokens');
  console.log('• Typical analysis: 800-1200 input + 300-500 output tokens');
  console.log('• Cost per analysis: ~$0.010-0.015 USD');

  console.log('\n📈 Volume Estimates:');
  console.log('• 100 analyses with Haiku: ~$0.20-0.30');
  console.log('• 100 analyses with Sonnet: ~$1.00-1.50');
  console.log('• 1000 analyses with Haiku: ~$2.00-3.00');
  console.log('• 1000 analyses with Sonnet: ~$10.00-15.00');
}

// Environment variable validation helper
function validateEnvironment() {
  const required = ['CLAUDE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n💡 Set them with:');
    console.log('export CLAUDE_API_KEY="your-api-key"');
    return false;
  }

  return true;
}

// Execute immediately if this file is run directly
(async () => {
  const command = process.argv[2] || 'test'; // Default to 'test'

  switch (command) {
    case 'test':
      if (validateEnvironment()) {
        console.log('🚀 Starting Claude Integration Test...\n');
        await testClaudeIntegration();
      }
      break;
    case 'compare':
      if (validateEnvironment()) {
        console.log('🚀 Starting Model Comparison...\n');
        await testModelComparison();
      }
      break;
    case 'cost':
      estimateCost();
      break;
    case 'validate':
      const isValid = validateEnvironment();
      console.log(isValid ? '✅ Environment is valid' : '❌ Environment validation failed');
      process.exit(isValid ? 0 : 1);
      break;
    default:
      console.log('🚀 Claude Integration Test Suite');
      console.log('\nCommands:');
      console.log('  test     - Run full integration test (default)');
      console.log('  compare  - Compare different Claude models');
      console.log('  cost     - Show cost estimation');
      console.log('  validate - Validate environment variables');
      console.log('\nExamples:');
      console.log('  CLAUDE_API_KEY=your-key tsx example/test-integration.ts test');
      console.log('  CLAUDE_API_KEY=your-key tsx example/test-integration.ts compare');
  }
})().catch(console.error);

export { testClaudeIntegration, testModelComparison, validateEnvironment, estimateCost };
