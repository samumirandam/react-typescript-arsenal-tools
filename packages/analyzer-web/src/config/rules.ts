export interface RuleConfig {
  enabled: boolean;
  severity?: 'error' | 'warning' | 'info';
  options?: Record<string, any>;
}

export interface AnalyzerConfig {
  rules: Record<string, RuleConfig>;
  categories: {
    'react-hooks': boolean;
    performance: boolean;
    accessibility: boolean;
    'type-safety': boolean;
    correctness: boolean;
    'best-practices': boolean;
  };
  presets: 'strict' | 'recommended' | 'minimal';
}

/**
 * Default configuration presets
 */
export const PRESET_CONFIGS: Record<string, Partial<AnalyzerConfig>> = {
  strict: {
    categories: {
      'react-hooks': true,
      performance: true,
      accessibility: true,
      'type-safety': true,
      correctness: true,
      'best-practices': true,
    },
    rules: {
      // React Hooks - Strict
      'useEffect-missing-deps': { enabled: true, severity: 'error' },
      'useMemo-unnecessary': { enabled: true, severity: 'warning' },
      'useCallback-missing-deps': { enabled: true, severity: 'error' },
      'useState-complex-object': { enabled: true, severity: 'warning' },

      // Performance - Strict
      'component-too-many-props': { enabled: true, severity: 'error', options: { maxProps: 8 } },
      'inline-object-creation': { enabled: true, severity: 'warning' },
      'missing-react-memo': { enabled: true, severity: 'info' },
      'heavy-computation-render': { enabled: true, severity: 'warning' },

      // Accessibility - Strict
      'missing-alt-text': { enabled: true, severity: 'error' },
      'missing-aria-labels': { enabled: true, severity: 'error' },
      'invalid-heading-order': { enabled: true, severity: 'error' },
      'missing-focus-management': { enabled: true, severity: 'warning' },

      // Legacy rules - Strict
      'react-anonymous-function': { enabled: true, severity: 'warning' },
      'react-missing-key': { enabled: true, severity: 'error' },
      'typescript-any-usage': { enabled: true, severity: 'error' },
      'react-missing-props-interface': { enabled: true, severity: 'warning' },
    },
  },

  recommended: {
    categories: {
      'react-hooks': true,
      performance: true,
      accessibility: true,
      'type-safety': true,
      correctness: true,
      'best-practices': true,
    },
    rules: {
      // React Hooks - Recommended
      'useEffect-missing-deps': { enabled: true, severity: 'warning' },
      'useMemo-unnecessary': { enabled: true, severity: 'info' },
      'useCallback-missing-deps': { enabled: true, severity: 'warning' },
      'useState-complex-object': { enabled: true, severity: 'info' },

      // Performance - Recommended
      'component-too-many-props': { enabled: true, severity: 'warning', options: { maxProps: 10 } },
      'inline-object-creation': { enabled: true, severity: 'warning' },
      'missing-react-memo': { enabled: false }, // Disabled in recommended
      'heavy-computation-render': { enabled: true, severity: 'warning' },

      // Accessibility - Recommended
      'missing-alt-text': { enabled: true, severity: 'error' },
      'missing-aria-labels': { enabled: true, severity: 'warning' },
      'invalid-heading-order': { enabled: true, severity: 'warning' },
      'missing-focus-management': { enabled: true, severity: 'info' },

      // Legacy rules - Recommended
      'react-anonymous-function': { enabled: true, severity: 'warning' },
      'react-missing-key': { enabled: true, severity: 'error' },
      'typescript-any-usage': { enabled: true, severity: 'warning' },
      'react-missing-props-interface': { enabled: true, severity: 'info' },
    },
  },

  minimal: {
    categories: {
      'react-hooks': true,
      performance: false,
      accessibility: true,
      'type-safety': true,
      correctness: true,
      'best-practices': false,
    },
    rules: {
      // React Hooks - Minimal (only critical)
      'useEffect-missing-deps': { enabled: true, severity: 'warning' },
      'useMemo-unnecessary': { enabled: false },
      'useCallback-missing-deps': { enabled: false },
      'useState-complex-object': { enabled: false },

      // Performance - Minimal (disabled)
      'component-too-many-props': { enabled: false },
      'inline-object-creation': { enabled: false },
      'missing-react-memo': { enabled: false },
      'heavy-computation-render': { enabled: false },

      // Accessibility - Minimal (critical only)
      'missing-alt-text': { enabled: true, severity: 'error' },
      'missing-aria-labels': { enabled: true, severity: 'error' },
      'invalid-heading-order': { enabled: false },
      'missing-focus-management': { enabled: false },

      // Legacy rules - Minimal
      'react-anonymous-function': { enabled: false },
      'react-missing-key': { enabled: true, severity: 'error' },
      'typescript-any-usage': { enabled: true, severity: 'warning' },
      'react-missing-props-interface': { enabled: false },
    },
  },
};

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AnalyzerConfig = {
  presets: 'recommended',
  categories: PRESET_CONFIGS.recommended.categories!,
  rules: PRESET_CONFIGS.recommended.rules!,
};

/**
 * Load configuration from file or return default
 */
export function loadConfig(configPath?: string): AnalyzerConfig {
  if (configPath) {
    try {
      // In a real implementation, this would read from file
      // For now, return default config
      return DEFAULT_CONFIG;
    } catch (error) {
      console.warn(`Could not load config from ${configPath}, using default`);
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Apply preset to configuration
 */
export function applyPreset(preset: 'strict' | 'recommended' | 'minimal'): AnalyzerConfig {
  const presetConfig = PRESET_CONFIGS[preset];
  return {
    presets: preset,
    categories: presetConfig.categories!,
    rules: presetConfig.rules!,
  };
}

/**
 * Check if rule is enabled based on configuration
 */
export function isRuleEnabled(ruleId: string, config: AnalyzerConfig): boolean {
  const ruleConfig = config.rules[ruleId];
  return ruleConfig?.enabled ?? true;
}

/**
 * Get effective severity for a rule
 */
export function getRuleSeverity(
  ruleId: string,
  config: AnalyzerConfig,
  defaultSeverity: 'error' | 'warning' | 'info'
): 'error' | 'warning' | 'info' {
  const ruleConfig = config.rules[ruleId];
  return ruleConfig?.severity ?? defaultSeverity;
}

/**
 * Get rule options
 */
export function getRuleOptions(ruleId: string, config: AnalyzerConfig): Record<string, any> {
  const ruleConfig = config.rules[ruleId];
  return ruleConfig?.options ?? {};
}
