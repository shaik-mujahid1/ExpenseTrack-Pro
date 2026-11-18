import React from 'react';

export const LoadingSpinner = ({ text = 'Loading data...', fullHeight = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'min-h-[50vh]' : 'py-12'}`}>
      <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
      {text && <p className="mt-3 text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};
