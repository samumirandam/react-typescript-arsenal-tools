import { Finding, RuleContext, Rule } from '@rta/core';
import * as parser from '@typescript-eslint/parser';

/**
 * Enhanced React Web Rules Implementation
 * Covers React Hooks, Performance, and Accessibility patterns
 */
export class EnhancedReactRules {
  /**
   * Get all supported rules
   */
  static getAllRules(): Rule[] {
    return [
      // React Hooks Rules
      {
        id: 'useEffect-missing-deps',
        name: 'useEffect Missing Dependencies',
        description: 'useEffect hook is missing dependencies in dependency array',
        severity: 'warning',
        category: 'react-hooks',
      },
      {
        id: 'useMemo-unnecessary',
        name: 'Unnecessary useMemo',
        description: "useMemo is used for simple values that don't need memoization",
        severity: 'info',
        category: 'react-hooks',
      },
      {
        id: 'useCallback-missing-deps',
        name: 'useCallback Missing Dependencies',
        description: 'useCallback hook is missing dependencies in dependency array',
        severity: 'warning',
        category: 'react-hooks',
      },
      {
        id: 'useState-complex-object',
        name: 'Complex State Without Reducer',
        description: 'Complex state object should use useReducer instead of useState',
        severity: 'info',
        category: 'react-hooks',
      },

      // Performance Rules
      {
        id: 'component-too-many-props',
        name: 'Component Has Too Many Props',
        description: 'Component has more than 10 props, consider refactoring',
        severity: 'warning',
        category: 'performance',
      },
      {
        id: 'inline-object-creation',
        name: 'Inline Object Creation in Render',
        description: 'Avoid creating objects inline in render to prevent unnecessary re-renders',
        severity: 'warning',
        category: 'performance',
      },
      {
        id: 'missing-react-memo',
        name: 'Missing React.memo for Pure Component',
        description: 'Consider wrapping component with React.memo for better performance',
        severity: 'info',
        category: 'performance',
      },
      {
        id: 'heavy-computation-render',
        name: 'Heavy Computation in Render',
        description: 'Heavy computation detected in render, consider using useMemo',
        severity: 'warning',
        category: 'performance',
      },

      // Accessibility Rules
      {
        id: 'missing-alt-text',
        name: 'Missing Alt Text',
        description: 'Image elements should have meaningful alt text for accessibility',
        severity: 'error',
        category: 'accessibility',
      },
      {
        id: 'missing-aria-labels',
        name: 'Missing ARIA Labels',
        description: 'Form inputs should have accessible labels or aria-labels',
        severity: 'error',
        category: 'accessibility',
      },
      {
        id: 'invalid-heading-order',
        name: 'Invalid Heading Order',
        description: 'Heading elements should follow proper hierarchical order',
        severity: 'warning',
        category: 'accessibility',
      },
      {
        id: 'missing-focus-management',
        name: 'Missing Focus Management',
        description: 'Modal or dialog components should manage focus properly',
        severity: 'warning',
        category: 'accessibility',
      },
    ];
  }

  /**
   * Apply all enhanced rules to a file context
   */
  static analyzeWithEnhancedRules(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    try {
      // Parse AST if not already parsed
      if (!context.ast && context.content) {
        context.ast = parser.parse(context.content, {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
          range: true,
          loc: true,
        });
      }

      // Apply React Hooks Rules
      findings.push(...this.checkUseEffectDependencies(context));
      findings.push(...this.checkUnnecessaryUseMemo(context));
      findings.push(...this.checkUseCallbackDependencies(context));
      findings.push(...this.checkComplexState(context));

      // Apply Performance Rules
      findings.push(...this.checkTooManyProps(context));
      findings.push(...this.checkInlineObjectCreation(context));
      findings.push(...this.checkMissingMemo(context));
      findings.push(...this.checkHeavyComputation(context));

      // Apply Accessibility Rules
      findings.push(...this.checkMissingAltText(context));
      findings.push(...this.checkMissingAriaLabels(context));
      findings.push(...this.checkHeadingOrder(context));
      findings.push(...this.checkFocusManagement(context));
    } catch (error) {
      // Fallback to regex-based analysis if AST parsing fails
      findings.push(...this.fallbackAnalysis(context));
    }

    return findings;
  }

  // ====================
  // REACT HOOKS RULES
  // ====================

  private static checkUseEffectDependencies(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('useEffect(') && !line.includes('[') && !line.includes(']')) {
        findings.push({
          ruleId: 'useEffect-missing-deps',
          message: 'useEffect should include dependency array',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('useEffect') + 1,
          suggestion: 'Add dependency array as second argument',
        });
      }
    });

    return findings;
  }

  private static checkUseCallbackDependencies(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('useCallback(') && !line.includes('[')) {
        findings.push({
          ruleId: 'useCallback-missing-deps',
          message: 'useCallback should include dependency array',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('useCallback') + 1,
          suggestion: 'Add dependency array as second argument to useCallback',
        });
      }
    });

    return findings;
  }

  private static checkUnnecessaryUseMemo(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      // Check for simple values in useMemo
      if (
        line.includes('useMemo(') &&
        (line.includes("() => '") ||
          line.includes('() => "') ||
          line.includes('() => true') ||
          line.includes('() => false') ||
          /useMemo\(\(\) => \d+/.test(line))
      ) {
        findings.push({
          ruleId: 'useMemo-unnecessary',
          message: 'useMemo is unnecessary for simple primitive values',
          severity: 'info',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('useMemo') + 1,
          suggestion: 'Remove useMemo for simple primitive values',
        });
      }
    });

    return findings;
  }

  private static checkComplexState(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');
    let inComplexState = false;
    let braceCount = 0;

    lines.forEach((line, index) => {
      if (line.includes('useState({') || line.includes('useState([')) {
        inComplexState = true;
        braceCount = (line.match(/[{[]/g) || []).length - (line.match(/[}\]]/g) || []).length;

        if (braceCount > 0) {
          let lookahead = 1;
          while (index + lookahead < lines.length && braceCount > 0) {
            const nextLine = lines[index + lookahead];
            braceCount +=
              (nextLine.match(/[{[]/g) || []).length - (nextLine.match(/[}\]]/g) || []).length;
            lookahead++;

            if (lookahead > 10) {
              // Complex state detected
              findings.push({
                ruleId: 'useState-complex-object',
                message: 'Complex state object detected, consider using useReducer',
                severity: 'info',
                file: context.filePath,
                line: index + 1,
                column: line.indexOf('useState') + 1,
                suggestion: 'Replace complex useState with useReducer for better maintainability',
              });
              break;
            }
          }
        }
      }
    });

    return findings;
  }

  // ====================
  // PERFORMANCE RULES
  // ====================

  private static checkTooManyProps(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      // Check function components with destructured props
      const propsMatch = line.match(/function\s+\w+\s*\(\s*{\s*([^}]+)\s*}/);
      if (propsMatch) {
        const props = propsMatch[1]
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        if (props.length > 10) {
          findings.push({
            ruleId: 'component-too-many-props',
            message: `Component has ${props.length} props, consider refactoring`,
            severity: 'warning',
            file: context.filePath,
            line: index + 1,
            column: 1,
            suggestion: 'Consider grouping related props into objects or using composition',
          });
        }
      }

      // Check arrow function components
      const arrowPropsMatch = line.match(/const\s+\w+\s*=\s*\(\s*{\s*([^}]+)\s*}\s*\)\s*=>/);
      if (arrowPropsMatch) {
        const props = arrowPropsMatch[1]
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        if (props.length > 10) {
          findings.push({
            ruleId: 'component-too-many-props',
            message: `Component has ${props.length} props, consider refactoring`,
            severity: 'warning',
            file: context.filePath,
            line: index + 1,
            column: 1,
            suggestion: 'Consider grouping related props into objects or using composition',
          });
        }
      }
    });

    return findings;
  }

  private static checkInlineObjectCreation(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      // Check for inline objects in JSX
      if (
        line.includes('<') &&
        line.includes('={') &&
        !line.includes('useState') &&
        !line.includes('useMemo')
      ) {
        const matches = line.match(/\w+\s*=\s*\{[^}]+\}/g);
        if (matches) {
          matches.forEach(match => {
            findings.push({
              ruleId: 'inline-object-creation',
              message: 'Avoid inline object creation in JSX props',
              severity: 'warning',
              file: context.filePath,
              line: index + 1,
              column: line.indexOf(match) + 1,
              suggestion: 'Move object creation outside render or use useMemo',
            });
          });
        }
      }
    });

    return findings;
  }

  private static checkMissingMemo(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const content = context.content;

    // Check for functional components that might benefit from memo
    const componentRegex =
      /(export\s+)?(default\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*:\s*\w+\s*=>))/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[3] || match[4];
      if (componentName && componentName[0] === componentName[0].toUpperCase()) {
        // Check if component is not already memoized
        if (!content.includes(`memo(${componentName})`) && !content.includes('React.memo')) {
          const lines = content.substring(0, match.index).split('\n');
          findings.push({
            ruleId: 'missing-react-memo',
            message: `Consider wrapping ${componentName} with React.memo`,
            severity: 'info',
            file: context.filePath,
            line: lines.length,
            column: 1,
            suggestion: `Wrap component with React.memo to prevent unnecessary re-renders`,
          });
        }
      }
    }

    return findings;
  }

  private static checkHeavyComputation(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    const heavyOperations = [
      'sort(',
      'filter(',
      'map(',
      'reduce(',
      'forEach(',
      'find(',
      'JSON.parse(',
      'JSON.stringify(',
      'Object.keys(',
      'Object.values(',
      'Array.from(',
    ];

    lines.forEach((line, index) => {
      const inRender = line.includes('return (') || line.includes('return<');
      const hasHeavyOp = heavyOperations.some(op => line.includes(op));

      if (inRender && hasHeavyOp && !line.includes('useMemo') && !line.includes('useCallback')) {
        findings.push({
          ruleId: 'heavy-computation-render',
          message: 'Heavy computation detected in render method',
          severity: 'warning',
          file: context.filePath,
          line: index + 1,
          column: 1,
          suggestion: 'Consider using useMemo to memoize expensive computations',
        });
      }
    });

    return findings;
  }

  // ====================
  // ACCESSIBILITY RULES
  // ====================

  private static checkMissingAltText(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, index) => {
      // Check for img tags without alt attribute
      if (line.includes('<img') && !line.includes('alt=')) {
        findings.push({
          ruleId: 'missing-alt-text',
          message: 'Image element is missing alt attribute',
          severity: 'error',
          file: context.filePath,
          line: index + 1,
          column: line.indexOf('<img') + 1,
          suggestion: 'Add meaningful alt text to describe the image content',
        });
      }
    });

    return findings;
  }

  private static checkMissingAriaLabels(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');

    const inputElements = ['<input', '<textarea', '<select', '<button'];

    lines.forEach((line, index) => {
      inputElements.forEach(element => {
        if (
          line.includes(element) &&
          !line.includes('aria-label=') &&
          !line.includes('aria-labelledby=') &&
          !line.includes('id=')
        ) {
          findings.push({
            ruleId: 'missing-aria-labels',
            message: `${element.replace('<', '').replace('>', '')} element should have accessible labeling`,
            severity: 'error',
            file: context.filePath,
            line: index + 1,
            column: line.indexOf(element) + 1,
            suggestion: 'Add aria-label, aria-labelledby, or associate with a label element',
          });
        }
      });
    });

    return findings;
  }

  private static checkHeadingOrder(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const lines = context.content.split('\n');
    const headings: { level: number; line: number }[] = [];

    lines.forEach((line, index) => {
      const headingMatch = line.match(/<h([1-6])[^>]*>/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        headings.push({ level, line: index + 1 });
      }
    });

    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];

      if (current.level > previous.level + 1) {
        findings.push({
          ruleId: 'invalid-heading-order',
          message: `Heading h${current.level} skips hierarchy levels`,
          severity: 'warning',
          file: context.filePath,
          line: current.line,
          column: 1,
          suggestion: `Use h${previous.level + 1} instead of h${current.level} to maintain proper hierarchy`,
        });
      }
    }

    return findings;
  }

  private static checkFocusManagement(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const content = context.content;

    // Check for modal/dialog components without focus management
    const hasModal =
      content.includes('modal') ||
      content.includes('dialog') ||
      content.includes('Modal') ||
      content.includes('Dialog');
    const hasFocusManagement =
      content.includes('useRef') || content.includes('focus()') || content.includes('autoFocus');

    if (hasModal && !hasFocusManagement) {
      const lines = content.split('\n');
      const modalLine = lines.findIndex(
        line => line.toLowerCase().includes('modal') || line.toLowerCase().includes('dialog')
      );

      if (modalLine !== -1) {
        findings.push({
          ruleId: 'missing-focus-management',
          message: 'Modal/Dialog component should implement focus management',
          severity: 'warning',
          file: context.filePath,
          line: modalLine + 1,
          column: 1,
          suggestion: 'Add focus management using useRef and focus() method or autoFocus prop',
        });
      }
    }

    return findings;
  }

  // ====================
  // HELPER METHODS
  // ====================

  private static fallbackAnalysis(context: RuleContext): Finding[] {
    // Fallback to regex-based analysis for critical rules
    const findings: Finding[] = [];

    findings.push(...this.checkUseEffectDependencies(context));
    findings.push(...this.checkMissingAltText(context));
    findings.push(...this.checkMissingAriaLabels(context));

    return findings;
  }
}
