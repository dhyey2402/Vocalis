import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 py-3 px-4 rounded-sm flex items-start gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.1em]">Error</span>
      <span className="text-sm">{error}</span>
    </div>
  );
};

export default ErrorMessage;
