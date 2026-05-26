import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full ${sizeClasses[size]} max-h-[92vh] overflow-y-auto relative shadow-2xl`}>
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Κλείσιμο"
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-500"
          >✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
