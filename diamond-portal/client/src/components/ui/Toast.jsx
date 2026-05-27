import { useToast } from '../../contexts/NotificationContext.jsx';

const TOAST_STYLES = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
};

const TOAST_ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export default function Toast() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.id} className={`${TOAST_STYLES[t.type]} rounded-xl px-4 py-3 shadow-lg flex items-center gap-3`}>
          <span>{TOAST_ICONS[t.type]}</span>
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-75 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}
