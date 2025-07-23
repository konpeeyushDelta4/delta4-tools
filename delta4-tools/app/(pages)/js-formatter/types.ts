export interface FormatterOptions {
  indent: number;
  spaces: boolean;
  language: 'javascript' | 'typescript' | 'react';
}

export interface FormatterResult {
  success: boolean;
  code: string;
  error?: string;
}

export type LanguageType = FormatterOptions['language'];