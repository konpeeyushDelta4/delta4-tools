import { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { LanguageType } from '../types';

export function getLanguageExtension(language: LanguageType): Extension {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'react':
      return javascript({ jsx: true, typescript: false });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'json':
      return json();
    default:
      return javascript();
  }
}

export function getLanguageDisplayName(language: LanguageType): string {
  switch (language) {
    case 'javascript':
      return 'JavaScript';
    case 'typescript':
      return 'TypeScript';
    case 'react':
      return 'JSX';
    case 'tsx':
      return 'TSX';
    case 'json':
      return 'JSON';
    default:
      return 'JavaScript';
  }
}

export const SUPPORTED_LANGUAGES: LanguageType[] = ['javascript', 'typescript', 'react', 'tsx', 'json'];