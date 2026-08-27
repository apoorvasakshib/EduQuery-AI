import React from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';

export default function ProcessingPipeline({ currentStep = 'upload', hasOCR = false, error = null }) {
  const steps = [
    { key: 'upload', label: 'Upload' },
    { key: 'text_extraction', label: 'Text Extraction' },
    { key: 'ocr', label: 'OCR Check' },
    { key: 'chunking', label: 'Chunking' },
    { key: 'embedding', label: 'Embedding' },
    { key: 'indexing', label: 'Indexing' },
    { key: 'ready', label: 'Ready' },
  ];

  const getStepStatus = (stepKey) => {
    if (error) return 'error';
    const order = ['upload', 'text_extraction', 'ocr', 'chunking', 'embedding', 'indexing', 'ready'];
    const currentIdx = order.indexOf(currentStep);
    const stepIdx = order.indexOf(stepKey);

    if (stepIdx < currentIdx || currentStep === 'ready') return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Document Processing Pipeline
        </span>
        {currentStep === 'ready' ? (
          <span className="console-badge-processed text-[11px]">Status: Ready</span>
        ) : (
          <span className="console-badge-pending text-[11px]">Processing...</span>
        )}
      </div>

      {error ? (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Pipeline Error: {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-center">
          {steps.map((s) => {
            const status = getStepStatus(s.key);
            return (
              <div key={s.key} className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center">
                  {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  {status === 'active' && <Loader2 className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />}
                  {status === 'pending' && <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />}
                </div>
                <span
                  className={`text-[10px] font-mono leading-tight ${
                    status === 'completed'
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : status === 'active'
                      ? 'text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
