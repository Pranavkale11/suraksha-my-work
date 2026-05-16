import React from 'react';

interface Props {
  text: string;
}

export const ObligationHighlighter: React.FC<Props> = ({ text }) => {
  const highlightObligations = (input: string) => {
    // Regex to match words, case insensitive
    const regex = /\b(shall|must|should|may|recommended)\b/gi;
    
    // Split text by regex, keeping the matches
    const parts = input.split(regex);
    
    return parts.map((part, i) => {
      if (regex.test(part)) {
        const lower = part.toLowerCase();
        let colorClass = 'text-slate-800';
        let bgClass = 'bg-slate-100';
        
        if (lower === 'shall' || lower === 'must') {
          colorClass = 'text-[#DC2626] font-bold';
          bgClass = 'bg-[#DC2626]/10';
        } else if (lower === 'should') {
          colorClass = 'text-[#FF6B35] font-semibold';
          bgClass = 'bg-[#FF6B35]/10';
        } else if (lower === 'may') {
          colorClass = 'text-[#00A86B] font-semibold';
          bgClass = 'bg-[#00A86B]/10';
        } else if (lower === 'recommended') {
          colorClass = 'text-[#0047AB] font-semibold';
          bgClass = 'bg-[#0047AB]/10';
        }
        
        return (
          <span key={i} className={`px-1 rounded ${colorClass} ${bgClass}`}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return <>{highlightObligations(text)}</>;
};
