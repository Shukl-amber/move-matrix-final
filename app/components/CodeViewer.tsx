'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Download, Code } from 'lucide-react';
import { IGeneratedCode } from '@/lib/services/codeGenerationService';

interface CodeViewerProps {
  generatedCode: IGeneratedCode;
  onDownload?: () => void;
}

export default function CodeViewer({ generatedCode, onDownload }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  
  // Handle copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
  
  // Handle download code as file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCode.fullSourceCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedCode.moduleName}.move`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    if (onDownload) {
      onDownload();
    }
  };
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="bg-slate-950 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-slate-400" />
          <h3 className="text-white font-medium">{generatedCode.moduleName}.move</h3>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={() => handleCopy(generatedCode.fullSourceCode)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="ml-2">Download</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="full">
        <div className="bg-slate-900 border-b border-slate-800">
          <TabsList className="bg-transparent border-b border-slate-800">
            <TabsTrigger value="full" className="text-slate-400 data-[state=active]:text-white">
              Full Source
            </TabsTrigger>
            <TabsTrigger value="imports" className="text-slate-400 data-[state=active]:text-white">
              Imports
            </TabsTrigger>
            <TabsTrigger value="function" className="text-slate-400 data-[state=active]:text-white">
              Main Function
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="full" className="m-0">
          <pre className="bg-slate-950 p-4 text-slate-300 overflow-auto max-h-96">
            <code>{generatedCode.fullSourceCode}</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="imports" className="m-0">
          <pre className="bg-slate-950 p-4 text-slate-300 overflow-auto max-h-96">
            <code>{generatedCode.imports.join('\n')}</code>
          </pre>
        </TabsContent>
        
        <TabsContent value="function" className="m-0">
          <pre className="bg-slate-950 p-4 text-slate-300 overflow-auto max-h-96">
            <code>{generatedCode.sourceCode}</code>
          </pre>
        </TabsContent>
      </Tabs>
      
      <div className="bg-slate-900 p-4 border-t border-slate-800">
        <div className="text-sm text-slate-400">
          <p>This code creates a module that combines the selected primitives into a cohesive composition. 
          It can be deployed to the blockchain to create a reusable and composable DeFi strategy.</p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Code
          </Button>
        </div>
      </div>
    </div>
  );
} 