import { FormatterOptions, FormatterResult } from './types';

export function formatCode(code: string, options: FormatterOptions): FormatterResult {
  if (!code.trim()) {
    return { success: true, code: '' };
  }

  try {
    let formatted: string;
    
    switch (options.language) {
      case 'javascript':
        formatted = formatJavaScript(code, options);
        break;
      case 'typescript':
        formatted = formatTypeScript(code, options);
        break;
      case 'react':
        formatted = formatReact(code, options);
        break;
      default:
        formatted = formatJavaScript(code, options);
    }
    
    return { success: true, code: formatted };
  } catch (error) {
    return {
      success: false,
      code: '',
      error: `Error formatting ${options.language}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function formatJavaScript(code: string, options: FormatterOptions): string {
  const indent = options.spaces ? ' '.repeat(options.indent) : '\t';
  let formatted = '';
  let indentLevel = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inBlockComment = false;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = code[i - 1];
    
    if (inBlockComment) {
      formatted += char;
      if (char === '*' && nextChar === '/') {
        formatted += nextChar;
        i++;
        inBlockComment = false;
      }
      continue;
    }
    
    if (inComment) {
      formatted += char;
      if (char === '\n') {
        inComment = false;
        formatted += indent.repeat(indentLevel);
      }
      continue;
    }
    
    if (!inString && char === '/' && nextChar === '/') {
      inComment = true;
      formatted += char;
      continue;
    }
    
    if (!inString && char === '/' && nextChar === '*') {
      inBlockComment = true;
      formatted += char;
      continue;
    }
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
      formatted += char;
      continue;
    }
    
    if (inString) {
      formatted += char;
      if (char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = '';
      }
      continue;
    }
    
    if (char === '{') {
      formatted += char;
      indentLevel++;
      if (nextChar !== '}') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === '}') {
      if (prevChar !== '{') {
        formatted = formatted.trimEnd();
        formatted += '\n';
        indentLevel--;
        formatted += indent.repeat(indentLevel);
      } else {
        indentLevel--;
      }
      formatted += char;
      if (nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ';') {
      formatted += char;
      if (nextChar && nextChar !== '\n' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ',') {
      formatted += char;
      if (nextChar !== ' ' && nextChar !== '\n') {
        formatted += ' ';
      }
    } else if (char === '\n' || char === '\r') {
      if (formatted.trim() && !formatted.endsWith('\n')) {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ' ' || char === '\t') {
      if (!formatted.endsWith(' ') && !formatted.endsWith('\n')) {
        formatted += ' ';
      }
    } else {
      formatted += char;
    }
  }
  
  return formatted.trim();
}

function formatTypeScript(code: string, options: FormatterOptions): string {
  // Enhanced formatting for TypeScript with type annotations
  let formatted = formatJavaScript(code, options);
  
  // Additional TypeScript-specific formatting can be added here
  // For now, we use the JavaScript formatter as base since TS is a superset
  
  return formatted;
}

function formatReact(code: string, options: FormatterOptions): string {
  // Enhanced formatting for React/JSX
  const indent = options.spaces ? ' '.repeat(options.indent) : '\t';
  let formatted = '';
  let indentLevel = 0;
  let inJSX = false;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inBlockComment = false;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = code[i - 1];
    
    // Handle comments
    if (inBlockComment) {
      formatted += char;
      if (char === '*' && nextChar === '/') {
        formatted += nextChar;
        i++;
        inBlockComment = false;
      }
      continue;
    }
    
    if (inComment) {
      formatted += char;
      if (char === '\n') {
        inComment = false;
        formatted += indent.repeat(indentLevel);
      }
      continue;
    }
    
    if (!inString && char === '/' && nextChar === '/') {
      inComment = true;
      formatted += char;
      continue;
    }
    
    if (!inString && char === '/' && nextChar === '*') {
      inBlockComment = true;
      formatted += char;
      continue;
    }
    
    // Handle strings
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
      formatted += char;
      continue;
    }
    
    if (inString) {
      formatted += char;
      if (char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = '';
      }
      continue;
    }
    
    // Handle JSX tags
    if (char === '<' && nextChar && /[A-Za-z]/.test(nextChar)) {
      inJSX = true;
      formatted += char;
    } else if (inJSX && char === '>') {
      inJSX = false;
      formatted += char;
      if (nextChar && nextChar !== '<') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === '{') {
      formatted += char;
      if (!inJSX) {
        indentLevel++;
        if (nextChar !== '}') {
          formatted += '\n' + indent.repeat(indentLevel);
        }
      }
    } else if (char === '}') {
      if (!inJSX) {
        if (prevChar !== '{') {
          formatted = formatted.trimEnd();
          formatted += '\n';
          indentLevel--;
          formatted += indent.repeat(indentLevel);
        } else {
          indentLevel--;
        }
      }
      formatted += char;
      if (!inJSX && nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ';') {
      formatted += char;
      if (nextChar && nextChar !== '\n' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ',') {
      formatted += char;
      if (nextChar !== ' ' && nextChar !== '\n') {
        formatted += ' ';
      }
    } else if (char === '\n' || char === '\r') {
      if (formatted.trim() && !formatted.endsWith('\n')) {
        formatted += '\n' + indent.repeat(indentLevel);
      }
    } else if (char === ' ' || char === '\t') {
      if (!formatted.endsWith(' ') && !formatted.endsWith('\n')) {
        formatted += ' ';
      }
    } else {
      formatted += char;
    }
  }
  
  return formatted.trim();
}