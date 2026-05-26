export default function Input({ label, error, id, ...props }) {
  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <input
        id={id}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white dark:border-gray-600 ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
