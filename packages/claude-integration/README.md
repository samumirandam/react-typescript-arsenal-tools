# @rta/claude-integration

AI-powered code analysis enhancement using Anthropic's Claude API.

## Features

- 🤖 **Intelligent Analysis Enhancement**: Transform static analysis results
  into actionable insights
- 🎯 **Context-Aware Suggestions**: Claude understands your project structure
  and provides relevant recommendations
- 📊 **Multi-Platform Ready**: Designed to work with both React Web and React
  Native projects
- 💡 **Smart Insights**: Generate summaries, prioritize issues, and suggest
  improvements
- 🔍 **Code Snippet Analysis**: Deep-dive analysis of specific code patterns
- ⚡ **Cost Optimized**: Uses Claude 3 Haiku by default for economical analysis

## Installation

```bash
# Install the package
pnpm add @rta/claude-integration

# Install peer dependencies
pnpm add @anthropic-ai/sdk
```

## Quick Start

### 1. Get Claude API Key

Visit [Anthropic Console](https://console.anthropic.com/) to get your API key.

### 2. Basic Usage

```typescript
import { ClaudeService } from '@rta/claude-integration';

const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: 'claude-3-5-haiku-latest', // Most economical
  maxTokens: 2048,
  temperature: 0.3,
});

// Test connection
const connection = await claude.testConnection();
console.log(connection.success ? '✅ Connected' : '❌ Failed');

// Enhance analysis results
const enhancedAnalysis = await claude.enhanceAnalysis(analysisResult);
console.log(enhancedAnalysis.summary);
```

### 3. Environment Setup

```bash
# Set your API key
export CLAUDE_API_KEY="your-api-key-here"

# Test the integration
pnpm test:connection
```

## API Reference

### ClaudeService

Main service class for Claude AI integration.

#### Constructor

```typescript
new ClaudeService(config: ClaudeConfig)
```

**ClaudeConfig:**

- `apiKey: string` - Your Anthropic API key (required)
- `model?: string` - Claude model to use (default: `claude-3-5-haiku-latest`)
- `maxTokens?: number` - Maximum tokens per request (default: `4096`)
- `temperature?: number` - Response randomness 0-1 (default: `0.3`)
- `timeout?: number` - Request timeout in ms (default: `30000`)

#### Methods

##### `enhanceAnalysis(analysis: AnalysisResult): Promise<AnalysisResult>`

Enhances existing analysis results with AI insights.

```typescript
const enhanced = await claude.enhanceAnalysis({
  healthScore: 7.5,
  findings: [...],
  metadata: {...},
});

console.log(enhanced.summary); // AI-generated summary
console.log(enhanced.aiEnhanced); // true
```

##### `generateInsights(findings: Finding[]): Promise<{summary: string, suggestions: string[]}>`

Generates insights from a list of findings.

```typescript
const insights = await claude.generateInsights(findings);
console.log(insights.summary);
insights.suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
```

##### `analyzeCodeSnippet(code: string, filePath: string, context?: string): Promise<{insights: string[], suggestions: string[]}>`

Analyzes specific code snippets for detailed feedback.

```typescript
const analysis = await claude.analyzeCodeSnippet(
  `const Component = () => <div>Hello</div>`,
  'src/Component.tsx',
  'Simple React functional component'
);
```

##### `testConnection(): Promise<{success: boolean, model: string, error?: string}>`

Tests the API connection and configuration.

```typescript
const test = await claude.testConnection();
if (!test.success) {
  console.error('Connection failed:', test.error);
}
```

## Cost Optimization

### Model Selection

```typescript
// Most economical (recommended for development)
model: 'claude-3-5-haiku-latest';

// Balanced performance and cost
model: 'claude-3-7-sonnet-latest';

// Highest quality (production use)
model: 'claude-opus-4-20250514';
```

### Usage Patterns

```typescript
// Batch multiple findings for efficiency
const insights = await claude.generateInsights(allFindings);

// Use shorter max tokens for simple analyses
const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  maxTokens: 1024, // Reduce from default 4096
});

// Cache results to avoid repeated calls
const cacheKey = `analysis-${fileHash}`;
if (!cache.has(cacheKey)) {
  cache.set(cacheKey, await claude.enhanceAnalysis(analysis));
}
```

## Error Handling

The service handles common API errors gracefully:

```typescript
try {
  const result = await claude.enhanceAnalysis(analysis);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.log('Rate limit hit, retrying in 60s...');
    await sleep(60000);
  } else if (error.message.includes('Invalid API key')) {
    console.error('Check your CLAUDE_API_KEY');
  }
}
```

### Common Error Codes

- **401**: Invalid API key
- **429**: Rate limit exceeded
- **400**: Invalid request parameters
- **500**: API service error

## Testing

```bash
# Test the integration
pnpm test:connection

# Run all tests
pnpm test

# Test with custom API key
CLAUDE_API_KEY=your-key pnpm test:connection
```

## Examples

### Basic Enhancement

```typescript
import { ClaudeService } from '@rta/claude-integration';

const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
});

const analysis = {
  healthScore: 6.5,
  findings: [
    {
      ruleId: 'react-missing-key',
      message: 'Missing key prop',
      severity: 'error',
      file: 'UserList.tsx',
      line: 15,
    },
  ],
  metadata: {
    projectName: 'my-app',
    framework: 'React',
    hasTypeScript: true,
  },
};

const enhanced = await claude.enhanceAnalysis(analysis);
console.log(enhanced.summary);
// Output: "Project shows solid React patterns but needs attention to list rendering performance..."
```

### Insight Generation

```typescript
const insights = await claude.generateInsights([
  { ruleId: 'perf-heavy-computation', message: 'Heavy computation in render', ... },
  { ruleId: 'ts-any-usage', message: 'Using any type', ... },
]);

console.log(insights.summary);
// Output: "Main concerns are render performance and type safety..."

insights.suggestions.forEach(s => console.log(`💡 ${s}`));
// Output:
// 💡 Move heavy computations to useMemo hook
// 💡 Replace any types with specific interfaces
```

### Code Analysis

```typescript
const code = `
const UserProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUserData(user.id).then(setUserData);
  }, [user.id]);
  
  return loading ? <Spinner /> : <Profile data={userData} />;
};
`;

const analysis = await claude.analyzeCodeSnippet(code, 'UserProfile.tsx');
console.log('Insights:', analysis.insights);
console.log('Suggestions:', analysis.suggestions);
```

## Integration with CLI

```typescript
// In your CLI command
import { ClaudeService } from '@rta/claude-integration';

const enhanceWithAI = async (analysis: AnalysisResult) => {
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('⚠️  CLAUDE_API_KEY not set, skipping AI enhancement');
    return analysis;
  }

  const claude = new ClaudeService({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  return await claude.enhanceAnalysis(analysis);
};
```

## Rate Limiting & Best Practices

### Recommended Limits

```typescript
// Development
const claude = new ClaudeService({
  apiKey: process.env.CLAUDE_API_KEY!,
  model: 'claude-3-5-haiku-latest',
  maxTokens: 1024,
});

// Production with retry logic
const claudeWithRetry = async (operation: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
```

### Caching Strategy

```typescript
import { createHash } from 'crypto';

class CachedClaudeService extends ClaudeService {
  private cache = new Map();

  async enhanceAnalysis(analysis: AnalysisResult) {
    const hash = createHash('md5')
      .update(JSON.stringify(analysis.findings))
      .digest('hex');

    if (this.cache.has(hash)) {
      return this.cache.get(hash);
    }

    const result = await super.enhanceAnalysis(analysis);
    this.cache.set(hash, result);
    return result;
  }
}
```

## License

MIT - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

- 📖 [Documentation](https://github.com/your-org/react-typescript-arsenal-tools)
- 🐛
  [Report Issues](https://github.com/your-org/react-typescript-arsenal-tools/issues)
- 💬 [Discord Community](https://discord.gg/rta-tools)
