'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Trash2, Code } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

import { LanguageType } from '../types';
import { formatCode } from '../utils/formatter-utils';
import { getLanguageExtension, getLanguageDisplayName, SUPPORTED_LANGUAGES } from '../utils/codemirror-utils';

export default function JavaScriptFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<LanguageType>('javascript');
  const [indentSize, setIndentSize] = useState(2);
  const [useSpaces, setUseSpaces] = useState(true);

  const handleFormat = () => {
    const result = formatCode(input, {
      language,
      indent: indentSize,
      spaces: useSpaces
    });
    
    if (result.success) {
      setOutput(result.code);
    } else {
      setOutput(result.error || 'Unknown formatting error');
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
            <h1 className="text-4xl font-bold text-foreground">Code Formatter</h1>
          </div>
          <p className="text-lg text-muted-foreground">Format and beautify your JavaScript, TypeScript, and React code with ease</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center space-x-3">
                  <Label className="text-sm font-medium">
                    Language:
                  </Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as LanguageType)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {getLanguageDisplayName(lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <Label className="text-sm font-medium">
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
                <Button onClick={handleFormat} className="flex items-center gap-2">
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
                  Input {getLanguageDisplayName(language)}
                </Label>
                <div className="border border-border rounded-md overflow-auto">
                  <CodeMirror
                    value={input}
                    onChange={(value) => setInput(value)}
                    extensions={[getLanguageExtension(language)]}
                    theme={oneDark}
                    placeholder={`Paste your ${getLanguageDisplayName(language)} code here...`}
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
                    Formatted {getLanguageDisplayName(language)}
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
                <div className="border border-border rounded-md overflow-auto">
                  <CodeMirror
                    value={output}
                    editable={false}
                    extensions={[getLanguageExtension(language)]}
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