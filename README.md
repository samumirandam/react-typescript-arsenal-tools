# React TypeScript Arsenal Tools 🔧

**AI-powered code analysis tools for React & TypeScript projects with extensible
cross-platform support**

[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue)](https://www.typescriptlang.org/)
[![Powered by Claude AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-orange)](https://www.anthropic.com/)
[![Monorepo](https://img.shields.io/badge/Monorepo-pnpm%20+%20turbo-green)](https://pnpm.io/)

## 🎯 Vision

Create an ecosystem of AI-powered tools that democratize React/TypeScript best
practices, offering immediate value for both individual developers and teams.
**Designed from day 1 to support React + React Native with intelligent
cross-platform analysis.**

## ✨ Features

### ✅ Phase 1: Core Foundation (Current)

- 🔍 **Zero-touch Analysis**: Analyze existing projects without modifying files
- 🤖 **Claude AI Integration**: Intelligent code insights powered by Anthropic's
  Claude
- 📊 **Comprehensive Reporting**: Multiple output formats (JSON, Table,
  Markdown)
- 🏗️ **Extensible Architecture**: Plugin-based system ready for multi-platform
  support
- 💻 **CLI Interface**: Simple command-line tool for instant analysis

### 🚧 Future Phases

- **Phase 2**: GitHub webhook service for automated PR analysis
- **Phase 3**: Web dashboard with team analytics
- **Phase 4**: Freemium SaaS model with advanced features
- **Phase 5**: React Native analyzer with cross-platform patterns
- **Phase 6**: Full monorepo analysis with design system validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/react-typescript-arsenal-tools.git
cd react-typescript-arsenal-tools

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Install CLI globally for easy access
pnpm --filter @rta/cli pack
npm install -g rta-cli-0.1.0.tgz

# Or run directly from monorepo
pnpm --filter @rta/cli build
alias rta="node packages/cli/dist/cli.js"
```

### Basic Usage

```bash
# Analyze a React project
rta analyze ./my-react-project

# Enable AI-powered insights (requires CLAUDE_API_KEY)
export CLAUDE_API_KEY="your-api-key"
rta analyze ./my-react-project --ai

# Save results to file
rta analyze ./my-react-project --save results.json

# Different output formats
rta analyze ./my-react-project --output markdown
rta analyze ./my-react-project --output json
```

### Example Output

```bash
🚀 Analysis Results
┌─────────────────────────────────────────────────────────┐
│         React TypeScript Arsenal Analysis               │
│                                                         │
│ Platform: web                                           │
│ Files Analyzed: 47                                      │
│ Health Score: 8.3/10                                    │
│ Issues: 2 errors, 8 warnings, 12 info                   │
└─────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────────────────────────┬──────────────┬──────┐
│ Severity    │ Category    │ Issue                           │ File         │ Line │
├─────────────┼─────────────┼─────────────────────────────────┼──────────────┼──────┤
│ 🚨 ERROR    │ performance │ Missing key prop in list        │ UserList.tsx │ 15   │
│ ⚠️ WARNING  │ typescript  │ Usage of any type               │ api.ts       │ 23   │
│ ℹ️ INFO     │ testing     │ Component missing tests         │ Button.tsx   │ 1    │
└─────────────┴─────────────┴─────────────────────────────────┴──────────────┴──────┘

💡 Immediate Suggestions:
1. Add key prop with unique identifier for list items
2. Replace any types with specific TypeScript interfaces
3. Add tests for components missing coverage

🎯 Long-term Improvements:
1. Enable strict TypeScript mode for better type safety
2. Implement code splitting for better performance
3. Consider upgrading to latest React patterns
```

## 📦 Monorepo Structure

```
react-typescript-arsenal-tools/
├── packages/                    # Core packages
│   ├── core/                   # Platform-agnostic shared logic
│   ├── analyzer-web/           # React web analysis engine
│   ├── analyzer-native/        # 🚧 React Native analysis (Phase 5)
│   ├── analyzer-shared/        # 🚧 Cross-platform patterns (Phase 6)
│   ├── claude-integration/     # Claude AI wrapper
│   ├── github-webhook/         # 🚧 GitHub integration (Phase 2)
│   └── cli/                    # Command line interface
├── apps/                       # Deployable applications
│   ├── webhook-service/        # 🚧 GitHub webhook service (Phase 2)
│   ├── web-dashboard/          # 🚧 Analytics dashboard (Phase 3)
│   └── landing-page/           # 🚧 Marketing site (Phase 3)
└── tools/                      # Development tools
    ├── build-configs/          # Shared configurations
    └── scripts/                # Development scripts
```

## 🔧 Development

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Start development mode (watches for changes)
pnpm dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests
pnpm test

# Build all packages
pnpm build

# Clean build artifacts
pnpm clean
```

### Package Development

```bash
# Work on specific package
pnpm --filter @rta/core dev
pnpm --filter @rta/analyzer-web dev
pnpm --filter @rta/cli dev

# Test CLI locally
pnpm dev:cli
```

### Adding New Rules

```typescript
// packages/analyzer-web/src/rules/my-rule.ts
import { Rule } from '@rta/core';

export const myCustomRule: Rule = {
  id: 'my-custom-rule',
  name: 'My Custom Rule',
  description: 'Detects custom patterns',
  platforms: ['web'],
  severity: 'warning',
  category: 'best-practices',

  async check(node, context) {
    // Your analysis logic here
    return findings;
  },
};
```

## 🤖 AI Integration

The tool integrates with Claude AI for enhanced analysis. Set up your API key:

```bash
# Get API key from https://console.anthropic.com/
export CLAUDE_API_KEY="your-api-key-here"

# Or create .env file
echo "CLAUDE_API_KEY=your-api-key-here" > .env
```

### AI Features

- **Enhanced Findings**: AI provides context and detailed explanations
- **Smart Suggestions**: Contextual recommendations based on your codebase
- **Project Summaries**: High-level insights about code health
- **Architecture Analysis**: AI evaluates overall project structure

## 📊 Analysis Categories

### Performance

- Anonymous functions in JSX
- Missing useMemo/useCallback
- Heavy operations without memoization
- Bundle size optimization opportunities

### TypeScript

- Usage of `any` type
- Missing prop interfaces
- Type safety improvements
- Strict mode recommendations

### Best Practices

- Missing key props in lists
- Unnecessary React Fragments
- Hook usage patterns
- Component structure

### Testing

- Missing test files
- Low coverage areas
- Integration test opportunities

### Architecture (Future)

- Component organization
- State management patterns
- Cross-platform consistency
- Design system validation

## 🎯 Roadmap

### Phase 1: Core Foundation ✅

- [x] Platform-agnostic core types
- [x] React web analyzer with AST parsing
- [x] Claude AI integration
- [x] CLI interface
- [x] Extensible architecture

### Phase 2: GitHub Integration 🚧

- [ ] Webhook service for automated PR analysis
- [ ] GitHub App integration
- [ ] Automated comments with insights
- [ ] Landing page with setup instructions

### Phase 3: Dashboard & Monetization 🚧

- [ ] Web dashboard with analytics
- [ ] User authentication (GitHub OAuth)
- [ ] Freemium pricing model
- [ ] Team collaboration features

### Phase 4: Scale & Refinement 🚧

- [ ] Performance optimizations
- [ ] Advanced configuration options
- [ ] Community rule contributions
- [ ] Enterprise features

### Phase 5: React Native Extension 🚧

- [ ] React Native analyzer (`@rta/analyzer-native`)
- [ ] Navigation pattern detection
- [ ] Performance analysis for mobile
- [ ] Expo-specific optimizations
- [ ] NativeWind/Tailwind cross-platform validation

### Phase 6: Cross-Platform Intelligence 🚧

- [ ] Monorepo-wide analysis
- [ ] Design system consistency validation
- [ ] Architecture pattern enforcement
- [ ] Shared logic opportunity detection

## 🏗️ Architecture Principles

### Extensible Design

- **Platform-agnostic core**: Shared types and utilities
- **Plugin architecture**: Easy to add new analyzers
- **Rule-based system**: Configurable analysis patterns
- **Multi-platform ready**: Designed for web + native from day 1

### AI-First Approach

- **Claude integration**: Leverage AI for intelligent insights
- **Context-aware analysis**: AI understands project structure
- **Enhanced explanations**: Go beyond static analysis
- **Future-proof**: Ready for next-generation AI capabilities

## 📝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for
guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `pnpm lint` and `pnpm test`
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Documentation**: [Coming soon]
- **Discord Community**: [Coming soon]
- **Blog**: [Coming soon]
- **Twitter**: [Coming soon]

## 🙏 Acknowledgments

- **Anthropic** for Claude AI
- **TypeScript team** for amazing tooling
- **React community** for best practices
- **Open source contributors** who make this possible

---

**Built with ❤️ for the React community**

Ready to analyze your first project? Run `rta analyze .` and see what insights
await! 🚀
