import { Copy, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const ResultCard = ({ imageUrl, extractedText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
          <FileText size={20} className="text-indigo-400" />
          <h3 className="font-semibold text-white">Original Image</h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900/50 flex items-center justify-center min-h-[300px]">
          <img src={imageUrl} alt="Uploaded" className="max-w-full max-h-[500px] object-contain" />
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-emerald-400" />
            <h3 className="font-semibold text-white">Extracted Text</h3>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex-1 rounded-lg bg-slate-900 border border-slate-700 p-4 font-mono text-sm text-slate-300 overflow-auto max-h-[500px] whitespace-pre-wrap">
          {extractedText}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
