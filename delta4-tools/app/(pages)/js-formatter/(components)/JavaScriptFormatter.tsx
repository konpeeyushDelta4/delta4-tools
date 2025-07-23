'use client';

import { useState } from 'react';

export default function JavaScriptFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [useSpaces, setUseSpaces] = useState(true);

  const formatJavaScript = () => {
    try {
      const formatted = formatJS(input, { indent: indentSize, spaces: useSpaces });
      setOutput(formatted);
    } catch (error) {
      setOutput(`Error formatting JavaScript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearInput = () => {
    setInput('');
    setOutput('');
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">JavaScript Formatter</h1>
          <p className="text-muted-foreground">Format and beautify your JavaScript code</p>
        </div>

        <div className="bg-card rounded-lg shadow-xl border border-border p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="indentSize" className="text-sm font-medium text-card-foreground">
                Indent Size:
              </label>
              <select
                id="indentSize"
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="bg-input border border-border text-foreground rounded px-2 py-1 text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useSpaces"
                checked={useSpaces}
                onChange={(e) => setUseSpaces(e.target.checked)}
                className="rounded bg-input border-border text-primary focus:ring-ring"
              />
              <label htmlFor="useSpaces" className="text-sm font-medium text-card-foreground">
                Use spaces instead of tabs
              </label>
            </div>

            <div className="flex space-x-2 ml-auto">
              <button
                onClick={formatJavaScript}
                className="bg-primary hover:bg-primary-dark text-primary-foreground px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Format
              </button>
              <button
                onClick={clearInput}
                className="bg-secondary hover:bg-muted text-secondary-foreground px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="input" className="block text-sm font-medium text-card-foreground">
                Input JavaScript:
              </label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JavaScript code here..."
                className="w-full h-64 p-3 bg-input border border-border text-foreground rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="output" className="block text-sm font-medium text-card-foreground">
                  Formatted JavaScript:
                </label>
                {output && (
                  <button
                    onClick={copyOutput}
                    className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
              <textarea
                id="output"
                value={output}
                readOnly
                placeholder="Formatted code will appear here..."
                className="w-full h-64 p-3 bg-input border border-border text-foreground rounded-md font-mono text-sm resize-none placeholder-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatJS(code: string, options: { indent: number; spaces: boolean }): string {
  if (!code.trim()) return '';

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