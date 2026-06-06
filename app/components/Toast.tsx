'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = 
    type === 'success' ? 'bg-[#2E8B57]' : 
    type === 'error' ? 'bg-red-600' : 'bg-[#1E3A5F]';

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">×</button>
    </div>
  );
}