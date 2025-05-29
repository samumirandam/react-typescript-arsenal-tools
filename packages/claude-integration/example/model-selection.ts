// packages/claude-integration/example/model-selection.ts
import { ClaudeService } from '../src/index.js';

/**
 * Example showing how to select and configure different Claude models
 */
async function demonstrateModelSelection() {
  console.log('🚀 Claude Model Selection Guide\n');

  // Show available models
  const models = ClaudeService.getAvailableModels();
  console.log('📋 Available Models:');
  models.forEach((model, i) => {
    console.log(`${i + 1}. ${model.name}`);
    console.log(`   ID: ${model.id}`);
    console.log(`   Description: ${model.description}`);
    console.log(`   Cost Level: ${model.costLevel}`);
    console.log(`   Recommended for: ${model.recommended}`);
    console.log('');
  });

  // Example configurations for different use cases
  console.log('⚙️  Configuration Examples:\n');

  console.log('🔧 Development & Testing (Economical):');
  console.log(`const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: 'claude-3-5-haiku-latest',
  maxTokens: 1024,        // Lower limit for cost control
  temperature: 0.3,       // More focused responses
});`);

  console.log('\n🏭 Production (Balanced):');
  console.log(`const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: 'claude-3-5-sonnet-latest',
  maxTokens: 2048,        // Higher quality analysis
  temperature: 0.2,       // Consistent responses
  timeout: 45000,         // Longer timeout for complex analysis
});`);

  console.log('\n💎 Premium Features (High Quality):');
  console.log(`const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: 'claude-opus-4-20250514',
  maxTokens: 4096,        // Maximum analysis depth
  temperature: 0.1,       // Most deterministic
  timeout: 60000,         // Extra time for complex reasoning
});`);

  // Cost comparison
  console.log('\n💰 Cost Comparison (per 1000 analyses):');
  const analysisVolume = 1000;
  const costEstimates = {
    haiku: { min: 2.0, max: 3.0 },
    sonnet: { min: 10.0, max: 15.0 },
    opus: { min: 50.0, max: 100.0 },
  };

  console.log(`• Haiku:  $${costEstimates.haiku.min}-${costEstimates.haiku.max}`);
  console.log(`• Sonnet: $${costEstimates.sonnet.min}-${costEstimates.sonnet.max}`);
  console.log(`• Opus:   $${costEstimates.opus.min}-${costEstimates.opus.max}`);

  // Usage recommendations
  console.log('\n📊 Usage Recommendations:\n');

  console.log('🎯 When to use Haiku:');
  console.log('• Development and testing');
  console.log('• High volume analysis (1000+ per day)');
  console.log('• Simple code reviews');
  console.log('• Budget-conscious projects');

  console.log('\n🎯 When to use Sonnet:');
  console.log('• Production environments');
  console.log('• Moderate volume (100-1000 per day)');
  console.log('• Detailed code analysis');
  console.log('• Team workflows');

  console.log('\n🎯 When to use Opus:');
  console.log('• Premium features');
  console.log('• Low volume, high quality needs');
  console.log('• Complex architectural analysis');
  console.log('• Enterprise customers');

  // Environment-based configuration example
  console.log('\n🌍 Environment-Based Configuration:\n');
  console.log(`function createClaudeService() {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      model: 'claude-3-5-haiku-latest',
      maxTokens: 1024,
      temperature: 0.3,
    },
    production: {
      model: 'claude-3-5-sonnet-latest', 
      maxTokens: 2048,
      temperature: 0.2,
    },
    premium: {
      model: 'claude-opus-4-20250514',
      maxTokens: 4096,
      temperature: 0.1,
    },
  };

  return new ClaudeService({
    apiKey: process.env.CLAUDE_API_KEY!,
    ...configs[env],
  });
}`);

  console.log('\n✅ Configuration complete! Choose the model that fits your needs.');
}

// Usage rate limiting example
function demonstrateRateLimiting() {
  console.log('\n⏱️  Rate Limiting Best Practices:\n');

  console.log(`class RateLimitedClaudeService {
  private lastRequest = 0;
  private minInterval = 100; // ms between requests
  
  constructor(private claude: ClaudeService) {}
  
  async enhanceAnalysis(analysis: AnalysisResult) {
    // Simple rate limiting
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }
    
    this.lastRequest = Date.now();
    return await this.claude.enhanceAnalysis(analysis);
  }
}`);

  console.log('\n📋 Rate Limiting Guidelines:');
  console.log('• Haiku: Up to 10 requests/second');
  console.log('• Sonnet: Up to 5 requests/second');
  console.log('• Opus: Up to 2 requests/second');
  console.log('• Always implement retry logic for 429 errors');
}

// Main function - SIMPLIFIED execution
async function main() {
  const command = process.argv[2] || 'models';

  switch (command) {
    case 'models':
      await demonstrateModelSelection();
      break;
    case 'rates':
      demonstrateRateLimiting();
      break;
    default:
      console.log('🚀 Claude Model Selection Examples\n');
      console.log('Commands:');
      console.log('  models - Show model selection guide (default)');
      console.log('  rates  - Show rate limiting examples');
      console.log('\nUsage:');
      console.log('  tsx example/model-selection.ts models');
      console.log('  tsx example/model-selection.ts rates');
  }
}

// Execute immediately
main().catch(console.error);

export { demonstrateModelSelection, demonstrateRateLimiting };
