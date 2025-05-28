
export const VERSION = '0.1.0';



export interface Platform {

  name: 'web' | 'native' | 'shared';

}



export interface AnalysisResult {

  platform: string;

  timestamp: string;

  findings: any[];

  metrics: {

    totalFiles: number;

    analyzedFiles: number;

    errorCount: number;

    warningCount: number;

    infoCount: number;

    overallHealth: number;

  };

}



export function calculateHealthScore(findings: any[]): number {

  if (findings.length === 0) return 10;

  // Simple calculation for now

  return Math.max(0, 10 - findings.length * 0.5);

}

