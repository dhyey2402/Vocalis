import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 mt-4">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col">
        <span className="font-semibold text-sm">Error</span>
        <span className="text-sm mt-1">{error}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
