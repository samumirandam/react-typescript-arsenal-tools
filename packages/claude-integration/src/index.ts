import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult, Finding } from '@rta/core';

/**
 * Configuration for Claude API integration
 */
export interface ClaudeConfig {
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  timeout?: number;
}

/**
 * Extended AnalysisResult with AI enhancement fields
 */
export interface EnhancedAnalysisResult extends AnalysisResult {
  aiEnhanced?: boolean;
  aiModel?: string;
  aiError?: string;
}

/**
 * Claude API integration service
 */
export class ClaudeService {
  private anthropic: Anthropic;
  private config: Required<ClaudeConfig>;

  constructor(config: ClaudeConfig) {
    if (!config.apiKey) {
      throw new Error('Claude API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      maxTokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.3,
      model: config.model ?? 'claude-3-5-haiku-latest', // Most economical
      timeout: config.timeout ?? 30000,
    };

    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });
  }

  /**
   * Enhance analysis results with AI insights
   */
  async enhanceAnalysis(analysis: AnalysisResult): Promise<EnhancedAnalysisResult> {
    if (!this.config.apiKey) {
      console.warn('Claude API key not provided, skipping AI enhancement');
      return { ...analysis, aiEnhanced: false };
    }

    try {
      const prompt = this.buildAnalysisPrompt(analysis);
      const aiInsights = await this.callClaude(prompt);

      return {
        ...analysis,
        summary: aiInsights.summary || analysis.summary,
        findings: this.enhanceFindings(analysis.findings, aiInsights.suggestions || []),
        aiEnhanced: true,
        aiModel: this.config.model,
      };
    } catch (error) {
      console.warn('Failed to enhance analysis with AI:', error);
      return {
        ...analysis,
        aiEnhanced: false,
        aiError: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate intelligent summary and suggestions
   */
  async generateInsights(findings: Finding[]): Promise<{ summary: string; suggestions: string[] }> {
    if (!this.config.apiKey || findings.length === 0) {
      return {
        summary: 'Analysis completed',
        suggestions: [],
      };
    }

    try {
      const prompt = this.buildInsightsPrompt(findings);
      return await this.callClaude(prompt);
    } catch (error) {
      console.warn('Failed to generate AI insights:', error);
      return {
        summary: 'Analysis completed with some issues detected',
        suggestions: ['Review the findings above for improvement opportunities'],
      };
    }
  }

  /**
   * Analyze specific code snippets for deeper insights
   */
  async analyzeCodeSnippet(
    code: string,
    filePath: string,
    context?: string
  ): Promise<{ insights: string[]; suggestions: string[] }> {
    if (!this.config.apiKey) {
      return { insights: [], suggestions: [] };
    }

    try {
      const prompt = this.buildCodeAnalysisPrompt(code, filePath, context);
      const response = await this.callClaude(prompt);

      return {
        insights: response.insights || [],
        suggestions: response.suggestions || [],
      };
    } catch (error) {
      console.warn('Failed to analyze code snippet:', error);
      return { insights: [], suggestions: [] };
    }
  }

  private buildAnalysisPrompt(analysis: AnalysisResult): string {
    const findingsByRuleId = this.groupFindingsByRuleId(analysis.findings);
    const errorCount = analysis.findings.filter(f => f.severity === 'error').length;
    const warningCount = analysis.findings.filter(f => f.severity === 'warning').length;
    const infoCount = analysis.findings.filter(f => f.severity === 'info').length;

    return `You are an expert React/TypeScript code reviewer. Analyze this project analysis and provide insights.

## Project Overview
- **Name**: ${analysis.metadata.projectName}
- **Framework**: ${analysis.metadata.framework}
- **Platform**: ${analysis.platform}
- **Version**: ${analysis.metadata.version}
- **Dependencies**: ${analysis.metadata.dependencies.length} packages
- **Current Health Score**: ${analysis.healthScore}/10

## Issues Breakdown
- **Errors**: ${errorCount} (critical issues)
- **Warnings**: ${warningCount} (should fix)
- **Info**: ${infoCount} (improvements)
- **Total Files Analyzed**: ${analysis.metrics?.analyzedFiles || 'Unknown'}

## Issues by Rule
${Object.entries(findingsByRuleId)
  .map(
    ([ruleId, findings]) =>
      `### ${ruleId} (${findings.length} occurrences)
${findings
  .slice(0, 3)
  .map(f => `- ${f.severity.toUpperCase()}: ${f.message} (${f.file}:${f.line})`)
  .join('\n')}${findings.length > 3 ? `\n... and ${findings.length - 3} more` : ''}`
  )
  .join('\n\n')}

Please provide a comprehensive analysis in JSON format:
{
  "summary": "2-3 sentences about overall project health, focusing on the most critical issues and patterns",
  "suggestions": [
    "Most critical improvement that would have maximum impact on code quality",
    "Quick win that could be implemented immediately",
    "Long-term architectural recommendation for better maintainability"
  ],
  "priorityIssues": [
    "The single most important issue to fix first and why it matters"
  ],
  "positivePoints": [
    "What the project is doing well based on the analysis"
  ]
}

Focus on:
1. **Actionable insights** - specific recommendations with clear benefits
2. **Priority order** - what to fix first for maximum impact
3. **Modern best practices** - current React/TypeScript patterns and standards
4. **Project context** - consider the framework (${analysis.metadata.framework}) and platform (${analysis.platform})`;
  }

  private buildInsightsPrompt(findings: Finding[]): string {
    const groupedByRule = this.groupFindingsByRuleId(findings);

    return `You are an expert React/TypeScript developer. Analyze these code analysis findings and provide practical insights.

## Code Issues Analysis
${Object.entries(groupedByRule)
  .map(
    ([ruleId, ruleFindings]) =>
      `### ${ruleId} (${ruleFindings.length} occurrences)
${ruleFindings
  .slice(0, 2)
  .map(
    f => `- **${f.severity.toUpperCase()}** in ${f.file}:${f.line}
  Issue: ${f.message}${f.suggestion ? `\n  Current suggestion: ${f.suggestion}` : ''}`
  )
  .join('\n')}`
  )
  .join('\n\n')}

IMPORTANT: Respond ONLY with valid JSON in exactly this format:

{
  "summary": "Brief assessment focusing on the most important patterns and root causes you identify",
  "suggestions": [
    "Most impactful improvement that addresses multiple issues or root causes",
    "Quick fix that would immediately improve code quality", 
    "Best practice recommendation for preventing similar issues"
  ],
  "patterns": [
    "Any recurring patterns, architectural issues, or systematic problems you notice"
  ]
}

Do not include any text before or after the JSON. Make suggestions:
- **Specific**: Include concrete examples when helpful
- **Prioritized**: Most impactful improvements first
- **Contextual**: Consider the existing codebase patterns
- **Modern**: Focus on current React/TypeScript best practices and tooling`;
  }

  private buildCodeAnalysisPrompt(code: string, filePath: string, context?: string): string {
    return `Analyze this React/TypeScript code snippet for potential improvements and insights.

## File: ${filePath}
${context ? `## Context\n${context}\n` : ''}

## Code
\`\`\`typescript
${code}
\`\`\`

IMPORTANT: Respond ONLY with valid JSON in exactly this format:

{
  "insights": [
    "What this code is doing well - positive patterns to recognize",
    "Potential issues, anti-patterns, or areas for improvement",
    "Modern React/TypeScript patterns that could be applied"
  ],
  "suggestions": [
    "Most important improvement with clear reasoning and benefit",
    "Performance optimization if applicable (with specific impact)",
    "Type safety or maintainability enhancement"
  ]
}

Do not include any text before or after the JSON. Focus on:
- **Performance implications** - runtime and bundle size impact
- **Type safety improvements** - better TypeScript usage
- **Modern React patterns** - hooks, composition, best practices
- **Code maintainability** - readability, testability, scalability
- **Testing considerations** - how to make this code more testable`;
  }

  private async callClaude(prompt: string): Promise<any> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from Claude's response
      const textContent = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      // Try to parse JSON response with multiple strategies
      const parsedResponse = this.parseClaudeResponse(textContent);
      return parsedResponse;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error('Claude API Error:', {
          status: error.status,
          message: error.message,
        });

        // Handle specific error types
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.status === 401) {
          throw new Error('Invalid API key. Please check your Claude API configuration.');
        } else if (error.status === 400) {
          throw new Error('Invalid request. Please check the analysis parameters.');
        }
      }

      throw error;
    }
  }

  private parseClaudeResponse(text: string): any {
    // Strategy 1: Try to parse the entire response as JSON
    try {
      return JSON.parse(text.trim());
    } catch (error) {
      // Continue to next strategy
    }

    // Strategy 2: Look for JSON within code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (error) {
        // Continue to next strategy
      }
    }

    // Strategy 3: Find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        // Continue to next strategy
      }
    }

    // Strategy 4: Look for multiple JSON objects and take the first valid one
    const jsonObjects = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
    if (jsonObjects) {
      for (const jsonStr of jsonObjects) {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed && (parsed.summary || parsed.suggestions || parsed.insights)) {
            return parsed;
          }
        } catch (error) {
          continue;
        }
      }
    }

    // Strategy 5: Fallback to text extraction
    console.warn('Could not parse JSON from Claude response, using text extraction fallback');
    return this.extractInsightsFromText(text);
  }

  private extractInsightsFromText(text: string): { summary: string; suggestions: string[] } {
    // Enhanced fallback parser for when JSON parsing fails
    let summary = 'Analysis completed successfully.';
    const suggestions: string[] = [];

    // Strategy 1: Look for summary patterns
    const summaryPatterns = [
      /summary[":]\s*["']([^"']+)["']/i,
      /summary[":]\s*([^,\n]+)/i,
      /overall[^:]*[:]\s*([^,\n]+)/i,
      /assessment[^:]*[:]\s*([^,\n]+)/i,
    ];

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        summary = match[1].trim().replace(/[",]/g, '');
        break;
      }
    }

    // Strategy 2: Extract suggestions from various formats

    // Look for JSON-like suggestions array
    const jsonSuggestionsMatch = text.match(/suggestions?\s*:\s*\[(.*?)\]/is);
    if (jsonSuggestionsMatch) {
      const suggestionsText = jsonSuggestionsMatch[1];
      const extracted = suggestionsText
        .split(/[",]\s*["']/)
        .map(s => s.replace(/^["']|["']$/g, '').trim())
        .filter(s => s.length > 5);
      suggestions.push(...extracted.slice(0, 3));
    }

    // Look for bullet points or numbered lists
    if (suggestions.length === 0) {
      const lines = text.split('\n').map(line => line.trim());
      const bulletPatterns = [/^[-*•]\s+(.+)/, /^\d+\.\s+(.+)/, /^[➤►]\s+(.+)/];

      for (const line of lines) {
        for (const pattern of bulletPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && match[1].length > 10) {
            suggestions.push(match[1].trim());
            if (suggestions.length >= 3) break;
          }
        }
        if (suggestions.length >= 3) break;
      }
    }

    // Strategy 3: Look for recommendation patterns
    if (suggestions.length === 0) {
      const recommendationPatterns = [
        /recommend[^:]*[:]\s*([^.!?]+[.!?])/gi,
        /suggest[^:]*[:]\s*([^.!?]+[.!?])/gi,
        /consider\s+([^.!?]+[.!?])/gi,
        /should\s+([^.!?]+[.!?])/gi,
      ];

      for (const pattern of recommendationPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].trim().length > 10) {
            suggestions.push(match[1].trim());
            if (suggestions.length >= 3) break;
          }
        }
        if (suggestions.length >= 3) break;
      }
    }

    // Strategy 4: Extract key points from paragraphs
    if (suggestions.length === 0) {
      const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.replace(/\s+/g, ' ').trim())
        .filter(p => p.length > 20 && p.length < 200);

      suggestions.push(...paragraphs.slice(0, 3));
    }

    // Ensure we have at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push('Review the code analysis results for improvement opportunities');
    }

    // Clean up suggestions
    const cleanSuggestions = suggestions
      .map(s => s.replace(/^[^\w]*/, '').replace(/[^\w.!?]*$/, ''))
      .filter(s => s.length > 5)
      .slice(0, 3);

    return {
      summary: summary.length > 200 ? summary.substring(0, 197) + '...' : summary,
      suggestions:
        cleanSuggestions.length > 0
          ? cleanSuggestions
          : ['Review findings for improvement opportunities'],
    };
  }

  private enhanceFindings(findings: Finding[], suggestions: string[]): Finding[] {
    return findings.map((finding, index) => ({
      ...finding,
      suggestion: suggestions[index] || finding.suggestion || finding.message,
    }));
  }

  private groupFindingsByRuleId(findings: Finding[]): Record<string, Finding[]> {
    return findings.reduce(
      (acc, finding) => {
        const ruleId = finding.ruleId;
        if (!acc[ruleId]) {
          acc[ruleId] = [];
        }
        acc[ruleId].push(finding);
        return acc;
      },
      {} as Record<string, Finding[]>
    );
  }

  /**
   * Test the Claude API connection
   */
  async testConnection(): Promise<{ success: boolean; model: string; error?: string }> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content:
              'Respond with "Connection successful" in JSON format: {"status": "Connection successful"}',
          },
        ],
      });

      return {
        success: true,
        model: this.config.model,
      };
    } catch (error) {
      return {
        success: false,
        model: this.config.model,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available Claude models with cost information
   */
  static getAvailableModels(): Array<{
    id: string;
    name: string;
    description: string;
    costLevel: 'low' | 'medium' | 'high';
    recommended: string;
  }> {
    return [
      {
        id: 'claude-3-5-haiku-latest',
        name: 'Claude 3.5 Haiku',
        description: 'Most economical option for development and testing',
        costLevel: 'low',
        recommended: 'Development & testing',
      },
      {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced performance and cost for production use',
        costLevel: 'medium',
        recommended: 'Production',
      },
      {
        id: 'claude-opus-4-20250514',
        name: 'Claude 4 Opus',
        description: 'Highest quality analysis for premium features',
        costLevel: 'high',
        recommended: 'Premium features',
      },
    ];
  }

  /**
   * Debug method to see raw Claude responses
   */
  async debugResponse(prompt: string): Promise<{
    rawResponse: string;
    parsedResponse: any;
    parseStrategy: string;
  }> {
    try {
      const message = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const rawResponse = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      let parseStrategy = 'none';
      let parsedResponse: any = null;

      // Try each parsing strategy and record which one worked
      try {
        parsedResponse = JSON.parse(rawResponse.trim());
        parseStrategy = 'direct-json';
      } catch (error) {
        const codeBlockMatch = rawResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            parsedResponse = JSON.parse(codeBlockMatch[1]);
            parseStrategy = 'code-block';
          } catch (error) {
            // Continue
          }
        }

        if (!parsedResponse) {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedResponse = JSON.parse(jsonMatch[0]);
              parseStrategy = 'json-extract';
            } catch (error) {
              // Continue
            }
          }
        }

        if (!parsedResponse) {
          parsedResponse = this.extractInsightsFromText(rawResponse);
          parseStrategy = 'text-fallback';
        }
      }

      return {
        rawResponse,
        parsedResponse,
        parseStrategy,
      };
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Default export for convenience
 */
export default ClaudeService;
