import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<Props> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer ${
        isDragging 
          ? 'border-canara-primary bg-canara-primary/5 scale-[1.02]' 
          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      
      <motion.div
        animate={isDragging ? { y: -10 } : { y: 0 }}
        className="flex flex-col items-center justify-center pointer-events-none"
      >
        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-canara-primary/10' : 'bg-slate-100'}`}>
          <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-canara-primary' : 'text-slate-500'}`} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Drop RBI/SEBI/CERT-In circular here
        </h3>
        <p className="text-slate-500 mb-6">Or click to browse your computer</p>
        
        <div className="flex gap-2 text-xs font-medium text-slate-500">
          <span className="px-2 py-1 bg-white rounded border shadow-sm flex items-center gap-1">
            <FileText className="w-3 h-3" /> PDF
          </span>
          <span className="px-2 py-1 bg-white rounded border shadow-sm flex items-center gap-1">
            <FileText className="w-3 h-3" /> DOCX
          </span>
          <span className="px-2 py-1 bg-white rounded border shadow-sm flex items-center gap-1">
            <FileText className="w-3 h-3" /> TXT
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-4">Maximum file size: 10MB</p>
      </motion.div>
    </div>
  );
};
