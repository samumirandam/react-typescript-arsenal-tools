// packages/claude-integration/test-debug.ts
import { ClaudeService } from './src/index.js';

async function debugTest() {
  console.log('🔬 Debug Test - Improved Parsing...\n');

  // Check API key
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY not set');
    process.exit(1);
  }

  try {
    const claude = new ClaudeService({
      apiKey,
      model: 'claude-3-5-haiku-latest',
      maxTokens: 1024,
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    console.log('✅ Service created with improved parsing');

    // Test with a simple finding
    const testFindings = [
      {
        ruleId: 'react-missing-key',
        message: 'Missing key prop in list rendering',
        severity: 'error' as const,
        file: 'src/UserList.tsx',
        line: 15,
        column: 8,
      },
      {
        ruleId: 'typescript-any-usage',
        message: 'Using any type instead of specific interface',
        severity: 'warning' as const,
        file: 'src/api.ts',
        line: 23,
        column: 12,
      },
    ];

    console.log('🔄 Testing insights generation with improved parsing...');
    const startTime = Date.now();

    const insights = await claude.generateInsights(testFindings);

    const duration = Date.now() - startTime;
    console.log(`⚡ Response time: ${duration}ms`);

    console.log('\n📊 Parsed Results:');
    console.log('📄 Summary:', insights.summary);
    console.log(`💡 Suggestions (${insights.suggestions.length}):`);
    insights.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });

    // Check if we have patterns (if available)
    if ('patterns' in insights) {
      console.log(`🔍 Patterns (${(insights as any).patterns?.length || 0}):`);
      (insights as any).patterns?.forEach((pattern: string, i: number) => {
        console.log(`   ${i + 1}. ${pattern}`);
      });
    }

    // Test code snippet analysis
    console.log('\n🔄 Testing code snippet analysis...');
    const codeSnippet = `
const UserList = ({ users, onUserClick }) => {
  return (
    <div>
      {users.map(user => (
        <div onClick={() => onUserClick(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};
    `;

    const codeAnalysis = await claude.analyzeCodeSnippet(
      codeSnippet,
      'UserList.tsx',
      'Simple user list component with click handler'
    );

    console.log('\n📊 Code Analysis Results:');
    console.log('🔍 Insights:');
    codeAnalysis.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    console.log('💡 Suggestions:');
    codeAnalysis.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });

    console.log('\n🎉 Debug test completed successfully!');
    console.log('✅ JSON parsing improvements are working');
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

debugTest();
