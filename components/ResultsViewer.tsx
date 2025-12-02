import React, { useState } from 'react';
import { ExtractedData, ExtractionMode } from '../types';
import { FileText, Database, Code, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface ResultsViewerProps {
  data: ExtractedData;
  mode: ExtractionMode;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ data, mode }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' 
      ? JSON.stringify(data, null, 2) 
      : mode === 'text' ? data.rawText || '' : JSON.stringify(data, null, 2);
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderVisual = () => {
    if (mode === ExtractionMode.TEXT) {
      return (
        <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200">
          {data.rawText || "No text extracted."}
        </div>
      );
    }

    if (mode === ExtractionMode.FORMS) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {data.forms && data.forms.length > 0 ? (
            data.forms.map((field, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <span className="text-sm font-semibold text-gray-700 w-1/3 mr-4">{field.key}</span>
                <span className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded w-full sm:w-2/3 border border-gray-200 font-mono">
                  {field.value}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No form fields detected.</div>
          )}
        </div>
      );
    }

    if (mode === ExtractionMode.TABLES) {
      return (
        <div className="space-y-8 overflow-x-auto">
          {data.tables && data.tables.length > 0 ? (
            data.tables.map((table, tIdx) => (
              <div key={tIdx} className="min-w-full inline-block align-middle">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {table.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? "bg-gray-50" : ""}>
                          {row.map((cell, cIdx) => (
                            <td 
                              key={cIdx} 
                              className={clsx(
                                "px-4 py-3 text-sm border-r last:border-r-0 border-gray-100",
                                rIdx === 0 ? "font-semibold text-gray-900" : "text-gray-700"
                              )}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No tables detected.</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('visual')}
            className={clsx(
              "flex items-center text-sm font-medium transition-colors",
              activeTab === 'visual' ? "text-aws-blue" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {mode === 'text' ? <FileText className="w-4 h-4 mr-1.5" /> : <Database className="w-4 h-4 mr-1.5" />}
            Visual
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={clsx(
              "flex items-center text-sm font-medium transition-colors",
              activeTab === 'json' ? "text-aws-blue" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Code className="w-4 h-4 mr-1.5" />
            JSON
          </button>
        </div>
        
        <button 
          onClick={handleCopy}
          className="text-gray-500 hover:text-aws-blue transition-colors flex items-center text-xs"
        >
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto max-h-[600px]">
        {data.summary && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              AI Summary
            </h4>
            <p className="text-sm text-blue-900 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {activeTab === 'visual' ? (
          renderVisual()
        ) : (
          <pre className="text-xs sm:text-sm font-mono text-gray-800 bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};