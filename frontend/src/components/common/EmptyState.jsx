import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'Get started by creating your first record.',
  actionText = null,
  onAction = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-700">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
