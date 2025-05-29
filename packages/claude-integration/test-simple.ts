import { ClaudeService } from './src/index.js';

async function simpleTest() {
  console.log('🔄 Testing Claude Integration...\n');

  // Check API key
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('❌ CLAUDE_API_KEY not set');
    console.log('💡 Set with: export CLAUDE_API_KEY="your-key"');
    process.exit(1);
  }

  try {
    // Create service
    const claude = new ClaudeService({
      apiKey,
      model: 'claude-3-5-haiku-latest',
      maxTokens: 512,
    });

    console.log('✅ ClaudeService created');

    // Test connection
    console.log('🔗 Testing connection...');
    const connection = await claude.testConnection();

    if (connection.success) {
      console.log('✅ Connection successful!');
      console.log(`🧠 Model: ${connection.model}`);
    } else {
      console.error('❌ Connection failed:', connection.error);
      process.exit(1);
    }

    // Test simple insights
    console.log('\n💡 Testing insights generation...');
    const testFindings = [
      {
        ruleId: 'test-rule',
        message: 'Test finding',
        severity: 'warning' as const,
        file: 'test.tsx',
        line: 1,
        column: 1,
      },
    ];

    const insights = await claude.generateInsights(testFindings);
    console.log('✅ Insights generated!');
    console.log('📄 Summary:', insights.summary);
    console.log('💡 Suggestions:', insights.suggestions.length, 'provided');

    console.log('\n🎉 All tests passed!');
    console.log('💰 Estimated cost: <$0.01 USD');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

simpleTest();
