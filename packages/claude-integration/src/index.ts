import type { AnalysisResult, Finding } from '@rta/core';

/**
 * Configuration for Claude API integration
 */
export interface ClaudeConfig {
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * Claude API integration service
 */
export class ClaudeService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(config: ClaudeConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Enhance analysis results with AI insights
   */
  async enhanceAnalysis(analysis: AnalysisResult): Promise<AnalysisResult> {
    if (!this.apiKey) {
      console.warn('Claude API key not provided, skipping AI enhancement');
      return analysis;
    }

    try {
      const prompt = this.buildAnalysisPrompt(analysis);
      const aiInsights = await this.callClaude(prompt);

      return {
        ...analysis,
        summary: aiInsights.summary || analysis.summary,
        findings: this.enhanceFindings(analysis.findings, aiInsights.suggestions || []),
      };
    } catch (error) {
      console.warn('Failed to enhance analysis with AI:', error);
      return analysis;
    }
  }

  /**
   * Generate intelligent summary and suggestions
   */
  async generateInsights(findings: Finding[]): Promise<{ summary: string; suggestions: string[] }> {
    if (!this.apiKey || findings.length === 0) {
      return {
        summary: 'Analysis completed',
        suggestions: [],
      };
    }

    const prompt = this.buildInsightsPrompt(findings);
    return await this.callClaude(prompt);
  }

  private buildAnalysisPrompt(analysis: AnalysisResult): string {
    return `
Analyze this React/TypeScript project analysis and provide insights:

Project: ${analysis.metadata.projectName}
Framework: ${analysis.metadata.framework}
Health Score: ${analysis.healthScore}/10

Findings Summary:
${analysis.findings.map(f => `- ${f.severity.toUpperCase()}: ${f.message} (${f.file}:${f.line})`).join('\n')}

Please provide:
1. A concise summary (2-3 sentences) of the overall project health
2. Top 3 actionable improvement suggestions
3. Prioritization of issues by impact

Respond in JSON format:
{
  "summary": "...",
  "suggestions": ["...", "...", "..."]
}
`;
  }

  private buildInsightsPrompt(findings: Finding[]): string {
    return `
Analyze these React/TypeScript code findings and provide insights:

${findings.map(f => `${f.ruleId}: ${f.message} (${f.file}:${f.line})`).join('\n')}

Provide practical insights in JSON format:
{
  "summary": "Brief overall assessment",
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
}
`;
  }

  private async callClaude(prompt: string): Promise<any> {
    // Mock implementation for now - replace with actual Claude API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      summary:
        'Analysis shows good TypeScript practices with some performance optimization opportunities.',
      suggestions: [
        'Consider memoizing expensive computations with useMemo',
        'Add prop type interfaces for better type safety',
        'Implement error boundaries for better error handling',
      ],
    };
  }

  private enhanceFindings(findings: Finding[], suggestions: string[]): Finding[] {
    return findings.map((finding, index) => ({
      ...finding,
      suggestion: suggestions[index] || finding.message,
    }));
  }
}

/**
 * Default export for convenience
 */
export default ClaudeService;
