# Quick Start Guide 🚀

Get React TypeScript Arsenal Tools running in 5 minutes!

## 1. Setup

```bash
# Clone and install
git clone <repository-url>
cd react-typescript-arsenal-tools
pnpm install

# Build all packages
pnpm build

# Verify installation
pnpm rta --version
```

## 2. Run Demo

```bash
# Run full demo with sample project
pnpm demo

# Keep demo project for inspection
pnpm demo:keep
```

## 3. Analyze Your Project

```bash
# Basic analysis
pnpm rta analyze ./my-react-project

# With AI insights (requires CLAUDE_API_KEY)
export CLAUDE_API_KEY="your-key-here"
pnpm rta analyze ./my-react-project --ai

# Save results
pnpm rta analyze ./my-react-project --save results.json
```

## 4. Expected Output

```
🚀 Analysis Results
┌─────────────────────────────────────────────────────────┐
│         React TypeScript Arsenal Analysis               │
│                                                         │
│ Platform: web                                          │
│ Files Analyzed: 47                                     │
│ Health Score: 8.3/10                                   │
│ Issues: 2 errors, 8 warnings, 12 info                │
└─────────────────────────────────────────────────────────┘

💡 Immediate Suggestions:
1. Add key prop with unique identifier for list items
2. Replace any types with specific TypeScript interfaces
3. Add tests for components missing coverage
```

## 5. Development

```bash
# Watch mode for development
pnpm dev

# Work on specific package
pnpm --filter @rta/cli dev

# Run tests
pnpm test

# Type checking
pnpm type-check
```

## ✅ Success Criteria

After setup, this should work:

```bash
# Create a simple React component with issues
mkdir test-project && cd test-project
echo '{"name":"test","dependencies":{"react":"^18.0.0","react-dom":"^18.0.0"}}' > package.json
mkdir src
cat > src/App.tsx << 'EOF'
function App(props) {
  const items = [1,2,3];
  return <div>{items.map(i => <div>{i}</div>)}</div>;
}
export default App;
EOF

# Analyze it
cd ..
pnpm rta analyze ./test-project

# Should find: missing key prop, untyped props, missing React import
```

## 🚧 Known Limitations (Phase 1)

- **React Web Only**: React Native support coming in Phase 5
- **Basic Rules**: ~7 analysis rules (more coming)
- **Local Analysis**: No GitHub integration yet (Phase 2)
- **No Dashboard**: CLI only (web dashboard in Phase 3)

## 🆘 Troubleshooting

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### CLI Not Found

```bash
# Make sure CLI is built
pnpm --filter @rta/cli build

# Use direct path
node packages/cli/dist/cli.js --help
```

### Permission Issues

```bash
# Make CLI executable
chmod +x packages/cli/dist/cli.js
```

### AI Not Working

```bash
# Check API key
echo $CLAUDE_API_KEY

# Test connection
curl -H "x-api-key: $CLAUDE_API_KEY" https://api.anthropic.com/v1/complete
```

## 🎯 Next Steps

1. **Test on Real Project**: Try on your actual React codebase
2. **Configure Rules**: Customize analysis rules (coming soon)
3. **Set Up CI**: Add to your build pipeline
4. **Join Community**: Follow development for Phase 2 features

## 📞 Need Help?

- Check the [main README](README.md) for detailed documentation
- Review demo output in `demo-project/`
- Open an issue if something's not working

**Ready to improve your React code? Let's go! 🚀**
