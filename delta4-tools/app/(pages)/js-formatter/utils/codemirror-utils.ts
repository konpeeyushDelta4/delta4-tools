import { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { LanguageType } from './types';

export function getLanguageExtension(language: LanguageType): Extension {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'react':
      return javascript({ jsx: true, typescript: false });
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
      return 'React (JSX)';
    default:
      return 'JavaScript';
  }
}

export const SUPPORTED_LANGUAGES: LanguageType[] = ['javascript', 'typescript', 'react'];