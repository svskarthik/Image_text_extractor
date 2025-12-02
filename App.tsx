import React, { useState } from 'react';
import { 
  Scan, 
  Settings, 
  FileJson, 
  Table as TableIcon, 
  AlignLeft,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import { FileUploader } from './components/FileUploader';
import { Button } from './components/Button';
import { ResultsViewer } from './components/ResultsViewer';
import { ExtractionMode, FileData, ExtractedData } from './types';
import { extractDocumentData } from './services/geminiService';

const App = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [mode, setMode] = useState<ExtractionMode>(ExtractionMode.TEXT);
  const [summarize, setSummarize] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExtractedData | null>(null);

  const handleExtract = async () => {
    if (!fileData) return;
    
    setIsProcessing(true);
    setResult(null);

    try {
      const data = await extractDocumentData(fileData.file, mode, summarize);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to process document. See console for details." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-20">
      {/* Navigation Bar */}
      <nav className="bg-aws-dark text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-aws-orange p-1.5 rounded-md">
                <Scan className="h-6 w-6 text-aws-dark" />
              </div>
              <span className="ml-3 text-lg font-bold tracking-tight">Textract AI</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <span className="px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white border border-gray-700">
                  Dashboard
                </span>
                <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 cursor-not-allowed">
                  History
                </span>
                <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 cursor-not-allowed">
                  Settings
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <span className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded">
                 Serverless v2.5
               </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="w-full lg:w-1/3 space-y-6">
            
            {/* Upload Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="bg-aws-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  Input Document
                </h3>
              </div>
              <div className="p-5">
                <FileUploader 
                  selectedFile={fileData} 
                  onFileSelect={(f) => {
                    setFileData(f);
                    setResult(null); // Reset result on new file
                  }} 
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                   <span className="bg-aws-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                   Configuration
                </h3>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="p-5 space-y-6">
                
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Extraction Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMode(ExtractionMode.TEXT)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all",
                        mode === ExtractionMode.TEXT
                          ? "border-aws-orange bg-orange-50 text-aws-dark ring-1 ring-aws-orange"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <AlignLeft className={clsx("w-5 h-5 mb-2", mode === ExtractionMode.TEXT ? "text-aws-orange" : "text-gray-400")} />
                      Raw Text
                    </button>
                    <button
                      onClick={() => setMode(ExtractionMode.FORMS)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all",
                        mode === ExtractionMode.FORMS
                          ? "border-aws-orange bg-orange-50 text-aws-dark ring-1 ring-aws-orange"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <FileJson className={clsx("w-5 h-5 mb-2", mode === ExtractionMode.FORMS ? "text-aws-orange" : "text-gray-400")} />
                      Forms
                    </button>
                    <button
                      onClick={() => setMode(ExtractionMode.TABLES)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all",
                        mode === ExtractionMode.TABLES
                          ? "border-aws-orange bg-orange-50 text-aws-dark ring-1 ring-aws-orange"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <TableIcon className={clsx("w-5 h-5 mb-2", mode === ExtractionMode.TABLES ? "text-aws-orange" : "text-gray-400")} />
                      Tables
                    </button>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <Sparkles className="w-4 h-4 text-aws-blue mr-2" />
                        AI Summarization
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Generate a concise summary of the extracted content.
                      </span>
                    </div>
                    <button 
                      onClick={() => setSummarize(!summarize)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-aws-orange focus:ring-offset-2",
                        summarize ? 'bg-aws-blue' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          summarize ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                   <Button 
                    onClick={handleExtract} 
                    disabled={!fileData || isProcessing}
                    isLoading={isProcessing}
                    className="w-full h-12 text-base shadow-sm"
                   >
                     {isProcessing ? 'Processing Document...' : 'Start Extraction'}
                   </Button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-2">How it works</h4>
              <p className="text-xs text-blue-800 space-y-2">
                This tool uses advanced AI vision (Gemini 2.5 Flash) to replicate functionality similar to Amazon Textract.
                It identifies text lines, form key-value pairs, and tabular data from images instantly without complex backend infrastructure.
              </p>
            </div>

          </div>

          {/* Right Column: Results */}
          <div className="w-full lg:w-2/3 h-full min-h-[500px]">
             {result ? (
               <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Extraction Results</h3>
                    <span className="text-sm text-gray-500">Mode: <span className="font-semibold capitalize text-aws-dark">{mode}</span></span>
                  </div>
                  <ResultsViewer data={result} mode={mode} />
               </div>
             ) : (
               <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 border-dashed flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                 <div className="bg-gray-50 p-6 rounded-full mb-6">
                   <ArrowRight className="w-10 h-10 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                 <p className="text-gray-500 max-w-sm">
                   Upload a document on the left and click "Start Extraction" to see the AI analysis results here.
                 </p>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;