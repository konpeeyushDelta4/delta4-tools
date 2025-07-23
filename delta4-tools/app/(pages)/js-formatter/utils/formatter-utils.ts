import { FormatterOptions, FormatterResult } from '../types';

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
      case 'tsx':
        formatted = formatTSX(code, options);
        break;
      case 'json':
        formatted = formatJSON(code, options);
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
        formatted += indent.repeat(Math.max(0, indentLevel));
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
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === '}') {
      if (prevChar !== '{') {
        formatted = formatted.trimEnd();
        formatted += '\n';
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(Math.max(0, indentLevel));
      } else {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      formatted += char;
      if (nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === ';') {
      formatted += char;
      if (nextChar && nextChar !== '\n' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === ',') {
      formatted += char;
      if (nextChar !== ' ' && nextChar !== '\n') {
        formatted += ' ';
      }
    } else if (char === '\n' || char === '\r') {
      if (formatted.trim() && !formatted.endsWith('\n')) {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
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
  // Enhanced TypeScript formatting with type handling
  const indent = options.spaces ? ' '.repeat(options.indent) : '\t';
  let formatted = formatJavaScript(code, options);
  
  // Additional TypeScript-specific formatting
  formatted = formatted
    .replace(/:\s*([^,\s\n\)]+)/g, ': $1') // Fix type annotation spacing
    .replace(/\s*=>\s*/g, ' => ') // Fix arrow function spacing
    .replace(/\s*\|\s*/g, ' | ') // Fix union type spacing
    .replace(/\s*&\s*/g, ' & '); // Fix intersection type spacing
  
  return formatted;
}

function formatReact(code: string, options: FormatterOptions): string {
  return formatJSXCode(code, options, false);
}

function formatTSX(code: string, options: FormatterOptions): string {
  return formatJSXCode(code, options, true);
}

function formatJSXCode(code: string, options: FormatterOptions, isTypeScript: boolean): string {
  const indent = options.spaces ? ' '.repeat(options.indent) : '\t';
  let formatted = '';
  let indentLevel = 0;
  let inJSXTag = false;
  let inJSXExpression = false;
  let jsxExpressionDepth = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inBlockComment = false;
  let jsxTagStack: string[] = [];
  
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
        if (!inJSXTag && !inJSXExpression) {
          formatted += indent.repeat(Math.max(0, indentLevel));
        }
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
    
    // Handle JSX opening/closing tags
    if (char === '<' && !inJSXExpression) {
      const tagMatch = code.slice(i).match(/^<\/?([A-Za-z][A-Za-z0-9]*)/);
      if (tagMatch) {
        const isClosingTag = code[i + 1] === '/';
        const tagName = tagMatch[1];
        
        if (isClosingTag) {
          // Closing tag - decrease indent
          if (jsxTagStack.length > 0 && jsxTagStack[jsxTagStack.length - 1] === tagName) {
            indentLevel = Math.max(0, indentLevel - 1);
            formatted = formatted.trimEnd();
            formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
            jsxTagStack.pop();
          }
        } else {
          // Opening tag - might increase indent later
          formatted = formatted.trimEnd();
          if (formatted && !formatted.endsWith('\n')) {
            formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
          }
        }
        
        inJSXTag = true;
        formatted += char;
        continue;
      }
    }
    
    // Handle JSX tag closing
    if (inJSXTag && char === '>') {
      inJSXTag = false;
      formatted += char;
      
      // Check if it's a self-closing tag
      const isSelfClosing = prevChar === '/';
      
      if (!isSelfClosing) {
        // Extract tag name from recent formatted content
        const tagMatch = formatted.match(/<([A-Za-z][A-Za-z0-9]*)(?:\s|>)/g);
        if (tagMatch) {
          const lastTag = tagMatch[tagMatch.length - 1];
          const tagName = lastTag.match(/^<([A-Za-z][A-Za-z0-9]*)/)?.[1];
          if (tagName) {
            jsxTagStack.push(tagName);
            indentLevel++;
          }
        }
        
        // Add newline for content
        if (nextChar && nextChar !== '<' && nextChar.trim()) {
          formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
        }
      }
      continue;
    }
    
    // Handle JSX expressions
    if (!inJSXTag && char === '{') {
      if (inJSXExpression) {
        jsxExpressionDepth++;
      } else {
        inJSXExpression = true;
        jsxExpressionDepth = 1;
      }
      formatted += char;
      continue;
    }
    
    if (inJSXExpression && char === '}') {
      jsxExpressionDepth--;
      if (jsxExpressionDepth === 0) {
        inJSXExpression = false;
      }
      formatted += char;
      continue;
    }
    
    // Handle regular braces (JavaScript/TypeScript code)
    if (!inJSXTag && !inJSXExpression && char === '{') {
      formatted += char;
      indentLevel++;
      if (nextChar !== '}') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
      continue;
    }
    
    if (!inJSXTag && !inJSXExpression && char === '}') {
      if (prevChar !== '{') {
        formatted = formatted.trimEnd();
        formatted += '\n';
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(Math.max(0, indentLevel));
      } else {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      formatted += char;
      if (nextChar && nextChar !== ';' && nextChar !== ',' && nextChar !== ')' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
      continue;
    }
    
    // Handle semicolons
    if (char === ';' && !inJSXTag && !inJSXExpression) {
      formatted += char;
      if (nextChar && nextChar !== '\n' && nextChar !== '}') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
      continue;
    }
    
    // Handle commas
    if (char === ',' && !inJSXTag) {
      formatted += char;
      if (nextChar !== ' ' && nextChar !== '\n') {
        formatted += ' ';
      }
      continue;
    }
    
    // Handle newlines
    if (char === '\n' || char === '\r') {
      if (formatted.trim() && !formatted.endsWith('\n')) {
        formatted += '\n';
        if (!inJSXTag && !inJSXExpression) {
          formatted += indent.repeat(Math.max(0, indentLevel));
        }
      }
      continue;
    }
    
    // Handle spaces and tabs
    if (char === ' ' || char === '\t') {
      if (!formatted.endsWith(' ') && !formatted.endsWith('\n')) {
        formatted += ' ';
      }
      continue;
    }
    
    // Default case
    formatted += char;
  }
  
  // Apply TypeScript-specific formatting if needed
  if (isTypeScript) {
    formatted = formatted
      .replace(/:\s*([^,\s\n\)]+)/g, ': $1')
      .replace(/\s*=>\s*/g, ' => ')
      .replace(/\s*\|\s*/g, ' | ')
      .replace(/\s*&\s*/g, ' & ');
  }
  
  return formatted.trim();
}

function formatJSON(code: string, options: FormatterOptions): string {
  try {
    // First, try to parse the JSON to validate it
    const parsed = JSON.parse(code);
    
    // Use built-in JSON.stringify with proper indentation
    const indent = options.spaces ? options.indent : '\t';
    const formatted = JSON.stringify(parsed, null, indent);
    
    return formatted;
  } catch (error) {
    // If JSON is invalid, try to format it anyway with basic formatting
    return formatInvalidJSON(code, options);
  }
}

function formatInvalidJSON(code: string, options: FormatterOptions): string {
  const indent = options.spaces ? ' '.repeat(options.indent) : '\t';
  let formatted = '';
  let indentLevel = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];
    const prevChar = code[i - 1];
    
    // Handle strings
    if (!inString && (char === '"' || char === "'")) {
      // Only treat as string start if not escaped
      if (prevChar !== '\\') {
        inString = true;
        stringChar = char;
      }
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
    
    // Handle structural characters
    if (char === '{' || char === '[') {
      formatted += char;
      indentLevel++;
      if (nextChar !== '}' && nextChar !== ']') {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === '}' || char === ']') {
      if (prevChar !== '{' && prevChar !== '[') {
        formatted = formatted.trimEnd();
        formatted += '\n';
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indent.repeat(Math.max(0, indentLevel));
      } else {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      formatted += char;
      
      // Add newline after closing brace/bracket if there's more content
      if (nextChar && nextChar !== ',' && nextChar !== '}' && nextChar !== ']' && nextChar.trim()) {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === ',') {
      formatted += char;
      // Add newline after comma for better readability
      if (nextChar && nextChar.trim()) {
        formatted += '\n' + indent.repeat(Math.max(0, indentLevel));
      }
    } else if (char === ':') {
      formatted += char;
      // Add space after colon
      if (nextChar !== ' ') {
        formatted += ' ';
      }
    } else if (char === '\n' || char === '\r') {
      // Skip existing newlines, we'll add our own
      continue;
    } else if (char === ' ' || char === '\t') {
      // Skip existing whitespace, we'll add proper indentation
      if (!formatted.endsWith(' ') && !formatted.endsWith('\n')) {
        formatted += ' ';
      }
    } else {
      formatted += char;
    }
  }
  
  return formatted.trim();
}