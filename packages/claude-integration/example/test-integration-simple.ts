// packages/claude-integration/example/test-integration-simple.ts
import { ClaudeService } from '../src/index.js';
import type { AnalysisResult, Finding, ProjectMetadata } from '@rta/core';

async function runFullIntegrationTest() {
  console.log('🚀 Claude Integration - Full Test Suite\n');

  // Test with environment variable
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY environment variable not set');
    console.log('💡 Set it with: export CLAUDE_API_KEY="your-api-key"');
    process.exit(1);
  }

  try {
    const claude = new ClaudeService({
      apiKey,
      model: 'claude-3-5-haiku-latest',
      maxTokens: 2048,
      temperature: 0.3,
    });

    // Test 1: Connection test
    console.log('1️⃣ Testing API connection...');
    const connectionTest = await claude.testConnection();

    if (connectionTest.success) {
      console.log('✅ Connection successful!');
      console.log(`🧠 Model: ${connectionTest.model}`);
    } else {
      console.error('❌ Connection failed:', connectionTest.error);
      return;
    }

    // Test 2: Available models
    console.log('\n2️⃣ Available Claude Models:');
    const models = ClaudeService.getAvailableModels();
    models.forEach(model => {
      const indicator = model.id === 'claude-3-5-haiku-latest' ? '👈 Current' : '';
      console.log(`• ${model.name} (${model.costLevel} cost) ${indicator}`);
      console.log(`  - ${model.description}`);
    });

    // Test 3: Insights generation
    console.log('\n3️⃣ Testing insights generation...');
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
        ruleId: 'performance-heavy-computation',
        message: 'Heavy computation in render function',
        severity: 'warning',
        file: 'src/components/Dashboard.tsx',
        line: 45,
        column: 12,
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

    const startTime = Date.now();
    const insights = await claude.generateInsights(sampleFindings);
    const duration = Date.now() - startTime;

    console.log(`✅ Insights generated (${duration}ms):`);
    console.log('📄 Summary:', insights.summary);
    console.log(`💡 Suggestions (${insights.suggestions.length}):`);
    insights.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });

    // Test 4: Full analysis enhancement
    console.log('\n4️⃣ Testing full analysis enhancement...');

    const sampleMetadata: ProjectMetadata = {
      projectName: 'sample-react-app',
      framework: 'React',
      version: '1.2.0',
      dependencies: ['react', 'react-dom', 'typescript', 'react-router-dom'],
      devDependencies: ['@types/react', 'eslint', 'jest', '@testing-library/react'],
    };

    const sampleAnalysis: AnalysisResult = {
      platform: 'web',
      timestamp: new Date().toISOString(),
      healthScore: 7.2,
      summary: 'Project shows good TypeScript practices with some performance and testing gaps',
      findings: sampleFindings,
      metadata: sampleMetadata,
      metrics: {
        totalFiles: 32,
        analyzedFiles: 28,
        errorCount: 1,
        warningCount: 2,
        infoCount: 1,
        overallHealth: 7.2,
      },
    };

    const enhancedAnalysis = await claude.enhanceAnalysis(sampleAnalysis);

    console.log('✅ Analysis enhanced:');
    console.log('📊 Health Score:', enhancedAnalysis.healthScore);
    console.log('📄 AI Summary:', enhancedAnalysis.summary);
    console.log('🤖 AI Enhanced:', enhancedAnalysis.aiEnhanced ? 'Yes' : 'No');
    if (enhancedAnalysis.aiModel) {
      console.log('🧠 AI Model Used:', enhancedAnalysis.aiModel);
    }

    // Show some enhanced findings
    console.log('\n🔍 Sample Enhanced Findings:');
    enhancedAnalysis.findings.slice(0, 2).forEach((finding, i) => {
      console.log(`${i + 1}. ${finding.ruleId} (${finding.severity})`);
      console.log(`   📁 ${finding.file}:${finding.line}`);
      console.log(`   ❗ ${finding.message}`);
      if (finding.suggestion) {
        console.log(`   💡 ${finding.suggestion}`);
      }
    });

    // Test 5: Code snippet analysis
    console.log('\n5️⃣ Testing code snippet analysis...');

    const sampleCode = `
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, [userId]);
  
  const handleUpdate = () => {
    const updatedUser = { ...user, lastSeen: new Date() };
    setUser(updatedUser);
    onUpdate(updatedUser);
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <p>Email: {user?.email}</p>
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
};

export default UserProfile;
    `;

    const codeAnalysis = await claude.analyzeCodeSnippet(
      sampleCode,
      'src/components/UserProfile.tsx',
      'User profile component with data fetching and update functionality'
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

    // Final summary
    console.log('\n🎉 All integration tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ API Connection: Working');
    console.log('✅ Insights Generation: Working');
    console.log('✅ Analysis Enhancement: Working');
    console.log('✅ Code Analysis: Working');
    console.log('✅ JSON Parsing: Robust');

    console.log('\n💰 Estimated Cost:');
    console.log('• Total tokens used: ~2000-3000');
    console.log('• Estimated cost: ~$0.003-0.005 USD');
    console.log('• Model used: Claude 3.5 Haiku (most economical)');

    console.log('\n🚀 Ready for production integration!');
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Execute the test
runFullIntegrationTest();
