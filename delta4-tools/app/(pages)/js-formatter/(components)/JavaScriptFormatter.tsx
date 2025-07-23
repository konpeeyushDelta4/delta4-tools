'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Trash2, Code } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

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
    <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">JavaScript Formatter</h1>
          </div>
          <p className="text-lg text-muted-foreground">Format and beautify your JavaScript code with ease</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center space-x-3">
                  <Label htmlFor="indentSize" className="text-sm font-medium">
                    Indent Size:
                  </Label>
                  <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="useSpaces"
                    checked={useSpaces}
                    onCheckedChange={(checked) => setUseSpaces(checked as boolean)}
                  />
                  <Label htmlFor="useSpaces" className="text-sm font-medium cursor-pointer">
                    Use spaces instead of tabs
                  </Label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={formatJavaScript} className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Format
                </Button>
                <Button onClick={clearInput} variant="outline" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Input JavaScript
                </Label>
                <div className="border border-border rounded-md overflow-hidden">
                  <CodeMirror
                    value={input}
                    onChange={(value) => setInput(value)}
                    extensions={[javascript()]}
                    theme={oneDark}
                    placeholder="Paste your JavaScript code here..."
                    height="320px"
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: true,
                      highlightSelectionMatches: false,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Formatted JavaScript
                  </Label>
                  {output && (
                    <Button
                      onClick={copyOutput}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-primary hover:text-primary-dark"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <CodeMirror
                    value={output}
                    editable={false}
                    extensions={[javascript()]}
                    theme={oneDark}
                    placeholder="Formatted code will appear here..."
                    height="320px"
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                      bracketMatching: true,
                      closeBrackets: false,
                      autocompletion: false,
                      highlightSelectionMatches: false,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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