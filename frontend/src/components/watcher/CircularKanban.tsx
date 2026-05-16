import React from 'react';
import { CircularCard } from './CircularCard';

interface Props {
  title: string;
  status: string;
  circulars: any[];
  colorHint: string;
}

export const CircularKanban: React.FC<Props> = ({ title, status, circulars, colorHint }) => {
  const columnCirculars = circulars.filter(c => c.ingestion_status === status);

  return (
    <div className="flex flex-col bg-slate-100/50 rounded-xl p-4 border border-slate-200 h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorHint}`} />
          {title}
        </h3>
        <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full border shadow-sm">
          {columnCirculars.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 pb-4">
        {columnCirculars.map(circular => (
          <CircularCard key={circular.circular_id} circular={circular} />
        ))}
        {columnCirculars.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm italic">
            No circulars
          </div>
        )}
      </div>
    </div>
  );
};
