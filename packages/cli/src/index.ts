
export interface AnalysisOptions {

  platform?: 'web' | 'native' | 'auto';

  output?: 'json' | 'table' | 'markdown';

  ai?: boolean;

  save?: string;

}



export * from '@rta/core';

export * from '@rta/analyzer-web';

export * from '@rta/claude-integration';

